import { UnauthorizedException } from '@nestjs/common';
import { JwtStrategy } from './jwt.strategy';

describe('JwtStrategy', () => {
  const config = {
    username: 'admin',
    password: 'admin123!',
    jwtSecret: 'development-only-secret-change-in-production',
    jwtExpiresInSeconds: 900,
    jwtIssuer: 'warehouse-api',
    jwtAudience: 'warehouse-clients',
  };

  it('accepts payload with supported roles', () => {
    const strategy = new JwtStrategy(config);
    const payload = {
      sub: 'local-admin',
      username: 'admin',
      roles: ['admin'] as const,
    };

    expect(strategy.validate(payload)).toEqual(payload);
  });

  it('rejects payload with unsupported roles', () => {
    const strategy = new JwtStrategy(config);

    expect(() =>
      strategy.validate({
        sub: 'local-admin',
        username: 'admin',
        roles: ['viewer'] as never,
      }),
    ).toThrow(UnauthorizedException);
  });
});
