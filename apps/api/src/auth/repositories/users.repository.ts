import type { AuthRole, AuthUser } from '../auth.types';

export const USERS_REPOSITORY = Symbol('USERS_REPOSITORY');

export interface CreateUserInput {
  id: string;
  username: string;
  passwordHash: string;
  role: AuthRole;
  createdAt: string;
  updatedAt: string;
}

export class DuplicateUsernameError extends Error {
  constructor() {
    super('Username already exists');
  }
}

export interface UsersRepository {
  findByUsername(username: string): Promise<AuthUser | null>;
  create(input: CreateUserInput): Promise<AuthUser>;
}
