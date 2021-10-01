import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRoles } from 'src/common/types/enums';
import { EmployeeType } from '../branches-users/schemas/branches-users.schema';
import { AuthService } from './auth.service';
import { EMPLOYEES_KEY } from './employees.decorator';
import { ROLES_KEY } from './roles.decorator';

@Injectable()
export class EmployeesGuard implements CanActivate {
  constructor(private reflector: Reflector, private auth: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredEmployees = this.reflector.getAllAndOverride<EmployeeType[]>(
      EMPLOYEES_KEY,
      [context.getHandler(), context.getClass],
    );

    const requiredRoles = this.reflector.getAllAndOverride<UserRoles[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass],
    );

    if (requiredRoles && !requiredRoles.includes(UserRoles.EMPLOYEE)) {
      return true;
    }

    if (!requiredEmployees) {
      return true;
    }

    const token = context
      .switchToHttp()
      .getRequest()
      .headers.authorization.split(' ')[1];

    const employee = await this.auth.getEmployeeType(token);

    return requiredEmployees.some((employeeType) => employee === employeeType);
  }
}
