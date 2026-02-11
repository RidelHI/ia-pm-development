import { createHash, timingSafeEqual } from 'node:crypto';
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { compare } from 'bcryptjs';
import authConfig from '../config/auth.config';
import { AccessTokenResponseDto } from './dto/access-token-response.dto';
import type { AuthTokenPayload } from './auth.types';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    @Inject(authConfig.KEY)
    private readonly config: ConfigType<typeof authConfig>,
  ) {}

  async issueAccessToken(
    username: string,
    password: string,
  ): Promise<AccessTokenResponseDto> {
    if (!this.safeCompare(username, this.config.username)) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!(await this.verifyPassword(password))) {
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

  private async verifyPassword(password: string): Promise<boolean> {
    if (this.config.passwordHash) {
      return compare(password, this.config.passwordHash);
    }

    return this.safeCompare(password, this.config.password);
  }

  private safeCompare(value: string, expected: string): boolean {
    const valueHash = createHash('sha256').update(value).digest();
    const expectedHash = createHash('sha256').update(expected).digest();

    return timingSafeEqual(valueHash, expectedHash);
  }
}
