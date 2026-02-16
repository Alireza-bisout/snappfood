import { FileFieldsInterceptor, FileInterceptor } from "@nestjs/platform-express"
import { MulterField } from "@nestjs/platform-express/multer/interfaces/multer-options.interface"
import { memoryStorage } from "multer"

export const UploadFileS3 = (fildName: string) => {
    return class UploadUtility extends FileInterceptor(fildName, {
        storage: memoryStorage()
    }) { }
}

export const UploadFileFildsS3 = (uploadFields: MulterField[]) => {
    return class UplooadUtility extends FileFieldsInterceptor(uploadFields, {
        storage: memoryStorage()
    }) { }
}