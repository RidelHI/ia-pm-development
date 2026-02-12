import { ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard';

function createContext(userRoles: string[] = []) {
  return {
    getHandler: () => ({}),
    getClass: () => ({}),
    switchToHttp: () => ({
      getRequest: () => ({
        user: {
          roles: userRoles,
        },
      }),
    }),
  } as never;
}

describe('RolesGuard', () => {
  it('allows access when route has no roles metadata', () => {
    const reflector = {
      getAllAndOverride: jest.fn().mockReturnValue(undefined),
    } as unknown as Reflector;
    const guard = new RolesGuard(reflector);

    expect(guard.canActivate(createContext(['admin']))).toBe(true);
  });

  it('throws when user does not have any required role', () => {
    const reflector = {
      getAllAndOverride: jest.fn().mockReturnValue(['admin']),
    } as unknown as Reflector;
    const guard = new RolesGuard(reflector);

    expect(() => guard.canActivate(createContext(['viewer']))).toThrow(
      ForbiddenException,
    );
  });

  it('allows when user has one required role', () => {
    const reflector = {
      getAllAndOverride: jest.fn().mockReturnValue(['admin']),
    } as unknown as Reflector;
    const guard = new RolesGuard(reflector);

    expect(guard.canActivate(createContext(['admin']))).toBe(true);
  });

  it('allows when route accepts multiple roles and user has one', () => {
    const reflector = {
      getAllAndOverride: jest.fn().mockReturnValue(['admin', 'user']),
    } as unknown as Reflector;
    const guard = new RolesGuard(reflector);

    expect(guard.canActivate(createContext(['user']))).toBe(true);
  });
});
