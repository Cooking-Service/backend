import {
  Body,
  Controller,
  Get,
  Post,
  UsePipes,
  ValidationPipe
} from '@nestjs/common';
import { Roles } from 'src/auth/roles.decorator';
import { RegisterUserDto } from './dto/users.dto';
import { User, UserRoles } from './schemas/user.schema';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private service: UsersService) {}

  @Get()
  @Roles(UserRoles.ADMIN)
  async getUsers() {
    return 'hola';
  }

  @Post()
  @UsePipes(
    new ValidationPipe({
      forbidNonWhitelisted: true,
    }),
  )
  async registerUser(
    @Body() registerUserDto: RegisterUserDto,
  ): Promise<ResponseDto<User>> {
    return await this.service.create(registerUserDto);
  }
}
