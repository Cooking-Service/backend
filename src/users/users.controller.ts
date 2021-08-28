import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { Roles } from 'src/auth/roles.decorator';
import { SkipAuth } from 'src/auth/skip-auth.decorator';
import { CurrentUser } from 'src/auth/user.guard';
import { ResponseDto } from 'src/common/dto/response.dto';
import {
  ActivateAccountDto,
  GroupsValidation,
  ModifyPasswordDto,
  ModifyUserDto,
  RegisterUserDto,
  UserFiltersDto,
} from './dto/users.dto';
import { User, UserRoles } from './schemas/user.schema';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private service: UsersService) {}

  @Get()
  @Roles(UserRoles.SUPER_ADMIN, UserRoles.ADMIN, UserRoles.OBSERVER)
  async userList(
    @Query() filters: UserFiltersDto,
    @CurrentUser() currentUser: User,
  ): Promise<ResponseDto<any>> {
    if (
      currentUser.roles.includes(UserRoles.ADMIN) ||
      currentUser.roles.includes(UserRoles.OBSERVER)
    ) {
      const company: any = currentUser.company;
      filters.company = company;
    }

    return await this.service.getUserList(filters);
  }

  @Get('profile')
  async profile(@CurrentUser() currentUser: User): Promise<ResponseDto<User>> {
    return await this.service.getProfile(currentUser.username);
  }

  @Get(':id')
  @Roles(UserRoles.SUPER_ADMIN, UserRoles.ADMIN, UserRoles.OBSERVER)
  async getUser(
    @Param('id') id: string,
    @CurrentUser() currentUser: User,
  ): Promise<ResponseDto<User>> {
    const user = await this.service.getUserById(id);

    if (
      currentUser.roles.includes(UserRoles.ADMIN) ||
      currentUser.roles.includes(UserRoles.OBSERVER)
    ) {
      const company: any = currentUser.company;
      if (user.response.company['_id'] !== company) {
        throw new NotFoundException('User Not Found.');
      }
    }

    return user;
  }

  @Post()
  @UsePipes(
    new ValidationPipe({
      forbidNonWhitelisted: true,
    }),
  )
  @Roles(UserRoles.SUPER_ADMIN, UserRoles.ADMIN)
  async register(
    @Body() registerUserDto: RegisterUserDto,
    @CurrentUser() currentUser: User,
  ): Promise<ResponseDto<User>> {
    const company: any = currentUser.company;
    if (currentUser.roles.includes(UserRoles.SUPER_ADMIN)) {
      if (registerUserDto.roles.includes(UserRoles.SUPER_ADMIN)) {
        registerUserDto.company = company;
      }
    } else if (currentUser.roles.includes(UserRoles.ADMIN)) {
      if (registerUserDto.roles.includes(UserRoles.SUPER_ADMIN)) {
        return {
          success: false,
          message: 'you cannot register an user as SUPER ADMIN',
        };
      }
      registerUserDto.company = company;
    }
    return await this.service.create(registerUserDto, currentUser);
  }

  @Post('activation')
  @UsePipes(
    new ValidationPipe({
      forbidNonWhitelisted: true,
    }),
  )
  @SkipAuth()
  async confirmation(
    @Body() activateAccountDto: ActivateAccountDto,
  ): Promise<ResponseDto<any>> {
    return await this.service.activeAccount(activateAccountDto);
  }

  @Put()
  @UsePipes(
    new ValidationPipe({
      skipMissingProperties: true,
      groups: [GroupsValidation.PROFILE],
    }),
  )
  async modifyProfile(
    @Body() modifyUserDto: ModifyUserDto,
    @CurrentUser() currentUser: User,
  ): Promise<ResponseDto<User>> {
    delete modifyUserDto.company;
    delete modifyUserDto.roles;
    delete modifyUserDto.status;

    return await this.service.modify(
      currentUser['_id'],
      modifyUserDto,
      currentUser,
    );
  }

  @Put(':id')
  @UsePipes(
    new ValidationPipe({
      skipMissingProperties: true,
      groups: [GroupsValidation.ADMIN, GroupsValidation.SUPER_ADMIN],
    }),
  )
  @Roles(UserRoles.SUPER_ADMIN, UserRoles.ADMIN)
  async modifyUserById(
    @Param('id') id: string,
    @Body() modifyUserDto: ModifyUserDto,
    @CurrentUser() currentUser: User,
  ): Promise<ResponseDto<User>> {
    if (currentUser.roles.includes(UserRoles.ADMIN)) {
      const company: any = currentUser.company;
      const { response: userToUpdate } = await this.service.getUserById(id);

      if (userToUpdate.company['_id'] !== company) {
        throw new NotFoundException('User Not Found.');
      }
      const superIndex = modifyUserDto.roles.indexOf(UserRoles.SUPER_ADMIN);
      modifyUserDto.roles.splice(superIndex);
      delete modifyUserDto.company;
    }
    delete modifyUserDto.company;
    return await this.service.modify(id, modifyUserDto, currentUser);
  }

  @Patch('password-change')
  @UsePipes(
    new ValidationPipe({
      forbidNonWhitelisted: true,
    }),
  )
  async changePassword(
    @Body() passwordsDto: ModifyPasswordDto,
    @CurrentUser() currentUser: User,
  ): Promise<ResponseDto<any>> {
    return await this.service.changePassword(currentUser['_id'], passwordsDto);
  }
}
