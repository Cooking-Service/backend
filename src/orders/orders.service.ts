import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { OrderItem, OrderItemDocument } from './schemas/order-item.schema';
import { Order, OrderDocument } from './schemas/order.schema';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name)
    private orderModel: Model<OrderDocument>,
    @InjectModel(OrderItem.name)
    private orderItemModel: Model<OrderItemDocument>,
  ) {}
}
