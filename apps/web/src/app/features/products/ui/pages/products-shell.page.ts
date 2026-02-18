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
import { MatTooltipModule } from '@angular/material/tooltip';
import { map } from 'rxjs';
import { AuthStore } from '../../../auth/state/auth.store';

interface SidebarNavigationItem {
  route: string;
  icon: string;
  label: string;
  helperText: string;
}

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
    MatTooltipModule,
  ],
  template: `
    <mat-sidenav-container class="shell-container">
      <mat-sidenav
        class="shell-sidebar"
        [class.shell-sidebar-collapsed]="isSidebarCollapsed()"
        [mode]="isHandset() ? 'over' : 'side'"
        [opened]="isHandset() ? sideNavOpened() : true"
      >
        <div class="shell-sidebar-inner">
          <header class="sidebar-brand" [class.sidebar-brand-collapsed]="isSidebarCollapsed()">
            <mat-icon aria-hidden="true">warehouse</mat-icon>
            @if (!isSidebarCollapsed()) {
              <div class="sidebar-brand-copy">
                <p class="sidebar-eyebrow">Warehouse SaaS</p>
                <h1>Command Center</h1>
                <p class="sidebar-badge">Live operations</p>
              </div>
            }
          </header>

          <mat-nav-list class="sidebar-nav" aria-label="Opciones de navegación">
            @for (item of sidebarNavigationItems; track item.route) {
              <a
                mat-list-item
                [routerLink]="item.route"
                routerLinkActive="sidebar-link-active"
                [routerLinkActiveOptions]="{ exact: true }"
                [matTooltip]="item.label"
                [matTooltipDisabled]="!isSidebarCollapsed()"
                matTooltipPosition="right"
                [attr.aria-label]="isSidebarCollapsed() ? item.label : null"
                (click)="closeSidebarOnMobile()"
              >
                <mat-icon matListItemIcon aria-hidden="true">{{ item.icon }}</mat-icon>
                @if (!isSidebarCollapsed()) {
                  <span matListItemTitle>{{ item.label }}</span>
                }
                @if (!isSidebarCollapsed()) {
                  <span matListItemLine>{{ item.helperText }}</span>
                }
              </a>
            }
          </mat-nav-list>

          <footer class="sidebar-footer">
            @if (!isSidebarCollapsed()) {
              <p>Sesión: {{ username() || 'usuario' }}</p>
            }
            <button
              mat-stroked-button
              type="button"
              [matTooltip]="isSidebarCollapsed() ? 'Cerrar sesión' : ''"
              matTooltipPosition="right"
              [attr.aria-label]="isSidebarCollapsed() ? 'Cerrar sesión' : null"
              (click)="logout()"
            >
              <mat-icon aria-hidden="true">logout</mat-icon>
              @if (!isSidebarCollapsed()) {
                <span>Cerrar sesión</span>
              }
            </button>
          </footer>
        </div>
      </mat-sidenav>

      <mat-sidenav-content>
        <mat-toolbar class="shell-toolbar">
          <button
            mat-icon-button
            type="button"
            (click)="toggleSidebar()"
            [attr.aria-label]="toggleButtonLabel()"
          >
            <mat-icon aria-hidden="true">menu</mat-icon>
          </button>

          <div class="toolbar-title-wrap">
            <p class="toolbar-eyebrow">Panel principal</p>
            <p class="toolbar-title">Inventario y operaciones</p>
          </div>

          <div class="toolbar-meta">
            <span class="meta-dot" aria-hidden="true"></span>
            <span>{{ isHandset() ? 'Modo móvil' : 'Modo escritorio' }}</span>
            <strong>{{ username() || 'usuario' }}</strong>
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
        min-height: 100dvh;
      }

      .shell-sidebar {
        width: min(300px, 86vw);
        background: linear-gradient(190deg, var(--sidebar-background) 0%, #102a4d 100%);
        border-right: 1px solid #1b365d;
        color: var(--text-inverse);
        overflow: hidden;
        transition: width 200ms ease;
      }

      .shell-sidebar.shell-sidebar-collapsed {
        width: 78px;
      }

      .shell-sidebar-inner {
        height: 100%;
        display: grid;
        grid-template-rows: auto minmax(0, 1fr) auto;
        gap: var(--space-3);
        padding: var(--space-4);
      }

      .sidebar-nav {
        min-height: 0;
        overflow-y: auto;
        overflow-x: hidden;
        padding-top: 0;
        padding-bottom: 0;
        scrollbar-width: none;
        -ms-overflow-style: none;
      }

      .sidebar-nav::-webkit-scrollbar {
        width: 0;
        height: 0;
      }

      .sidebar-brand-collapsed {
        display: flex;
        justify-content: center;
        align-items: center;
      }

      .sidebar-brand-copy {
        min-width: 0;
      }

      .shell-sidebar-collapsed .sidebar-nav a[mat-list-item] {
        justify-content: center;
      }

      .shell-sidebar-collapsed .sidebar-footer {
        justify-items: center;
      }

      .shell-sidebar-collapsed .sidebar-footer button {
        min-width: 44px;
        width: 44px;
        padding-inline: 0;
      }

      .shell-sidebar-collapsed a[mat-list-item] {
        min-height: 52px;
      }

      .shell-sidebar-collapsed a[mat-list-item] .mdc-list-item__start {
        margin-right: 0;
      }

      .shell-sidebar-collapsed a[mat-list-item] span[matListItemTitle],
      .shell-sidebar-collapsed a[mat-list-item] span[matListItemLine] {
        display: none;
      }

      .sidebar-footer {
        overflow-x: hidden;
        display: grid;
        gap: var(--space-2);
        align-content: end;
      }

      .sidebar-brand {
        display: grid;
        grid-template-columns: auto minmax(0, 1fr);
        gap: var(--space-2);
        align-items: center;
      }

      .sidebar-brand mat-icon {
        width: 30px;
        height: 30px;
        font-size: 30px;
      }

      .shell-sidebar-collapsed .sidebar-brand mat-icon {
        width: 26px;
        height: 26px;
        font-size: 26px;
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
        font-size: 1.45rem;
        line-height: 1.1;
      }

      .sidebar-badge {
        margin: var(--space-2) 0 0;
        display: inline-flex;
        align-items: center;
        border-radius: 999px;
        border: 1px solid rgba(178, 212, 255, 0.32);
        background: rgba(178, 212, 255, 0.16);
        color: #dceeff;
        padding: 0.2rem 0.58rem;
        font-size: 0.68rem;
        text-transform: uppercase;
        letter-spacing: 0.09em;
      }

      .sidebar-link-active {
        border-radius: var(--radius-lg);
        background: rgba(163, 205, 255, 0.2);
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
        background: color-mix(in srgb, var(--toolbar-background) 90%, #d9ebff);
        backdrop-filter: blur(7px);
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

      .toolbar-meta {
        margin-left: auto;
        display: inline-flex;
        align-items: center;
        gap: var(--space-2);
        border-radius: 999px;
        border: 1px solid color-mix(in srgb, var(--border-soft) 70%, #fff);
        background: #fff;
        color: #3f5677;
        padding: 0.35rem 0.65rem;
        font-size: 0.75rem;
        white-space: nowrap;
      }

      .toolbar-meta strong {
        max-width: 130px;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .meta-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: #26a269;
        box-shadow: 0 0 0 3px rgba(38, 162, 105, 0.2);
      }

      mat-nav-list a[mat-list-item] {
        margin-bottom: var(--space-1);
        border-radius: var(--radius-lg);
        min-height: 58px;
        padding-inline: 0.5rem;
      }

      mat-nav-list a[mat-list-item] span[matListItemTitle] {
        font-weight: 600;
        color: #eaf3ff;
        font-size: 0.98rem;
      }

      mat-nav-list a[mat-list-item] span[matListItemLine] {
        color: #9db6d6;
        font-size: 0.83rem;
      }

      mat-nav-list a[mat-list-item] mat-icon {
        color: #b5cff1;
        width: 1.22rem;
        height: 1.22rem;
        font-size: 1.22rem;
      }

      @media (max-width: 720px) {
        .shell-sidebar {
          width: min(320px, 88vw);
        }

        .shell-sidebar-inner {
          padding: var(--space-3);
        }

        .shell-toolbar {
          min-height: 64px;
          padding-inline: var(--space-3);
        }

        .toolbar-title {
          font-size: 1.15rem;
        }

        .toolbar-meta {
          display: none;
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

  readonly sidebarNavigationItems: readonly SidebarNavigationItem[] = [
    {
      route: '/products',
      icon: 'inventory_2',
      label: 'Productos',
      helperText: 'Dashboard operativo',
    },
  ];

  readonly sideNavOpened = signal(false);
  readonly desktopSidebarCollapsed = signal(false);
  readonly isHandset = toSignal(
    this.breakpointObserver.observe('(max-width: 960px)').pipe(map((state) => state.matches)),
    {
      initialValue: false,
    },
  );
  readonly username = computed(() => this.authStore.session()?.username ?? null);
  readonly isSidebarCollapsed = computed(
    () => !this.isHandset() && this.desktopSidebarCollapsed(),
  );

  constructor() {
    effect(() => {
      if (this.isHandset()) {
        this.sideNavOpened.set(false);
        return;
      }

      this.sideNavOpened.set(true);
    });
  }

  toggleSidebar(): void {
    if (this.isHandset()) {
      this.sideNavOpened.update((current) => !current);
      return;
    }

    this.desktopSidebarCollapsed.update((current) => !current);
    this.sideNavOpened.set(true);
  }

  toggleButtonLabel(): string {
    if (this.isHandset()) {
      return this.sideNavOpened() ? 'Cerrar navegacion lateral' : 'Abrir navegacion lateral';
    }

    return this.isSidebarCollapsed()
      ? 'Expandir panel lateral'
      : 'Contraer panel lateral a solo iconos';
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
