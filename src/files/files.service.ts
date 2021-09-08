import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import * as md5 from 'md5';
import { Model } from 'mongoose';
import { InjectS3, S3 } from 'nestjs-s3';
import * as path from 'path';
import { UploadFileDto } from './dto/files.dto';
import { File, FileDocument } from './schemas/file.schema';

@Injectable()
export class FilesService {
  constructor(
    @InjectModel(File.name) private fileModel: Model<FileDocument>,
    @InjectS3() private s3: S3,
    private config: ConfigService,
  ) {}

  async uploadFile(file: Express.Multer.File, uploadFileDto: UploadFileDto) {
    const { collectionType, documentId, resourceType } = uploadFileDto;

    const encryptedName = md5(
      `${file.originalname}${collectionType}${documentId}`,
    );
    const extension = path.extname(file.originalname).replace('.', '');
    const name = `${resourceType}-${documentId}`;

    const s3Response = await this.s3
      .upload({
        Bucket: this.config.get('AWS_BUCKET_NAME'),
        Key: `${resourceType}/${encryptedName}`,
        ContentType: file.mimetype,
        Body: file.buffer,
      })
      .promise()
      .catch(() => {
        throw new InternalServerErrorException();
      });

    const newFile = new this.fileModel();

    newFile.name = name;
    newFile.path = s3Response.Location;
    newFile.encryptedName = encryptedName;
    newFile.mimeType = file.mimetype;
    newFile.extension = extension;
    newFile.collectionType = collectionType;
    newFile.documentId = documentId;
    newFile.resourceType = resourceType;

    return await newFile.save();
  }
}
