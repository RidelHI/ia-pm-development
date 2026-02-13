import { computed, effect, Injectable, signal } from '@angular/core';
import type { AuthSession } from '../domain/auth.models';

export const AUTH_SESSION_STORAGE_KEY = 'warehouse.auth.session';

@Injectable({
  providedIn: 'root',
})
export class AuthStore {
  private readonly sessionState = signal<AuthSession | null>(
    this.readInitialSession(),
  );

  readonly session = computed(() => this.sessionState());
  readonly accessToken = computed(() => this.sessionState()?.accessToken ?? null);
  readonly isAuthenticated = computed(() => this.accessToken() !== null);

  constructor() {
    effect(() => {
      if (!this.isStorageAvailable()) {
        return;
      }

      const session = this.sessionState();

      if (!session) {
        localStorage.removeItem(AUTH_SESSION_STORAGE_KEY);
        return;
      }

      localStorage.setItem(AUTH_SESSION_STORAGE_KEY, JSON.stringify(session));
    });
  }

  setSession(session: AuthSession): void {
    this.sessionState.set(session);
  }

  clearSession(): void {
    this.sessionState.set(null);
  }

  private readInitialSession(): AuthSession | null {
    if (!this.isStorageAvailable()) {
      return null;
    }

    const rawValue = localStorage.getItem(AUTH_SESSION_STORAGE_KEY);

    if (!rawValue) {
      return null;
    }

    try {
      return JSON.parse(rawValue) as AuthSession;
    } catch {
      localStorage.removeItem(AUTH_SESSION_STORAGE_KEY);
      return null;
    }
  }

  private isStorageAvailable(): boolean {
    return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
  }
}
