import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { BranchesUsersService } from 'src/branches-users/branches-users.service';
import { UserStatus } from 'src/users/schemas/user.schema';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private branchesUsersService: BranchesUsersService,
  ) {}

  // if user exist, user is sended to validate() on local.startegy
  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.usersService.findByUsername(username);

    if (user && user.status === UserStatus.ACTIVE) {
      const match = await bcrypt.compare(pass, user.password);
      if (match) {
        return user;
      }
    }

    return null;
  }

  // user comes from request on app.cpntroller, here is generated the JWT
  async login(user: any) {
    const payload = { username: user.username, sub: user._id };
    return {
      token: this.jwtService.sign(payload),
    };
  }

  async getUserRoles(token: string): Promise<string[]> {
    const user = this.jwtService.verify(token);
    const roles = await this.usersService.getUserRoles(user.sub);
    return roles;
  }

  async getEmployeeType(token: string): Promise<string> {
    const user = this.jwtService.verify(token);
    const employeeType = await this.branchesUsersService.getEmployeeType(
      user.sub,
    );

    return employeeType;
  }

  async verifyToken(token: string): Promise<{ success: boolean; payload?: {} }> {
    return await this.jwtService
      .verify(token)
      .then((payload) => {
        return {
          success: true,
          payload,
        };
      })
      .catch(() => {
        return {
          success: false,
        };
      });
  }
}
