import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Document } from 'mongoose';

export type FileDocument = File & Document;

export enum CollectionTypes {
  USERS = 'users',
  COMPANIES = 'companies',
}

export enum ResourceTypes {
  AVATAR = 'avatar',
  LOGO = 'logo',
}

@Schema({ versionKey: false })
export class File {
  @Prop()
  name: string;

  @Prop()
  path: string;

  @Prop()
  extension: string;

  @Prop()
  encryptedName: string;

  @Prop()
  mimeType: string;

  @Prop({
    type: String,
    enum: CollectionTypes,
  })
  collectionType: string;

  @Prop({
    type: String,
    enum: ResourceTypes,
  })
  resourceType: string;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    default: null,
  })
  documentId: string;
}

export const FileSchema = SchemaFactory.createForClass(File);
