import { Injectable } from '@nestjs/common';
import type { AuthUser } from '../auth.types';
import {
  DuplicateUsernameError,
  type CreateUserInput,
  type UsersRepository,
} from './users.repository';

@Injectable()
export class InMemoryUsersRepository implements UsersRepository {
  private readonly usersById = new Map<string, AuthUser>();
  private readonly userIdByUsername = new Map<string, string>();

  findByUsername(username: string): Promise<AuthUser | null> {
    const normalizedUsername = username.trim().toLowerCase();
    const userId = this.userIdByUsername.get(normalizedUsername);

    if (!userId) {
      return Promise.resolve(null);
    }

    return Promise.resolve(this.usersById.get(userId) ?? null);
  }

  create(input: CreateUserInput): Promise<AuthUser> {
    const normalizedUsername = input.username.trim().toLowerCase();

    if (this.userIdByUsername.has(normalizedUsername)) {
      return Promise.reject(new DuplicateUsernameError());
    }

    const user: AuthUser = {
      ...input,
      username: normalizedUsername,
    };

    this.usersById.set(user.id, user);
    this.userIdByUsername.set(user.username, user.id);

    return Promise.resolve(user);
  }
}
