import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Base } from 'src/common/schemas/base.schema';

export type ComplementDocument = Complement & mongoose.Document;

@Schema()
export class Complement extends Base {
  @Prop()
  name: string;

  @Prop()
  price: number;
}

export const ComplementSchema = SchemaFactory.createForClass(Complement);
