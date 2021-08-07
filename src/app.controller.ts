import { Controller, Post, Request, UseGuards } from '@nestjs/common';
import { AuthService } from './auth/auth.service';
import { LocalAuthGuard } from './auth/local-auth.guard';
import { SkipAuth } from './auth/skip-auth.decorator';

@Controller()
export class AppController {
  constructor(private authService: AuthService) {}

  // LocalGuard takes credentials of body request
  // once user is validated login takes user and create the token on auth.service. 
  @UseGuards(LocalAuthGuard)
  @Post('auth/login')
  @SkipAuth()
  async login(@Request() req) {
    return this.authService.login(req.user);
  }
}
