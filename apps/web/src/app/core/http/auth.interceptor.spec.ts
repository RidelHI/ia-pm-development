import { HttpRequest, HttpResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { AuthStore } from '../auth/auth.store';
import { authInterceptor } from './auth.interceptor';

describe('authInterceptor', () => {
  it('adds Authorization header when token exists', () => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: AuthStore,
          useValue: {
            accessToken: () => 'token-123',
          },
        },
      ],
    });
    const request = new HttpRequest('GET', '/v1/products');
    let capturedRequest: unknown = null;

    TestBed.runInInjectionContext(() =>
      authInterceptor(request, (req) => {
        capturedRequest = req;
        return of(new HttpResponse({ status: 200 }));
      }),
    ).subscribe();

    expect(capturedRequest).not.toBeNull();
    if (!capturedRequest) {
      throw new Error('Expected captured request');
    }
    const forwardedRequest = capturedRequest as HttpRequest<unknown>;
    expect(forwardedRequest.headers.get('Authorization')).toBe('Bearer token-123');
  });

  it('keeps request untouched when token does not exist', () => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: AuthStore,
          useValue: {
            accessToken: () => null,
          },
        },
      ],
    });
    const request = new HttpRequest('GET', '/v1/products');
    let capturedRequest: unknown = null;

    TestBed.runInInjectionContext(() =>
      authInterceptor(request, (req) => {
        capturedRequest = req;
        return of(new HttpResponse({ status: 200 }));
      }),
    ).subscribe();

    expect(capturedRequest).not.toBeNull();
    if (!capturedRequest) {
      throw new Error('Expected captured request');
    }
    const forwardedRequest = capturedRequest as HttpRequest<unknown>;
    expect(forwardedRequest.headers.has('Authorization')).toBe(false);
  });
});
