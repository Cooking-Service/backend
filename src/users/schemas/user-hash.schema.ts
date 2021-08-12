import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { User } from './user.schema';

export type UserHashDocument = UserHash & mongoose.Document;

export enum HashType {
  ACTIVE_ACCOUNT = 'ACTIVE_ACCOUNT',
  RECOVERY_PASSWORD = 'RECOVERY_PASSWORD',
}

@Schema({
  versionKey: false,
})
export class UserHash {
  @Prop({
    required: true,
    unique: true,
  })
  hash: string;

  @Prop({
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  })
  user: User;

  @Prop({
    required: true,
    type: String,
    enum: HashType,
  })
  type: string;

  @Prop({
    required: true,
  })
  createdOn: Date;

  @Prop({
    default: null,
  })
  usedOn: Date;
}

export const UserHashSchema = SchemaFactory.createForClass(UserHash);
