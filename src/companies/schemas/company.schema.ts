import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Base } from 'src/common/schemas/base.schema';

export type CompanyDocument = Company & Document;

@Schema({
  versionKey: false,
})
export class Company extends Base {
  @Prop({
    required: true,
    unique: true,
  })
  name: string;

  @Prop({
    required: true,
    unique: true,
  })
  code: string;

  @Prop({
    default: null,
  })
  logo: string;
}

export const CompanySchema = SchemaFactory.createForClass(Company);
