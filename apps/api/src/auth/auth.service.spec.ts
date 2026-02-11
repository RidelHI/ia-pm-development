import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';

interface JwtPayload {
  username: string;
  roles: string[];
}

describe('AuthService', () => {
  const config = {
    username: 'admin',
    password: 'admin123!',
    jwtSecret: 'development-only-secret-change-in-production',
    jwtExpiresInSeconds: 900,
    jwtIssuer: 'warehouse-api',
    jwtAudience: 'warehouse-clients',
  };

  it('issues an access token for valid credentials', () => {
    const jwtService = new JwtService({ secret: config.jwtSecret });
    const service = new AuthService(jwtService, config);

    const token = service.issueAccessToken('admin', 'admin123!');
    const payload = jwtService.verify<JwtPayload>(token.accessToken, {
      secret: config.jwtSecret,
    });

    expect(token.tokenType).toBe('Bearer');
    expect(token.expiresInSeconds).toBe(900);
    expect(payload.username).toBe('admin');
    expect(payload.roles).toEqual(['admin']);
  });

  it('throws for invalid credentials', () => {
    const jwtService = new JwtService({ secret: config.jwtSecret });
    const service = new AuthService(jwtService, config);

    expect(() => service.issueAccessToken('admin', 'wrong-password')).toThrow(
      UnauthorizedException,
    );
  });
});
