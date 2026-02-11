import { createHash, timingSafeEqual } from 'node:crypto';
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import authConfig from '../config/auth.config';
import type { AuthTokenPayload } from './auth.types';

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
    if (!this.safeCompare(username, this.config.username)) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!this.safeCompare(password, this.config.password)) {
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

  private safeCompare(value: string, expected: string): boolean {
    const valueHash = createHash('sha256').update(value).digest();
    const expectedHash = createHash('sha256').update(expected).digest();

    return timingSafeEqual(valueHash, expectedHash);
  }
}
