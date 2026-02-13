import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { firstValueFrom } from 'rxjs';
import { AuthApiService } from '../../data-access/auth-api.service';

@Component({
  selector: 'app-register-page',
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
    <main class="register-page">
      <mat-card class="register-card" appearance="outlined">
        <p class="eyebrow">Nuevo acceso</p>
        <h1>Crear usuario</h1>
        <p class="subtitle">
          Endpoint backend: <code>/v1/auth/register</code>
        </p>

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
              autocomplete="new-password"
              placeholder="StrongPassword123!"
              type="password"
            />
          </mat-form-field>

          @if (errorMessage()) {
            <p aria-live="assertive" class="message message-error" role="alert">
              {{ errorMessage() }}
            </p>
          }

          @if (successMessage()) {
            <p aria-live="polite" class="message message-success" role="status">
              {{ successMessage() }}
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
              Registrando...
            } @else {
              Registrar usuario
            }
          </button>
        </form>

        <p class="link-line">
          ¿Ya tienes cuenta?
          <a routerLink="/login">Ir a login</a>
        </p>
      </mat-card>
    </main>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      .register-page {
        min-height: 100vh;
        display: grid;
        place-items: center;
        padding: clamp(1rem, 3vw, 2.5rem);
      }

      .register-card {
        width: min(560px, 100%);
        border-color: color-mix(in srgb, var(--border-soft) 65%, white);
        background: var(--panel-background);
        backdrop-filter: blur(8px);
      }

      .eyebrow {
        margin: 0;
        text-transform: uppercase;
        letter-spacing: 0.2em;
        font-size: 0.72rem;
        font-weight: 700;
        color: #0f4b8b;
      }

      h1 {
        margin: 0.5rem 0 0;
        font-size: clamp(1.7rem, 4vw, 2.2rem);
      }

      .subtitle {
        margin: 0.4rem 0 1.1rem;
        color: var(--text-muted);
      }

      form {
        display: grid;
        gap: 0.55rem;
      }

      mat-form-field,
      button[type='submit'] {
        width: 100%;
      }

      button[type='submit'] {
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

      .message-success {
        border-color: #8fd3a8;
        background: #ecf8f0;
        color: var(--status-success);
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
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterPageComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly authApiService = inject(AuthApiService);
  private readonly router = inject(Router);

  readonly form = this.formBuilder.nonNullable.group({
    username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(64)]],
    password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(128)]],
  });
  readonly isSubmitting = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);

  async submit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.errorMessage.set('Completa usuario y password con formato válido.');
      this.successMessage.set(null);
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    try {
      const response = await firstValueFrom(
        this.authApiService.register(this.form.getRawValue()),
      );
      this.successMessage.set(`Usuario ${response.username} creado correctamente.`);
      await this.router.navigate(['/login'], {
        queryParams: {
          registered: '1',
          username: response.username,
        },
      });
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

      if (error.status === 409) {
        return 'Ese usuario ya existe.';
      }
    }

    return 'No se pudo registrar el usuario. Intenta nuevamente.';
  }
}
