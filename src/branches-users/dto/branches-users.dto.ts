import { IsEmail, IsEnum, IsString } from 'class-validator';
import { EmployeeType } from 'src/common/types/enums';
import { ModifyUserDto } from 'src/users/dto/users.dto';

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
