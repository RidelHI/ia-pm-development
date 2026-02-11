export const AUTH_ROLES = ['admin'] as const;

export type AuthRole = (typeof AUTH_ROLES)[number];

export interface AuthTokenPayload {
  sub: string;
  username: string;
  roles: AuthRole[];
}

export interface AuthenticatedUser extends AuthTokenPayload {
  iat: number;
  exp: number;
  iss: string;
  aud: string | string[];
}
