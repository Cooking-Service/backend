import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Model } from 'mongoose';
import { BranchesUsersService } from 'src/branches-users/branches-users.service';
import { BranchesService } from 'src/branches/branches.service';
import { ResponseDto } from 'src/common/dto/response.dto';
import { ProductsService } from 'src/products/products.service';
import { User, UserRoles } from 'src/users/schemas/user.schema';
import { CreateOrderDto } from './dto/orders.dto';
import {
  Order,
  OrderDocument,
  OrderItem,
  OrdersStatuses,
} from './schemas/order.schema';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name)
    private orderModel: Model<OrderDocument>,
    @InjectConnection() private connection: mongoose.Connection,
    private branchesService: BranchesService,
    private branchesUsersService: BranchesUsersService,
    private productsService: ProductsService,
  ) {}

  async create(
    createOrderDto: CreateOrderDto,
    createdBy: User,
  ): Promise<ResponseDto<Order>> {
    const session = await this.connection.startSession();
    session.startTransaction();
    try {
      const { items, table, customer, branch: branchId } = createOrderDto;

      // find branch and verify if exists
      const branch = await this.branchesService.findBranch(branchId);

      if (!branch) {
        await session.abortTransaction();
        throw new NotFoundException('Branch Not Found.');
      }

      // verify if user have permissions to create orders
      if (createdBy.roles.includes(UserRoles.EMPLOYEE)) {
        const permissions =
          await this.branchesUsersService.getEmployeePermissions(
            createdBy['_id'],
            branchId,
          );

        if (!permissions?.orderStatuses.includes(OrdersStatuses.OPEN)) {
          throw new ForbiddenException();
        }
      }

      if (
        createdBy.roles.includes(UserRoles.ADMIN) &&
        createdBy.company.toString() !== branch.company.toString()
      ) {
        throw new ForbiddenException();
      }

      if (!items) {
        // To iterate over items and verify if each its available or exist.
        await session.abortTransaction();
        return {
          success: false,
          message: '',
        };
      }

      let productError = false;

      const orderItems: OrderItem[] = await Promise.all(
        items.map(async (item) => {
          const product = await this.productsService.getProductAvailable(
            item.product,
            branch,
          );

          if (product) {
            return {
              product,
              comments: item.comments,
            };
          }
          productError = true;
        }),
      );

      if (productError) {
        await session.abortTransaction();

        return {
          success: false,
          message:
            "Some product doesn't available please verify your order and try again.",
        };
      }

      // create order
      const order = new this.orderModel();

      order.branch = branch;
      order.createdBy = createdBy;
      order.createdOn = new Date();
      order.customer = customer;
      order.items = orderItems;

      await order.save({ session });

      await session.commitTransaction();
      return {
        success: true,
        message: 'Order Successfully Created.',
        response: order,
      };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }
}
