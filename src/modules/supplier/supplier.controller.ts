import { Controller, Post, Body, UseInterceptors, Put, UploadedFiles } from '@nestjs/common';
import { SupplierService } from './supplier.service';
import { SupplementaryInformationDto, SupplierSignupDto, UploadDocumentsDto } from './dto/supplier.dto';
import { CheckOtpDto } from '../auth/dto/otp.dto';
import { SupplierAuth } from 'src/common/decorators/auth.decorator';
import { max } from 'class-validator';
import { UploadFileFildsS3 } from 'src/common/interceptors/upload-file.interceptor';
import { ApiConsumes } from '@nestjs/swagger';
import { SwaggerConsumes } from 'src/common/enum/swagger-consume.enums';

@Controller('supplier')
export class SupplierController {
  constructor(private readonly supplierService: SupplierService) { }

  @Post("/signup")
  signup(@Body() supplierSignupDto: SupplierSignupDto) {
    return this.supplierService.signup(supplierSignupDto)
  }

  @Post("/check-otp")
  checkOtp(@Body() checkOtpDto: CheckOtpDto) {
    return this.supplierService.checkOtp(checkOtpDto)
  }

  @Post("/supplementry-information")
  @SupplierAuth()
  supplementryInformation(@Body() infoDto: SupplementaryInformationDto) {
    return this.supplierService.SaveSupplementaryInformationDto(infoDto)
  }

  @Put("/upload-documents")
  @ApiConsumes(SwaggerConsumes.MultipartData)
  @SupplierAuth()
  @UseInterceptors(UploadFileFildsS3([
    {
      name: "accepted_documents",
      maxCount: 1,
    },
    {
      name: "image",
      maxCount: 1,
    },
  ]))
  uploadDocuments(@Body() uploadDocumentsDto: UploadDocumentsDto, @UploadedFiles() files: any) {
    return this.supplierService.uploadDocuments(files)
  }
}
