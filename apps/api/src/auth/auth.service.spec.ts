import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare, hash } from 'bcryptjs';
import { AuthService } from './auth.service';
import type {
  CreateUserInput,
  UsersRepository,
} from './repositories/users.repository';
import { DuplicateUsernameError } from './repositories/users.repository';

interface JwtPayload {
  sub: string;
  username: string;
  roles: string[];
}

describe('AuthService', () => {
  const config = {
    jwtSecret: 'development-only-secret-change-in-production',
    jwtExpiresInSeconds: 900,
    jwtIssuer: 'warehouse-api',
    jwtAudience: 'warehouse-clients',
  };

  const usersRepositoryStub: UsersRepository = {
    findByUsername: jest.fn(),
    create: jest.fn(),
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('issues an access token for valid persisted credentials', async () => {
    const jwtService = new JwtService({ secret: config.jwtSecret });
    const storedPasswordHash = await hash('StrongPassword123!', 10);
    const service = new AuthService(jwtService, config, {
      ...usersRepositoryStub,
      findByUsername: jest.fn(() =>
        Promise.resolve({
          id: 'usr_01',
          username: 'warehouse.user',
          passwordHash: storedPasswordHash,
          role: 'user',
          createdAt: new Date('2026-02-10T10:00:00.000Z').toISOString(),
          updatedAt: new Date('2026-02-10T10:00:00.000Z').toISOString(),
        }),
      ),
    });

    const token = await service.issueAccessToken(
      'warehouse.user',
      'StrongPassword123!',
    );
    const payload = jwtService.verify<JwtPayload>(token.accessToken, {
      secret: config.jwtSecret,
    });

    expect(token.tokenType).toBe('Bearer');
    expect(token.expiresInSeconds).toBe(900);
    expect(payload.sub).toBe('usr_01');
    expect(payload.username).toBe('warehouse.user');
    expect(payload.roles).toEqual(['user']);
  });

  it('throws for unknown username', async () => {
    const jwtService = new JwtService({ secret: config.jwtSecret });
    const service = new AuthService(jwtService, config, {
      ...usersRepositoryStub,
      findByUsername: jest.fn(() => Promise.resolve(null)),
    });

    await expect(
      service.issueAccessToken('missing.user', 'StrongPassword123!'),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('throws for invalid password', async () => {
    const jwtService = new JwtService({ secret: config.jwtSecret });
    const storedPasswordHash = await hash('StrongPassword123!', 10);
    const service = new AuthService(jwtService, config, {
      ...usersRepositoryStub,
      findByUsername: jest.fn(() =>
        Promise.resolve({
          id: 'usr_01',
          username: 'warehouse.user',
          passwordHash: storedPasswordHash,
          role: 'user',
          createdAt: new Date('2026-02-10T10:00:00.000Z').toISOString(),
          updatedAt: new Date('2026-02-10T10:00:00.000Z').toISOString(),
        }),
      ),
    });

    await expect(
      service.issueAccessToken('warehouse.user', 'WrongPassword123!'),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('registers user with hashed password and normalized username', async () => {
    const jwtService = new JwtService({ secret: config.jwtSecret });
    const create = jest.fn((input: CreateUserInput) => Promise.resolve(input));
    const service = new AuthService(jwtService, config, {
      ...usersRepositoryStub,
      create,
    });

    const registered = await service.registerUser(
      'Warehouse.User',
      'StrongPassword123!',
    );

    expect(registered.username).toBe('warehouse.user');
    expect(registered.role).toBe('user');
    expect(registered.id.startsWith('usr_')).toBe(true);
    await expect(
      compare('StrongPassword123!', registered.passwordHash),
    ).resolves.toBe(true);
    expect(create).toHaveBeenCalledTimes(1);
  });

  it('maps duplicate username errors to conflict exception', async () => {
    const jwtService = new JwtService({ secret: config.jwtSecret });
    const service = new AuthService(jwtService, config, {
      ...usersRepositoryStub,
      create: jest.fn(() => Promise.reject(new DuplicateUsernameError())),
    });

    await expect(
      service.registerUser('warehouse.user', 'StrongPassword123!'),
    ).rejects.toThrow(ConflictException);
  });
});
