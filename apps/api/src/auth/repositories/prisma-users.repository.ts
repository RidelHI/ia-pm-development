import {
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import type { User } from '../../../prisma/generated/client/client';
import { Prisma } from '../../../prisma/generated/client/client';
import { PrismaService } from '../../integrations/prisma/prisma.service';
import type { AuthUser } from '../auth.types';
import {
  DuplicateUsernameError,
  type CreateUserInput,
  type UsersRepository,
} from './users.repository';

@Injectable()
export class PrismaUsersRepository implements UsersRepository {
  private readonly logger = new Logger(PrismaUsersRepository.name);

  constructor(private readonly prisma: PrismaService) {}

  async findByUsername(username: string): Promise<AuthUser | null> {
    const normalizedUsername = this.normalizeUsername(username);

    try {
      const user = await this.prisma.user.findUnique({
        where: {
          username: normalizedUsername,
        },
      });

      return user ? this.toAuthUser(user) : null;
    } catch (error) {
      return this.handlePrismaError(error, 'query');
    }
  }

  async create(input: CreateUserInput): Promise<AuthUser> {
    const normalizedUsername = this.normalizeUsername(input.username);

    try {
      const user = await this.prisma.user.create({
        data: {
          id: input.id,
          username: normalizedUsername,
          passwordHash: input.passwordHash,
          role: input.role,
          createdAt: new Date(input.createdAt),
          updatedAt: new Date(input.updatedAt),
        },
      });

      return this.toAuthUser(user);
    } catch (error) {
      return this.handlePrismaError(error, 'insert');
    }
  }

  private normalizeUsername(username: string): string {
    return username.trim().toLowerCase();
  }

  private toAuthUser(user: User): AuthUser {
    return {
      id: user.id,
      username: user.username,
      passwordHash: user.passwordHash,
      role: user.role as AuthUser['role'],
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };
  }

  private handlePrismaError(
    error: unknown,
    operation: 'query' | 'insert',
  ): never {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      throw new DuplicateUsernameError();
    }

    this.logger.error(
      `Prisma ${operation} failed`,
      JSON.stringify(this.serializeError(error)),
    );

    throw new ServiceUnavailableException(
      'User storage is temporarily unavailable',
    );
  }

  private serializeError(error: unknown): Record<string, string> {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError ||
      error instanceof Error
    ) {
      return {
        name: error.name,
        message: error.message,
      };
    }

    return {
      name: 'UnknownError',
      message: 'Unknown Prisma error',
    };
  }
}
