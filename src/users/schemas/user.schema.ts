import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Document } from 'mongoose';
import { Base, Status } from 'src/common/schemas/base.schema';
import { Company } from 'src/companies/schemas/company.schema';

export type UserDocument = User & Document;

export enum UserRoles {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  OBSERVER = 'OBSERVER',
  EMPLOYEE = 'EMPLOYEE',
}

/**
 * To create an avatar for user, is necesary to concat 'name+lastName'.
 */
export const avatarURL =
  'https://ui-avatars.com/api/?format=svg&background=random&name=';

@Schema()
export class User extends Base {
  @Prop({
    required: true,
  })
  name: string;

  @Prop()
  lastName: string;

  @Prop({
    unique: true,
  })
  username: string;

  @Prop({
    unique: true,
  })
  email: string;

  @Prop()
  password: string;

  @Prop()
  avatar: string;

  @Prop({
    type: [String],
    enum: UserRoles,
  })
  roles: string[];

  @Prop({ type: String, default: Status.INACTIVE })
  status: string;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
  })
  company: Company;
}

export const UserSchema = SchemaFactory.createForClass(User);
