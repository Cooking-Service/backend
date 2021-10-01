import {
  Body,
  Controller,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { Roles } from 'src/auth/roles.decorator';
import { CurrentUser } from 'src/auth/user.guard';
import { User, UserRoles } from 'src/users/schemas/user.schema';
import { CreateOrderDto } from './dto/orders.dto';
import { OrdersService } from './orders.service';

@Controller('orders')
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  @Post()
  @UsePipes(
    new ValidationPipe({
      whitelist: true,
    }),
  )
  @Roles(UserRoles.SUPER_ADMIN, UserRoles.ADMIN, UserRoles.EMPLOYEE)
  async create(
    @Body() createOrderDto: CreateOrderDto,
    @CurrentUser() currentUser: User,
  ) {
    return await this.ordersService.create(createOrderDto, currentUser);
  }
}
