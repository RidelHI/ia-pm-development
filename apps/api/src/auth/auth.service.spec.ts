import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare, hashSync } from 'bcryptjs';
import { AuthService } from './auth.service';
import type {
  CreateUserInput,
  UsersRepository,
} from './repositories/users.repository';

interface JwtPayload {
  username: string;
  roles: string[];
}

describe('AuthService', () => {
  const config = {
    username: 'admin',
    password: 'admin123!',
    passwordHash: null,
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

  it('issues an access token for valid credentials', async () => {
    const jwtService = new JwtService({ secret: config.jwtSecret });
    const service = new AuthService(jwtService, config, usersRepositoryStub);

    const token = await service.issueAccessToken('admin', 'admin123!');
    const payload = jwtService.verify<JwtPayload>(token.accessToken, {
      secret: config.jwtSecret,
    });

    expect(token.tokenType).toBe('Bearer');
    expect(token.expiresInSeconds).toBe(900);
    expect(payload.username).toBe('admin');
    expect(payload.roles).toEqual(['admin']);
  });

  it('throws for invalid credentials', async () => {
    const jwtService = new JwtService({ secret: config.jwtSecret });
    const service = new AuthService(jwtService, config, usersRepositoryStub);

    await expect(
      service.issueAccessToken('admin', 'wrong-password'),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('supports bcrypt password hash when configured', async () => {
    const jwtService = new JwtService({ secret: config.jwtSecret });
    const service = new AuthService(
      jwtService,
      {
        ...config,
        passwordHash: hashSync('admin123!', 10),
      },
      usersRepositoryStub,
    );

    await expect(
      service.issueAccessToken('admin', 'admin123!'),
    ).resolves.toMatchObject({
      tokenType: 'Bearer',
      expiresInSeconds: 900,
    });
  });

  it('rejects invalid password against bcrypt hash', async () => {
    const jwtService = new JwtService({ secret: config.jwtSecret });
    const service = new AuthService(
      jwtService,
      {
        ...config,
        passwordHash: hashSync('admin123!', 10),
      },
      usersRepositoryStub,
    );

    await expect(
      service.issueAccessToken('admin', 'wrong-password'),
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
    expect(registered.passwordHash).not.toBe('StrongPassword123!');
    await expect(
      compare('StrongPassword123!', registered.passwordHash),
    ).resolves.toBe(true);
    expect(create).toHaveBeenCalledTimes(1);
  });
});
