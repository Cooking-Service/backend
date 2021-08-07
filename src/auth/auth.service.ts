import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  // if user exist, user is sended to validate() on local.startegy
  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.usersService.findByUsername(username);
    if (user && user.password === pass) {
      return user;
    }
    return null;
  }

  // user comes from request on app.cpntroller, here is generated the JWT
  async login(user: any): Promise<ResponseDto<any>> {
    const payload = { username: user.username, sub: user._id };
    return {
      success: true,
      response: {
        token: this.jwtService.sign(payload),
      },
    };
  }

  async getUserRoles(token: string): Promise<string[]> {
    const user = this.jwtService.verify(token);
    const roles = await this.usersService.getUserRoles(user.sub);
    return roles;
  }
}
