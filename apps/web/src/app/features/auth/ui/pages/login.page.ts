import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { firstValueFrom } from 'rxjs';
import { AuthApiService } from '../../data-access/auth-api.service';

@Component({
  selector: 'app-login-page',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <main class="auth-page">
      <section class="auth-layout">
        <mat-card class="brand-panel" appearance="outlined">
          <p class="brand-eyebrow">Warehouse Portal</p>
          <h1>Login para ver productos protegidos</h1>
          <p class="brand-copy">
            Flujo autenticado con guard + interceptor y dashboard operativo en Angular Material.
          </p>
        </mat-card>

        <mat-card class="auth-panel" appearance="outlined">
          <h2>Iniciar sesión</h2>
          <p class="subtitle">Accede a la gestión de productos protegida.</p>

          <form [formGroup]="form" (ngSubmit)="submit()" novalidate>
            <mat-form-field appearance="outline">
              <mat-label>Usuario</mat-label>
              <input
                matInput
                formControlName="username"
                [attr.aria-invalid]="form.controls.username.invalid && form.controls.username.touched"
                autocomplete="username"
                placeholder="warehouse.user"
                type="text"
              />
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Password</mat-label>
              <input
                matInput
                formControlName="password"
                [attr.aria-invalid]="form.controls.password.invalid && form.controls.password.touched"
                autocomplete="current-password"
                placeholder="StrongPassword123!"
                type="password"
              />
            </mat-form-field>

            @if (errorMessage()) {
              <p aria-live="assertive" class="message message-error" role="alert">
                {{ errorMessage() }}
              </p>
            }

            @if (infoMessage()) {
              <p aria-live="polite" class="message message-info" role="status">
                {{ infoMessage() }}
              </p>
            }

            <button
              mat-flat-button
              color="primary"
              [attr.aria-busy]="isSubmitting()"
              [disabled]="isSubmitting()"
              type="submit"
            >
              @if (isSubmitting()) {
                <mat-progress-spinner
                  class="button-spinner"
                  diameter="18"
                  mode="indeterminate"
                ></mat-progress-spinner>
                Entrando...
              } @else {
                Entrar
              }
            </button>
          </form>

          <p class="link-line">
            ¿No tienes cuenta?
            <a routerLink="/register">Crear usuario</a>
          </p>
        </mat-card>
      </section>
    </main>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      .auth-page {
        min-height: 100vh;
        display: grid;
        place-items: center;
        padding: clamp(1rem, 3vw, 2.5rem);
      }

      .auth-layout {
        width: min(1100px, 100%);
        display: grid;
        gap: 1rem;
      }

      .brand-panel {
        border-color: color-mix(in srgb, var(--border-soft) 75%, white);
        background:
          linear-gradient(155deg, #0f2f57 0%, #236ca4 45%, #62b4dc 100%)
          border-box;
        color: #eaf6ff;
      }

      .brand-eyebrow {
        margin: 0;
        letter-spacing: 0.22em;
        text-transform: uppercase;
        font-size: 0.75rem;
        font-weight: 700;
      }

      .brand-panel h1 {
        margin: 0.8rem 0;
        max-width: 22ch;
        font-size: clamp(1.6rem, 3vw, 2.2rem);
        line-height: 1.15;
      }

      .brand-copy {
        margin: 0;
        max-width: 34ch;
        color: #ddf2ff;
      }

      .auth-panel {
        border-color: color-mix(in srgb, var(--border-soft) 70%, white);
        background: var(--panel-background);
        backdrop-filter: blur(8px);
      }

      .auth-panel h2 {
        margin: 0;
        font-size: 1.4rem;
      }

      .subtitle {
        margin: 0.4rem 0 1rem;
        color: var(--text-muted);
      }

      form {
        display: grid;
        gap: 0.5rem;
      }

      mat-form-field {
        width: 100%;
      }

      button[type='submit'] {
        width: 100%;
        min-height: 46px;
        display: inline-flex;
        justify-content: center;
        align-items: center;
        gap: 0.6rem;
      }

      .button-spinner {
        --mdc-circular-progress-active-indicator-color: currentColor;
      }

      .message {
        margin: 0;
        padding: 0.7rem 0.8rem;
        border-radius: 10px;
        border: 1px solid transparent;
        font-size: 0.9rem;
      }

      .message-error {
        border-color: #f9b4b4;
        background: #fff1f1;
        color: var(--status-error);
      }

      .message-info {
        border-color: #9ac6ff;
        background: #eef5ff;
        color: #00468c;
      }

      .link-line {
        margin: 1.2rem 0 0;
        color: var(--text-muted);
        font-size: 0.92rem;
      }

      .link-line a {
        color: #0057b7;
        font-weight: 700;
      }

      @media (min-width: 900px) {
        .auth-layout {
          grid-template-columns: minmax(330px, 1fr) minmax(370px, 1fr);
          align-items: stretch;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginPageComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly authApiService = inject(AuthApiService);
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);

  readonly form = this.formBuilder.nonNullable.group({
    username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(64)]],
    password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(128)]],
  });
  readonly isSubmitting = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly infoMessage = signal<string | null>(null);

  constructor() {
    const registered = this.activatedRoute.snapshot.queryParamMap.get('registered');
    const username = this.activatedRoute.snapshot.queryParamMap.get('username');

    if (username) {
      this.form.patchValue({ username });
    }

    if (registered === '1') {
      this.infoMessage.set('Usuario registrado. Ahora inicia sesión.');
    }
  }

  async submit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.errorMessage.set('Completa usuario y password con formato válido.');
      this.infoMessage.set(null);
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);
    this.infoMessage.set(null);

    try {
      await firstValueFrom(this.authApiService.login(this.form.getRawValue()));
      await this.router.navigate(['/products']);
    } catch (error) {
      this.errorMessage.set(this.resolveErrorMessage(error));
    } finally {
      this.isSubmitting.set(false);
    }
  }

  private resolveErrorMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      if (error.status === 400) {
        return 'Usuario y password deben cumplir el formato requerido.';
      }

      if (error.status === 401) {
        return 'Credenciales inválidas. Revisa usuario y password.';
      }
    }

    return 'No se pudo iniciar sesión. Intenta nuevamente.';
  }
}
