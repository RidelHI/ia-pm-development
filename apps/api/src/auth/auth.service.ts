import { randomUUID, createHash, timingSafeEqual } from 'node:crypto';
import {
  ConflictException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { compare, hash } from 'bcryptjs';
import authConfig from '../config/auth.config';
import { AccessTokenResponseDto } from './dto/access-token-response.dto';
import type { AuthTokenPayload, AuthUser } from './auth.types';
import {
  DuplicateUsernameError,
  USERS_REPOSITORY,
  type UsersRepository,
} from './repositories/users.repository';

@Injectable()
export class AuthService {
  private static readonly PASSWORD_HASH_ROUNDS = 12;

  constructor(
    private readonly jwtService: JwtService,
    @Inject(authConfig.KEY)
    private readonly config: ConfigType<typeof authConfig>,
    @Inject(USERS_REPOSITORY)
    private readonly usersRepository: UsersRepository,
  ) {}

  async registerUser(username: string, password: string): Promise<AuthUser> {
    const normalizedUsername = username.trim().toLowerCase();
    const passwordHash = await hash(password, AuthService.PASSWORD_HASH_ROUNDS);
    const now = new Date().toISOString();

    try {
      return await this.usersRepository.create({
        id: `usr_${randomUUID().replaceAll('-', '')}`,
        username: normalizedUsername,
        passwordHash,
        role: 'user',
        createdAt: now,
        updatedAt: now,
      });
    } catch (error) {
      if (error instanceof DuplicateUsernameError) {
        throw new ConflictException('Username already exists');
      }

      throw error;
    }
  }

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
