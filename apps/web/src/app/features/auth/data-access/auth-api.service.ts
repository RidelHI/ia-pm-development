import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { map, Observable } from 'rxjs';
import { AuthStore } from '../state/auth.store';
import { API_BASE_URL } from '../../../core/config/api-base-url.token';
import type {
  AccessTokenResponse,
  LoginRequest,
  RegisterUserRequest,
  RegisteredUserResponse,
} from '../domain/auth.models';
import {
  toAccessTokenResponse,
  toAuthSession,
  type AccessTokenResponseDto,
} from '../domain/auth.mappers';

@Injectable({
  providedIn: 'root',
})
export class AuthApiService {
  private readonly http = inject(HttpClient);
  private readonly authStore = inject(AuthStore);
  private readonly baseApiUrl = inject(API_BASE_URL);

  register(payload: RegisterUserRequest): Observable<RegisteredUserResponse> {
    return this.http.post<RegisteredUserResponse>(
      `${this.baseApiUrl}/auth/register`,
      payload,
    );
  }

  login(payload: LoginRequest): Observable<AccessTokenResponse> {
    return this.http
      .post<AccessTokenResponseDto>(`${this.baseApiUrl}/auth/token`, payload)
      .pipe(
        map((response) => toAccessTokenResponse(response)),
        tap((session) => {
          this.authStore.setSession(toAuthSession(session, payload.username));
        }),
      );
  }
}
