import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import authConfig from '../config/auth.config';

interface AuthTokenPayload {
  sub: string;
  username: string;
  roles: string[];
}

export interface AccessTokenResponse {
  accessToken: string;
  tokenType: 'Bearer';
  expiresInSeconds: number;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    @Inject(authConfig.KEY)
    private readonly config: ConfigType<typeof authConfig>,
  ) {}

  issueAccessToken(username: string, password: string): AccessTokenResponse {
    if (
      username !== this.config.username ||
      password !== this.config.password
    ) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload: AuthTokenPayload = {
      sub: 'local-admin',
      username: this.config.username,
      roles: ['admin'],
    };

    return {
      accessToken: this.jwtService.sign(payload),
      tokenType: 'Bearer',
      expiresInSeconds: this.config.jwtExpiresInSeconds,
    };
  }
}
