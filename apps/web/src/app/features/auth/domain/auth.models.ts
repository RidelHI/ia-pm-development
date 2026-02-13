export interface RegisterUserRequest {
  username: string;
  password: string;
}

export interface RegisteredUserResponse {
  id: string;
  username: string;
  role: 'admin' | 'user';
  createdAt: string;
  updatedAt: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface AccessTokenResponse {
  accessToken: string;
  tokenType: 'Bearer';
  expiresInSeconds: number;
}

export interface AuthSession extends AccessTokenResponse {
  username?: string;
}
