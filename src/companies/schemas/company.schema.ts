import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Document } from 'mongoose';
import { Base } from 'src/common/schemas/base.schema';
import { User } from 'src/users/schemas/user.schema';

export type CompanyDocument = Company & Document;

@Schema()
export class Company extends Base {
  @Prop({
    unique: true,
  })
  name: string;

  @Prop()
  logo: string;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  })
  createdBy: User;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  })
  updatedBy: User;
}

export const CompanySchema = SchemaFactory.createForClass(Company);
