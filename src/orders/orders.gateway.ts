import { UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Sender } from 'src/auth/sender.decorator';
import { User } from 'src/users/schemas/user.schema';
import { OrdersService } from './orders.service';
import { SocketJwtGuard } from 'src/auth/socket-jwt.guard';

@UseGuards(SocketJwtGuard)
@WebSocketGateway()
export class OrdersGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    private ordersService: OrdersService,
    private jwtService: JwtService,
  ) {}

  @WebSocketServer()
  server: Server;

  async handleConnection(socket: Socket) {
    try {
      const token: any = socket.handshake.query.token;
      const payload = await this.jwtService.verifyAsync(token);

      // traer las branchesUser del usuario
      // traer los permisos de las branches
      // hacer join a rooms ceradas a aprtir del id de la branch y el permiso
    } catch (error) {
      socket.disconnect();
    }
  }

  async handleDisconnect(socket: Socket) {
    console.log(`me desconecte ${socket.id}`);
  }

  @SubscribeMessage('cook-order')
  async cookOrder(
    @MessageBody() data: string,
    @ConnectedSocket() socket: Socket,
    @Sender() sender: User,
  ) {
    socket.emit('cook-order', 'hola perro');
    return data;
  }

  @SubscribeMessage('charge-order')
  async collectOrder(
    @MessageBody() data: string,
    @ConnectedSocket() socket: Socket,
  ) {}

  @SubscribeMessage('deliver-order')
  async deliverOrder(
    @MessageBody() data: string,
    @ConnectedSocket() socket: Socket,
  ) {}
}
