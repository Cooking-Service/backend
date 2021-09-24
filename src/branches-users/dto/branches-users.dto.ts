import { IsEmail, IsEnum, IsString } from 'class-validator';
import { ModifyUserDto } from 'src/users/dto/users.dto';
import { EmployeeType } from '../schemas/branches-users.schema';

export class RegisterEmployeeDto {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsEmail()
  email: string;

  @IsEnum(EmployeeType)
  employeeType: EmployeeType;
}

export class ModifyEmployeeDto extends ModifyUserDto {
  @IsEnum(EmployeeType)
  employeeType: EmployeeType;
}
