import { Controller, Get, Req, UseGuards, Res } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { ConfigService } from '@nestjs/config';
import { User } from '../user.entity';

interface RequestWithUser extends Request {
  user: User;
}

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private configService: ConfigService,
  ) { }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() { }

  @Get('google/redirect')
  @UseGuards(AuthGuard('google'))
  googleAuthRedirect(@Req() req: RequestWithUser, @Res() res: Response) {
    const { access_token } = this.authService.login(req.user);
    const frontendUrl = this.configService.get<string>('FRONTEND_URL');

    // Use HTML/JS Redirect instead of HTTP 302 to handle large tokens reliably
    // and avoid browser/network ERR_FAILED on localhost
    const redirectScript = `
      <script>
        window.location.href = "${frontendUrl}/auth/callback#token=${access_token}";
      </script>
    `;

    res.send(redirectScript);
  }
  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  getProfile(@Req() req: RequestWithUser) {
    const user = req.user;
    const hasAccess = user.role === 'admin' || user.status === 'active';
    return {
      ...user,
      hasAccess,
    };
  }
}
