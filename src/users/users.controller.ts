import {
  Body,
  Controller, Post,
  UsePipes,
  ValidationPipe
} from '@nestjs/common';
import { Roles } from 'src/auth/roles.decorator';
import { CurrentUser } from 'src/auth/user.guard';
import { CurrentUserDto } from 'src/common/dto/current-user.dto';
import { ResponseDto } from 'src/common/dto/response.dto';
import { RegisterUserDto } from './dto/users.dto';
import { User, UserRoles } from './schemas/user.schema';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private service: UsersService) {}

  @Post()
  @UsePipes(
    new ValidationPipe({
      forbidNonWhitelisted: true,
    }),
  )
  @Roles(UserRoles.SUPER_ADMIN, UserRoles.ADMIN)
  async registerUser(
    @Body() registerUserDto: RegisterUserDto,
    @CurrentUser() currentUser: CurrentUserDto,
  ): Promise<ResponseDto<User>> {
    console.log(currentUser);
    return;
  }
}
