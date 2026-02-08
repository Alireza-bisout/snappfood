import { FileInterceptor } from "@nestjs/platform-express"
import { memoryStorage } from "multer"

export const UploadFileS3 = (fildName: string) => {
    return class UploadUtility extends FileInterceptor(fildName, {
        storage: memoryStorage()
    }) { }
}