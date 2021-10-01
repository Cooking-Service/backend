import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Document } from 'mongoose';
import { UserRoles, UserStatus } from 'src/common/types/enums';
import { Company } from 'src/companies/schemas/company.schema';

export type UserDocument = User & Document;

@Schema({ versionKey: false })
export class User {
  @Prop({
    required: true,
  })
  firstName: string;

  @Prop({
    required: true,
  })
  lastName: string;

  @Prop({
    required: true,
    unique: true,
  })
  username: string;

  @Prop({
    required: true,
    unique: true,
  })
  email: string;

  @Prop({
    select: false,
    default: null,
  })
  password: string;

  @Prop({
    default: null,
  })
  avatar: string;

  @Prop({
    type: [String],
    enum: UserRoles,
    default: null,
  })
  roles: string[];

  @Prop({
    type: String,
    enum: UserStatus,
    default: UserStatus.PENDINDG,
  })
  status: string;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    default: null,
  })
  company: Company;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  })
  createdBy: User;

  @Prop({
    default: null,
  })
  createdOn: Date;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  })
  updatedBy: User;

  @Prop({
    default: null,
  })
  updatedOn: Date;

  @Prop({
    default: null,
  })
  lastLogin: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
