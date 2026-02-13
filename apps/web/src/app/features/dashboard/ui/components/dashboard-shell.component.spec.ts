import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { AuthStore } from '../../../auth/state/auth.store';
import { DashboardShellComponent } from './dashboard-shell.component';

@Component({
  standalone: true,
  template: '<p>Products page test stub</p>',
})
class DashboardProductsStubComponent {}

describe('DashboardShellComponent', () => {
  const usernameSignal = signal<string | null>('warehouse.user');
  let clearSessionCalls: number;

  const authStoreMock = {
    username: () => usernameSignal(),
    clearSession() {
      clearSessionCalls += 1;
    },
  };

  beforeEach(async () => {
    clearSessionCalls = 0;
    usernameSignal.set('warehouse.user');

    await TestBed.configureTestingModule({
      imports: [DashboardShellComponent],
      providers: [
        provideRouter([
          {
            path: 'dashboard/products',
            component: DashboardProductsStubComponent,
          },
          {
            path: 'login',
            component: DashboardProductsStubComponent,
          },
        ]),
        {
          provide: AuthStore,
          useValue: authStoreMock,
        },
      ],
    }).compileComponents();
  });

  it('shows username from auth store', async () => {
    const fixture = TestBed.createComponent(DashboardShellComponent);

    fixture.detectChanges();
    await fixture.whenStable();

    expect(fixture.nativeElement.textContent).toContain('warehouse.user');
  });

  it('clears session and redirects to login on logout', async () => {
    const fixture = TestBed.createComponent(DashboardShellComponent);
    const router = TestBed.inject(Router);
    const navigateCalls: unknown[] = [];
    router.navigate = ((...args: unknown[]) => {
      navigateCalls.push(args);
      return Promise.resolve(true);
    }) as Router['navigate'];

    fixture.detectChanges();
    await fixture.whenStable();

    const logoutButton = fixture.nativeElement.querySelector(
      'button',
    ) as HTMLButtonElement;
    logoutButton.click();
    await fixture.whenStable();

    expect(clearSessionCalls).toBe(1);
    expect(navigateCalls).toEqual([[['/login']]]);
  });
});
