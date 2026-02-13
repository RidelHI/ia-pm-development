import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';
import { AuthApiService } from '../../data-access/auth-api.service';
import { LoginPageComponent } from './login.page';

describe('LoginPageComponent', () => {
  let loginImplementation: (
    credentials: Readonly<{ username: string; password: string }>,
  ) => Observable<unknown>;
  let loginCalls: { username: string; password: string }[];
  const authApiServiceMock = {
    login(credentials: Readonly<{ username: string; password: string }>) {
      loginCalls.push({ ...credentials });
      return loginImplementation(credentials);
    },
  };

  beforeEach(async () => {
    loginCalls = [];
    loginImplementation = () =>
      of({
        accessToken: 'token-123',
        tokenType: 'Bearer',
        expiresInSeconds: 900,
      });
    await TestBed.configureTestingModule({
      imports: [LoginPageComponent],
      providers: [
        provideRouter([]),
        {
          provide: AuthApiService,
          useValue: authApiServiceMock,
        },
      ],
    }).compileComponents();
  });

  it('submits valid credentials and navigates to products', async () => {
    const fixture = TestBed.createComponent(LoginPageComponent);
    const component = fixture.componentInstance;
    const router = TestBed.inject(Router);
    const navigateCalls: unknown[] = [];
    router.navigate = ((...args: unknown[]) => {
      navigateCalls.push(args);
      return Promise.resolve(true);
    }) as Router['navigate'];

    component.form.setValue({
      username: 'warehouse.user',
      password: 'StrongPassword123!',
    });
    await component.submit();

    expect(loginCalls).toEqual([
      {
        username: 'warehouse.user',
        password: 'StrongPassword123!',
      },
    ]);
    expect(navigateCalls).toEqual([[['/products']]]);
    expect(component.errorMessage()).toBeNull();
  });

  it('shows actionable message on 401 response', async () => {
    loginImplementation = () =>
      throwError(() => new HttpErrorResponse({ status: 401 }));
    const fixture = TestBed.createComponent(LoginPageComponent);
    const component = fixture.componentInstance;

    component.form.setValue({
      username: 'warehouse.user',
      password: 'WrongPassword123!',
    });
    await component.submit();

    expect(component.errorMessage()).toContain('Credenciales inválidas');
  });
});
