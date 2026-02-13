import { computed, effect } from '@angular/core';
import {
  patchState,
  signalStore,
  withComputed,
  withHooks,
  withMethods,
  withState,
} from '@ngrx/signals';
import type { AuthSession } from '../domain/auth.models';

export const AUTH_SESSION_STORAGE_KEY = 'warehouse.auth.session';

interface AuthState {
  session: AuthSession | null;
}

function isStorageAvailable(): boolean {
  return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
}

export function readInitialSession(): AuthSession | null {
  if (!isStorageAvailable()) {
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

export const AuthStore = signalStore(
  { providedIn: 'root' },
  withState<AuthState>({
    session: readInitialSession(),
  }),
  withComputed(({ session }) => {
    const accessToken = computed(() => session()?.accessToken ?? null);
    const username = computed(() => session()?.username ?? null);

    return {
      accessToken,
      username,
      isAuthenticated: computed(() => accessToken() !== null),
    };
  }),
  withMethods((store) => ({
    setSession(session: AuthSession): void {
      patchState(store, { session });
    },
    clearSession(): void {
      patchState(store, { session: null });
    },
  })),
  withHooks({
    onInit(store) {
      effect(() => {
        if (!isStorageAvailable()) {
          return;
        }

        const session = store.session();
        if (!session) {
          localStorage.removeItem(AUTH_SESSION_STORAGE_KEY);
          return;
        }

        localStorage.setItem(AUTH_SESSION_STORAGE_KEY, JSON.stringify(session));
      });
    },
  }),
);
