import { Prop, Schema } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Base } from 'src/common/schemas/base.schema';
import { Company } from 'src/companies/schemas/company.schema';
import { Complement } from './complement.schema';

export type ProductDocument = Product & mongoose.Document;

@Schema()
export class Product extends Base {
  @Prop({ unique: true })
  name: string;

  @Prop()
  price: number;

  @Prop()
  description: string;

  @Prop({
    type: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Complement',
      },
    ],
  })
  complements: Complement[];

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
  })
  company: Company;
}
