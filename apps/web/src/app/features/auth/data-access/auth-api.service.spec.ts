import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { API_BASE_URL } from '../../../core/config/api-base-url.token';
import { AuthApiService } from './auth-api.service';
import { AuthStore } from '../state/auth.store';

type AuthStoreInstance = InstanceType<typeof AuthStore>;

describe('AuthApiService', () => {
  let service: AuthApiService;
  let httpController: HttpTestingController;
  let authStore: AuthStoreInstance;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: API_BASE_URL,
          useValue: 'http://localhost:3000/v1',
        },
      ],
    });

    service = TestBed.inject(AuthApiService);
    httpController = TestBed.inject(HttpTestingController);
    authStore = TestBed.inject(AuthStore);
    authStore.clearSession();
  });

  afterEach(() => {
    httpController.verify();
  });

  it('calls register endpoint', async () => {
    const responsePromise = firstValueFrom(
      service.register({
        username: 'warehouse.user',
        password: 'StrongPassword123!',
      }),
    );
    const request = httpController.expectOne(
      'http://localhost:3000/v1/auth/register',
    );

    expect(request.request.method).toBe('POST');
    request.flush({
      id: 'usr_01',
      username: 'warehouse.user',
      role: 'user',
      createdAt: '2026-02-12T00:00:00.000Z',
      updatedAt: '2026-02-12T00:00:00.000Z',
    });

    const response = await responsePromise;
    expect(response.username).toBe('warehouse.user');
  });

  it('stores session on successful login', async () => {
    const responsePromise = firstValueFrom(
      service.login({
        username: 'warehouse.user',
        password: 'StrongPassword123!',
      }),
    );
    const request = httpController.expectOne(
      'http://localhost:3000/v1/auth/token',
    );

    expect(request.request.method).toBe('POST');
    request.flush({
      accessToken: 'token-123',
      tokenType: 'JWT',
      expiresInSeconds: 900,
    });

    await responsePromise;
    expect(authStore.isAuthenticated()).toBe(true);
    expect(authStore.accessToken()).toBe('token-123');
    expect(authStore.session()?.tokenType).toBe('Bearer');
  });
});
