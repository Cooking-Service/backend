import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Branch } from 'src/branches/schemas/branch.schema';
import { Status } from 'src/common/types/enums';
import { Product } from './product.schema';

export type BranchProductDocument = BranchProduct & mongoose.Document;

@Schema({
  versionKey: false,
})
export class BranchProduct {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Branch',
  })
  branch: Branch;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
  })
  product: Product;

  @Prop({
    type: String,
    enum: Status,
  })
  status: string;
}

export const BranchProductSchema = SchemaFactory.createForClass(BranchProduct);
