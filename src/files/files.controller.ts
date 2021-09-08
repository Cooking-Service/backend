import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { InjectS3, S3 } from 'nestjs-s3';
import { Roles } from 'src/auth/roles.decorator';
import { UserRoles } from 'src/users/schemas/user.schema';
import { FilesService } from './files.service';
import { CollectionTypes, ResourceTypes } from './schemas/file.schema';

@Controller('files')
export class FilesController {
  constructor(private service: FilesService, @InjectS3() s3: S3) {}

  @Post('upload-test')
  @UseInterceptors(FileInterceptor('file'))
  @Roles(UserRoles.SUPER_ADMIN)
  async uploadTest(@UploadedFile() file: Express.Multer.File) {
    await this.service.uploadFile(file, {
      resourceType: ResourceTypes.AVATAR,
      collectionType: CollectionTypes.USERS,
      documentId: '6109fe016afa4d28ec0e01d8',
    });
  }
}
