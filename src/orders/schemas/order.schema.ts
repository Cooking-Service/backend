import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Branch } from 'src/branches/schemas/branch.schema';
import { Product } from 'src/products/schemas/product.schema';
import { Table } from 'src/tables/schemas/table.schema';
import { User } from 'src/users/schemas/user.schema';

export type OrderDocument = Order & mongoose.Document;

export enum OrdersStatuses {
  OPEN = 'OPEN',
  COOKING = 'COOKING',
  PENDING = 'PENDING',
  CLOSED = 'CLOSED',
  CANCELLED = ' CANCELLED',
}

export type OrderItem = {
  product: Product;
  comments?: string;
};

@Schema({
  versionKey: false,
})
export class Order {
  @Prop({ default: null })
  customer: string;

  @Prop({ default: null })
  total: number;

  @Prop({
    type: String,
    enum: OrdersStatuses,
    default: OrdersStatuses.OPEN,
  })
  status: string;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Table',
    default: null,
  })
  table: Table;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Branch',
    required: true,
  })
  branch: Branch;

  @Prop({
    type: [mongoose.Schema.Types.Mixed],
    default: [],
  })
  items: OrderItem[];

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  })
  createdBy: User;

  @Prop({ default: null })
  createdOn: Date;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  })
  cookedBy: User;

  @Prop({ default: null })
  cookedOn: Date;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  })
  chargedBy: User;

  @Prop({ default: null })
  chargedOn: Date;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
