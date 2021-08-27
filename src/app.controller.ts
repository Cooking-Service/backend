import {
  Controller,
  Get,
  HttpCode,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth/auth.service';
import { LocalAuthGuard } from './auth/local-auth.guard';
import { SkipAuth } from './auth/skip-auth.decorator';
import { EmailTemplate, sendEmail } from './common/mailer/node.mailer';

@Controller()
export class AppController {
  constructor(private authService: AuthService) {}

  // LocalGuard takes credentials of body request
  // once user is validated login takes user and create the token on auth.service.
  @UseGuards(LocalAuthGuard)
  @Post('auth/login')
  @HttpCode(200)
  @SkipAuth()
  async login(@Request() req) {
    return this.authService.login(req.user);
  }

  @Get('test-email')
  @SkipAuth()
  async email() {
    return await sendEmail({
      to: 'ivanchav112@gmail.com',
      subject: 'Test',
      payload: {
        name: 'Ivancho',
        link: 'google.com',
      },
      template: EmailTemplate.ACTIVE_ACCOUNT,
    });
  }
}
