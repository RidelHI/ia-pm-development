import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'login',
  },
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./features/auth/ui/pages/login.page').then((m) => m.LoginPageComponent),
  },
  {
    path: 'register',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./features/auth/ui/pages/register.page').then(
        (m) => m.RegisterPageComponent,
      ),
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/dashboard/ui/components/dashboard-shell.component').then(
        (m) => m.DashboardShellComponent,
      ),
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'products',
      },
      {
        path: 'products',
        loadComponent: () =>
          import('./features/products/ui/pages/products.page').then(
            (m) => m.ProductsPageComponent,
          ),
      },
    ],
  },
  {
    path: 'products',
    pathMatch: 'full',
    redirectTo: 'dashboard/products',
  },
  {
    path: '**',
    redirectTo: 'login',
  },
];
