import { BreakpointObserver } from '@angular/cdk/layout';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { map } from 'rxjs';
import { AuthStore } from '../../../auth/state/auth.store';

@Component({
  selector: 'app-products-shell-page',
  imports: [
    RouterLink,
    RouterLinkActive,
    RouterOutlet,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatSidenavModule,
    MatToolbarModule,
  ],
  template: `
    <mat-sidenav-container class="shell-container">
      <mat-sidenav
        class="shell-sidebar"
        [mode]="isHandset() ? 'over' : 'side'"
        [opened]="isHandset() ? sideNavOpened() : true"
      >
        <header class="sidebar-brand">
          <mat-icon aria-hidden="true">warehouse</mat-icon>
          <div>
            <p class="sidebar-eyebrow">Warehouse SaaS</p>
            <h1>Command Center</h1>
          </div>
        </header>

        <mat-nav-list>
          <a
            mat-list-item
            routerLink="/products"
            routerLinkActive="sidebar-link-active"
            [routerLinkActiveOptions]="{ exact: true }"
            (click)="closeSidebarOnMobile()"
          >
            <mat-icon matListItemIcon aria-hidden="true">inventory_2</mat-icon>
            <span matListItemTitle>Productos</span>
            <span matListItemLine>Dashboard operativo</span>
          </a>
        </mat-nav-list>

        <footer class="sidebar-footer">
          <p>Sesión: {{ username() || 'usuario' }}</p>
          <button mat-stroked-button type="button" (click)="logout()">Cerrar sesión</button>
        </footer>
      </mat-sidenav>

      <mat-sidenav-content>
        <mat-toolbar class="shell-toolbar">
          <button
            mat-icon-button
            type="button"
            (click)="toggleSidebar()"
            aria-label="Abrir navegacion lateral"
          >
            <mat-icon aria-hidden="true">menu</mat-icon>
          </button>

          <div class="toolbar-title-wrap">
            <p class="toolbar-eyebrow">Panel principal</p>
            <p class="toolbar-title">Inventario y operaciones</p>
          </div>
        </mat-toolbar>

        <router-outlet />
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      .shell-container {
        min-height: 100vh;
      }

      .shell-sidebar {
        width: min(300px, 86vw);
        background: linear-gradient(190deg, var(--sidebar-background) 0%, #102a4d 100%);
        border-right: 1px solid #1b365d;
        color: var(--text-inverse);
        padding: var(--space-4);
        overflow-x: hidden;
        display: grid;
        grid-template-rows: auto auto 1fr;
        gap: var(--space-3);
      }

      .sidebar-brand {
        display: grid;
        grid-template-columns: auto minmax(0, 1fr);
        gap: var(--space-2);
        align-items: center;
      }

      .sidebar-brand mat-icon {
        width: 38px;
        height: 38px;
        font-size: 38px;
      }

      .sidebar-eyebrow {
        margin: 0;
        font-size: 0.7rem;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        opacity: 0.78;
      }

      .sidebar-brand h1 {
        margin-top: var(--space-1);
        font-size: 1.55rem;
        line-height: 1.1;
      }

      .sidebar-link-active {
        border-radius: var(--radius-lg);
        background: rgba(163, 205, 255, 0.2);
      }

      .sidebar-footer {
        display: grid;
        gap: var(--space-2);
        align-content: end;
      }

      .sidebar-footer p {
        margin: 0;
        color: #d2e3ff;
        font-size: 0.84rem;
        line-height: 1.25;
        overflow-wrap: anywhere;
      }

      .shell-toolbar {
        position: sticky;
        top: 0;
        z-index: 20;
        border-bottom: 1px solid var(--border-soft);
        background: var(--toolbar-background);
        color: var(--text-primary);
        min-height: 72px;
        padding-inline: clamp(0.75rem, 2vw, 1.75rem);
        gap: var(--space-4);
      }

      .shell-toolbar button {
        color: #466589;
      }

      .toolbar-title-wrap {
        display: grid;
        gap: 2px;
      }

      .toolbar-eyebrow {
        margin: 0;
        color: var(--text-muted);
        text-transform: uppercase;
        letter-spacing: 0.08em;
        font-size: 0.67rem;
        font-weight: 700;
      }

      .toolbar-title {
        margin: 0;
        font-size: 1.28rem;
        font-weight: 700;
        letter-spacing: 0.01em;
      }

      mat-nav-list a[mat-list-item] {
        margin-bottom: var(--space-1);
        border-radius: var(--radius-lg);
      }

      mat-nav-list a[mat-list-item] span[matListItemTitle] {
        font-weight: 600;
        color: #eaf3ff;
      }

      mat-nav-list a[mat-list-item] span[matListItemLine] {
        color: #9db6d6;
      }

      mat-nav-list a[mat-list-item] mat-icon {
        color: #b5cff1;
      }

      @media (max-width: 720px) {
        .shell-sidebar {
          width: min(320px, 88vw);
          padding: var(--space-3);
        }

        .shell-toolbar {
          min-height: 64px;
          padding-inline: var(--space-3);
        }

        .toolbar-title {
          font-size: 1.15rem;
        }

        .sidebar-brand h1 {
          font-size: 1.35rem;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductsShellPageComponent {
  private readonly authStore = inject(AuthStore);
  private readonly router = inject(Router);
  private readonly breakpointObserver = inject(BreakpointObserver);

  readonly sideNavOpened = signal(false);
  readonly isHandset = toSignal(
    this.breakpointObserver.observe('(max-width: 960px)').pipe(map((state) => state.matches)),
    {
      initialValue: false,
    },
  );
  readonly username = computed(() => this.authStore.session()?.username ?? null);

  constructor() {
    effect(() => {
      if (!this.isHandset()) {
        this.sideNavOpened.set(true);
      }
    });
  }

  toggleSidebar(): void {
    if (this.isHandset()) {
      this.sideNavOpened.update((current) => !current);
      return;
    }

    this.sideNavOpened.set(true);
  }

  closeSidebarOnMobile(): void {
    if (!this.isHandset()) {
      return;
    }

    this.sideNavOpened.set(false);
  }

  logout(): void {
    this.authStore.clearSession();
    this.closeSidebarOnMobile();
    void this.router.navigate(['/login']);
  }
}
