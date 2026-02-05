import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { User } from '../user.entity';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) { }

  async validateGoogleUser(details: {
    email: string;
    name: string;
    picture: string;
    googleId: string;
  }): Promise<User> {
    const user = await this.usersService.findByEmail(details.email);
    if (user) {
      await this.usersService.update(user.id, {
        googleId: details.googleId,
        avatar: details.picture,
        name: details.name,
      });
      return user;
    }
    return this.usersService.create({
      email: details.email,
      name: details.name,
      avatar: details.picture,
      googleId: details.googleId,
    });
  }

  login(user: User) {
    const payload = { email: user.email, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
      user,
    };
  }
}
