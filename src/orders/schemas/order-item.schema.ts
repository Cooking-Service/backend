import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Complement } from 'src/products/schemas/complement.schema';
import { Product } from 'src/products/schemas/product.schema';

export type OrderItemDocument = OrderItem & mongoose.Document;

@Schema()
export class OrderItem {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
  })
  product: Product;

  @Prop()
  comments: string;

  @Prop({
    type: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Complement',
      },
    ],
  })
  complements: Complement[];
}

export const OrderItemSchema = SchemaFactory.createForClass(OrderItem);
