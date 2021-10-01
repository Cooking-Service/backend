import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Branch } from 'src/branches/schemas/branch.schema';
import { Status } from 'src/common/schemas/base.schema';
import {
  BranchProduct,
  BranchProductDocument,
} from './schemas/branches-products.schema';
import { Product, ProductDocument } from './schemas/product.schema';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    @InjectModel(BranchProduct.name)
    private branchProductModel: Model<BranchProductDocument>,
  ) {}

  /**
   *
   * @param id mongoId to find product.
   * @param branch mongoId | branchObject to find branchProduct status.
   * @returns if product is availbale it will be returned, else return null.
   */
  async getProductAvailable(id: string, branch?: Branch): Promise<Product> {
    const product = await this.productModel.findById(id).select({
      name: 1,
      price: 1,
      description: 1,
      company: 1,
    });

    if (!product) {
      return null;
    }

    if (product.status === Status.INACTIVE) {
      return null;
    }

    if (branch) {
      if (branch.company.toString() !== product.company.toString()) {
        return null;
      }

      const branchProduct = await this.branchProductModel.findOne({
        product,
        branch,
      });

      if (branchProduct?.status === Status.INACTIVE) {
        return null;
      }
    }

    return product;
  }
}
