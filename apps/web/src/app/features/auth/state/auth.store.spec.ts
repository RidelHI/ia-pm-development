import { TestBed } from '@angular/core/testing';
import {
  AUTH_SESSION_STORAGE_KEY,
  AuthStore,
  readInitialSession,
} from './auth.store';

type AuthStoreInstance = InstanceType<typeof AuthStore>;

describe('AuthStore', () => {
  let store: AuthStoreInstance;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    store = TestBed.inject(AuthStore);
  });

  it('starts unauthenticated when storage is empty', () => {
    expect(store.isAuthenticated()).toBe(false);
    expect(store.accessToken()).toBeNull();
  });

  it('sets and clears session state', async () => {
    store.setSession({
      accessToken: 'token-123',
      tokenType: 'Bearer',
      expiresInSeconds: 900,
      username: 'warehouse.user',
    });
    await Promise.resolve();

    expect(store.isAuthenticated()).toBe(true);
    expect(store.accessToken()).toBe('token-123');

    store.clearSession();
    await Promise.resolve();

    expect(store.isAuthenticated()).toBe(false);
    expect(store.accessToken()).toBeNull();
  });

  it('removes malformed session data from storage', () => {
    localStorage.setItem(AUTH_SESSION_STORAGE_KEY, '{bad-json');
    const malformedSession = readInitialSession();

    expect(malformedSession).toBeNull();
    expect(localStorage.getItem(AUTH_SESSION_STORAGE_KEY)).toBeNull();
  });
});
