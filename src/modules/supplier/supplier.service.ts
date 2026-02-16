import { BadRequestException, ConflictException, Inject, Injectable, NotFoundException, Scope, UnauthorizedException } from '@nestjs/common';
import { SupplementaryInformationDto, SupplierSignupDto } from './dto/supplier.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { SupplierEntity } from './entities/supplier.entity';
import { Repository } from 'typeorm';
import { CategoryService } from '../category/category.service';
import { SupplierOTPEntity } from './entities/supplier-otp.entity';
import { randomInt } from 'crypto';
import { CheckOtpDto } from '../auth/dto/otp.dto';
import { TokensPayload } from '../auth/types/payload';
import { JwtService } from '@nestjs/jwt';
import { REQUEST } from '@nestjs/core';
import type { Request } from 'express';
import { SupplierStatus } from './enum/status.enum';
import { DocumentType } from './types/type';
import { S3Service } from '../s3/s3.service';
import { FolderImage } from 'src/common/enum/folder-image.enum';

@Injectable(({ scope: Scope.REQUEST }))
export class SupplierService {
  constructor(
    @InjectRepository(SupplierEntity) private supplierRepository: Repository<SupplierEntity>,
    @InjectRepository(SupplierOTPEntity) private supplierOtpRepository: Repository<SupplierOTPEntity>,
    private categoryService: CategoryService,
    private jwtService: JwtService,
    private S3Service: S3Service,
    @Inject(REQUEST) private req: Request
  ) { }


  async signup(signupDto: SupplierSignupDto) {
    const { categoryId, city, invite_code, manager_family, manager_name, phone, store_name } = signupDto
    const supplier = await this.supplierRepository.findOneBy({ phone })
    if (supplier) throw new Error("Supplier already exists")
    const category = await this.categoryService.findOneById(categoryId)

    let agent: SupplierEntity | null = null
    if (invite_code) {
      agent = await this.supplierRepository.findOneBy({ invite_code })

    }
    const mobileNumber = parseInt(phone)
    const account = this.supplierRepository.create({
      manager_name,
      manager_family,
      phone,
      categoryId: category.id,
      city,
      store_name,
      agentId: agent?.id ?? null,
      invite_code: mobileNumber.toString(32).toUpperCase(),

    })
    await this.supplierRepository.save(account)
    await this.createOtpForSupplier(account)
    return {
      message: "otp code sent successfully"
    }
  }

  async checkOtp(otpDto: CheckOtpDto) {
    const { code, mobile } = otpDto;
    const now = new Date();
    const supplier = await this.supplierRepository.findOne({
      where: { phone: mobile },
      relations: {
        otp: true,
      },
    });
    if (!supplier || !supplier?.otp)
      throw new UnauthorizedException("Not Found Account");
    const otp = supplier?.otp;
    if (otp?.code !== code)
      throw new UnauthorizedException("Otp code is incorrect");
    if (otp.expires_in < now)
      throw new UnauthorizedException("Otp Code is expired");
    if (!supplier.mobile_verify) {
      await this.supplierRepository.update(
        { id: supplier.id },
        {
          mobile_verify: true,
        }
      );
    }
    const { accessToken, refreshToken } = this.makeTokens({
      id: supplier.id,
      mobile,
    });
    return {
      accessToken,
      refreshToken,
      message: "You logged-in successfully",
    };
  }

  async createOtpForSupplier(supplier: SupplierEntity) {
    const expiresIn = new Date(new Date().getTime() + 1000 * 60 * 2);
    const code = randomInt(10000, 99999).toString();
    let otp = await this.supplierOtpRepository.findOneBy({
      supplier: { id: supplier.id }
    });
    if (otp) {
      if (otp.expires_in > new Date()) {
        throw new BadRequestException("otp code not expired");
      }
      otp.code = code;
      otp.expires_in = expiresIn;
    } else {
      otp = this.supplierOtpRepository.create({
        code,
        expires_in: expiresIn,
        supplier: supplier
      });
    }
    otp = await this.supplierOtpRepository.save(otp);
    supplier.otpId = otp.id;
    await this.supplierRepository.save(supplier);
  }

  async SaveSupplementaryInformationDto(infoDto: SupplementaryInformationDto) {
    const { id } = this.req.user
    const { natinoal_code, email } = infoDto
    let supplier = await this.supplierRepository.findOneBy({ natinoal_code })
    if (supplier && supplier.id !== id) {
      throw new ConflictException("national code already exists")
    }
    supplier = await this.supplierRepository.findOneBy({ email })
    if (supplier && supplier.id !== id) {
      throw new ConflictException("email already exists")
    }
    await this.supplierRepository.update({ id }, { natinoal_code, email, status: SupplierStatus.SupplementaryInformation })
    return {
      message: "information saved successfully"
    }
  }

  async uploadDocuments(files: DocumentType) {
    const { id } = this.req.user
    const { accepted_documents, image } = files

    // ۱. اول چک کن یوزر هست یا نه
    let supplier = await this.supplierRepository.findOneBy({ id })
    if (!supplier) {
      throw new NotFoundException('تامین کننده یافت نشد');
    }

    // ۲. حالا آپلود کن
    const imageResult = await this.S3Service.uploadFile(image[0], FolderImage.images)
    const documentsResult = await this.S3Service.uploadFile(accepted_documents[0], FolderImage.images)

    // ۳. مقادیر را ست کن (دیگر ارور نمی‌دهد)
    if (imageResult) supplier.image = imageResult.Location
    if (documentsResult) supplier.documents = documentsResult.Location

    supplier.status  = SupplierStatus.UploadedDocument
    // ۴. تغییرات را در دیتابیس ذخیره کن (معمولا لازمه)
    await this.supplierRepository.save(supplier);

    return {
      message: "documents uploaded successfully"
    }
  }

  makeTokens(payload: TokensPayload) {
    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.ACCESS_TOKEN_SECRET,
      expiresIn: "30d",
    });
    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.REFRESH_TOKEN_SECRET,
      expiresIn: "1y",
    });
    return {
      accessToken,
      refreshToken,
    };
  }

  async validateAccessToken(token: string) {
    try {
      const payload = this.jwtService.verify<TokensPayload>(token, {
        secret: process.env.ACCESS_TOKEN_SECRET,
      });
      if (typeof payload === "object" && payload?.id) {
        const user = await this.supplierRepository.findOneBy({ id: payload.id });
        if (!user) {
          throw new UnauthorizedException("login on your account ");
        }
        return user;
      }
      throw new UnauthorizedException("login on your account ");
    } catch (error) {
      throw new UnauthorizedException("login on your account ");
    }
  }

}
