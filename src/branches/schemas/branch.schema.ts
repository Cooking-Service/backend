import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Document } from 'mongoose';
import { Base } from 'src/common/schemas/base.schema';
import { Company } from 'src/companies/schemas/company.schema';
import { User } from 'src/users/schemas/user.schema';

export type BranchDocument = Branch & Document;

@Schema()
export class Branch extends Base {
  @Prop()
  name: string;

  @Prop()
  latitude: string;

  @Prop()
  longitude: string;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
  })
  company: Company;
}

export const BranchSchema = SchemaFactory.createForClass(Branch);
