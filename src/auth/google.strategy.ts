import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback, Profile } from 'passport-google-oauth20';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private configService: ConfigService,
    private authService: AuthService,
  ) {
    super({
      clientID: configService.get<string>('GOOGLE_CLIENT_ID') || 'default',
      clientSecret:
        configService.get<string>('GOOGLE_CLIENT_SECRET') || 'default',
      callbackURL:
        (configService.get<string>('BACKEND_URL') || 'http://localhost:3000') +
        '/auth/google/redirect',
      scope: ['email', 'profile'],
      prompt: 'select_account',
    } as any);
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ): Promise<any> {
    const { name, emails, photos, id } = profile;
    const user = await this.authService.validateGoogleUser({
      email: emails?.[0]?.value || 'no-email@example.com',
      name: name ? `${name.givenName} ${name.familyName}` : 'No Name',
      picture: photos?.[0]?.value || '',
      googleId: id,
    });
    done(null, user);
  }
}
