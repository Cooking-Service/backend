import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// AuthGuard say that local.strategy.ts will take credencials of body request
@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {}
