import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtAuthGuard } from './jwt-auth.guard';

function createExecutionContext(headers?: Record<string, string>) {
  const request = {
    headers: headers ?? {},
  };

  return {
    switchToHttp: () => ({
      getRequest: () => request,
    }),
  } as never;
}

describe('JwtAuthGuard', () => {
  const config = {
    jwtSecret: 'development-only-secret-change-in-production',
    jwtIssuer: 'warehouse-api',
    jwtAudience: 'warehouse-clients',
  };

  it('allows a valid bearer token', async () => {
    const jwtService = new JwtService({ secret: config.jwtSecret });
    const guard = new JwtAuthGuard(jwtService, {
      username: 'admin',
      password: 'admin123!',
      jwtExpiresInSeconds: 900,
      ...config,
    });

    const token = jwtService.sign(
      { sub: 'local-admin', username: 'admin', roles: ['admin'] },
      {
        secret: config.jwtSecret,
        issuer: config.jwtIssuer,
        audience: config.jwtAudience,
      },
    );

    const allowed = await guard.canActivate(
      createExecutionContext({
        authorization: `Bearer ${token}`,
      }),
    );

    expect(allowed).toBe(true);
  });

  it('rejects requests without token', async () => {
    const jwtService = new JwtService({ secret: config.jwtSecret });
    const guard = new JwtAuthGuard(jwtService, {
      username: 'admin',
      password: 'admin123!',
      jwtExpiresInSeconds: 900,
      ...config,
    });

    await expect(guard.canActivate(createExecutionContext())).rejects.toThrow(
      UnauthorizedException,
    );
  });
});
