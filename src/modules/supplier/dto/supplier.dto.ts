import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsIdentityCard, IsMobilePhone, Length } from "class-validator";

export class SupplierSignupDto {
    @ApiProperty()
    categoryId: number;

    @Length(3, 50)
    @ApiProperty()
    store_name: string;

    @ApiProperty()
    city: string;

    @Length(3, 50)
    @ApiProperty()
    manager_name: string;

    @Length(3, 50)
    @ApiProperty()
    manager_family: string;

    @IsMobilePhone("fa-IR", {}, { message: "mobile number is invalid" })
    @ApiProperty()
    phone: string;

    @ApiProperty()
    invite_code: string;
}

export class SupplementaryInformationDto {
    @ApiProperty()
    @IsEmail()
    email: string

    @ApiProperty()
    @IsIdentityCard("IR", { message: "natinoal code is invalid" })
    natinoal_code: string
}

export class UploadDocumentsDto {
    @ApiProperty({ format: "binary" })
    accepted_documents: string

    @ApiProperty({ format: "binary" })
    image: string
}