import {
  toAccessTokenResponse,
  toAuthSession,
  type AccessTokenResponseDto,
} from './auth.mappers';

describe('auth.mappers', () => {
  it('maps token dto to access token response', () => {
    const dto: AccessTokenResponseDto = {
      accessToken: 'token-123',
      tokenType: 'JWT',
      expiresInSeconds: 900,
    };

    const response = toAccessTokenResponse(dto);

    expect(response).toEqual({
      accessToken: 'token-123',
      tokenType: 'Bearer',
      expiresInSeconds: 900,
    });
  });

  it('builds auth session with username', () => {
    const session = toAuthSession(
      {
        accessToken: 'token-123',
        tokenType: 'Bearer',
        expiresInSeconds: 900,
      },
      'warehouse.user',
    );

    expect(session.username).toBe('warehouse.user');
    expect(session.accessToken).toBe('token-123');
  });
});
