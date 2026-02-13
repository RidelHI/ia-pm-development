import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { Observable, of, Subject, throwError } from 'rxjs';
import { AuthApiService } from '../../data-access/auth-api.service';
import { RegisterPageComponent } from './register.page';

describe('RegisterPageComponent', () => {
  let registerImplementation: (
    payload: Readonly<{ username: string; password: string }>,
  ) => Observable<unknown>;
  let registerCalls: { username: string; password: string }[];

  const authApiServiceMock = {
    register(payload: Readonly<{ username: string; password: string }>) {
      registerCalls.push({ ...payload });
      return registerImplementation(payload);
    },
  };

  beforeEach(async () => {
    registerCalls = [];
    registerImplementation = () =>
      of({
        id: 'usr_01',
        username: 'warehouse.user',
        role: 'user',
        createdAt: '2026-02-13T00:00:00.000Z',
        updatedAt: '2026-02-13T00:00:00.000Z',
      });

    await TestBed.configureTestingModule({
      imports: [RegisterPageComponent],
      providers: [
        provideRouter([]),
        {
          provide: AuthApiService,
          useValue: authApiServiceMock,
        },
      ],
    }).compileComponents();
  });

  it('does not call API when form is invalid', async () => {
    const fixture = TestBed.createComponent(RegisterPageComponent);
    const component = fixture.componentInstance;

    component.form.setValue({
      username: '',
      password: '',
    });
    await component.submit();

    expect(registerCalls).toEqual([]);
    expect(component.errorMessage()).toContain('Completa usuario');
  });

  it('shows conflict message on 409 response', async () => {
    registerImplementation = () =>
      throwError(() => new HttpErrorResponse({ status: 409 }));
    const fixture = TestBed.createComponent(RegisterPageComponent);
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

    expect(component.errorMessage()).toContain('ya existe');
    expect(navigateCalls).toEqual([]);
  });

  it('shows loading state while register request is pending', async () => {
    const registerSubject = new Subject<unknown>();
    registerImplementation = () => registerSubject.asObservable();
    const fixture = TestBed.createComponent(RegisterPageComponent);
    const component = fixture.componentInstance;
    const router = TestBed.inject(Router);
    router.navigate = (() => Promise.resolve(true)) as Router['navigate'];

    component.form.setValue({
      username: 'warehouse.user',
      password: 'StrongPassword123!',
    });

    const submitPromise = component.submit();
    fixture.detectChanges();

    const submitButton = fixture.nativeElement.querySelector(
      'button[type="submit"]',
    ) as HTMLButtonElement;
    expect(component.isSubmitting()).toBe(true);
    expect(submitButton.disabled).toBe(true);
    expect(submitButton.textContent).toContain('Registrando...');

    registerSubject.next({
      id: 'usr_01',
      username: 'warehouse.user',
      role: 'user',
      createdAt: '2026-02-13T00:00:00.000Z',
      updatedAt: '2026-02-13T00:00:00.000Z',
    });
    registerSubject.complete();
    await submitPromise;
  });
});
