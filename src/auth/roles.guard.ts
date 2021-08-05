import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRoles } from 'src/users/schemas/user.schema';
import { AuthService } from './auth.service';
import { ROLES_KEY } from './roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector, private auth: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<UserRoles[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass],
    );

    if (!requiredRoles) {
      return true;
    }

    const token = context
      .switchToHttp()
      .getRequest()
      .headers.authorization.split(' ')[1];

    const roles = await this.auth.getUserRoles(token);

    return requiredRoles.some((role) => roles?.includes(role));
  }
}
