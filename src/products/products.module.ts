import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import {
  BranchProduct,
  BranchProductSchema,
} from './schemas/branches-products.schema';
import { Complement, ComplementSchema } from './schemas/complement.schema';
import { Product, ProductSchema } from './schemas/product.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Product.name,
        schema: ProductSchema,
      },
      {
        name: Complement.name,
        schema: ComplementSchema,
      },
      {
        name: BranchProduct.name,
        schema: BranchProductSchema,
      },
    ]),
  ],
  providers: [ProductsService],
  controllers: [ProductsController],
  exports: [ProductsService],
})
export class ProductsModule {}
