import type { AccessTokenResponse, AuthSession } from './auth.models';

export interface AccessTokenResponseDto {
  accessToken: string;
  tokenType: string;
  expiresInSeconds: number;
}

export function toAccessTokenResponse(
  dto: AccessTokenResponseDto,
): AccessTokenResponse {
  return {
    accessToken: dto.accessToken,
    tokenType: 'Bearer',
    expiresInSeconds: dto.expiresInSeconds,
  };
}

export function toAuthSession(
  response: AccessTokenResponse,
  username: string,
): AuthSession {
  return {
    ...response,
    username,
  };
}
