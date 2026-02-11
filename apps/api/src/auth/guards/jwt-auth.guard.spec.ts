import { UnauthorizedException } from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';

describe('JwtAuthGuard', () => {
  it('returns the user when authentication succeeded', () => {
    const guard = new JwtAuthGuard();
    const user = { sub: 'local-admin' };

    const result = guard.handleRequest(null, user);

    expect(result).toEqual(user);
  });

  it('throws unauthorized exception when user is missing', () => {
    const guard = new JwtAuthGuard();

    expect(() => guard.handleRequest(null, false)).toThrow(
      UnauthorizedException,
    );
  });
});
