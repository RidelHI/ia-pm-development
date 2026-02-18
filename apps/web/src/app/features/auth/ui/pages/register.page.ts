import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
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
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <main class="register-page">
      <section class="register-layout">
        <mat-card class="register-brand" appearance="outlined">
          <p class="eyebrow">Onboarding</p>
          <h1>Activa nuevos operadores en minutos</h1>
          <p class="subtitle">
            Provisiona cuentas con credenciales seguras y mantiene trazabilidad desde el primer acceso.
          </p>

          <ol class="steps" aria-label="Pasos de activación">
            <li>
              <span>1</span>
              Registrar usuario y password seguros.
            </li>
            <li>
              <span>2</span>
              Validar ingreso en login.
            </li>
            <li>
              <span>3</span>
              Comenzar operación en el panel de inventario.
            </li>
          </ol>
        </mat-card>

        <mat-card class="register-card" appearance="outlined">
          <p class="eyebrow">Acceso inicial</p>
          <h2>Crear cuenta de operador</h2>
          <p class="subtitle">Alta segura de usuarios para acceso a la plataforma de inventario.</p>

          <form [formGroup]="form" (ngSubmit)="submit()" novalidate>
            <mat-form-field appearance="outline">
              <mat-label>Usuario</mat-label>
              <mat-icon matPrefix aria-hidden="true">person_add</mat-icon>
              <input
                matInput
                formControlName="username"
                [attr.aria-invalid]="form.controls.username.invalid && form.controls.username.touched"
                autocomplete="username"
                placeholder="warehouse.user"
                type="text"
              />
              <mat-hint>Mínimo 3 caracteres.</mat-hint>
              @if (form.controls.username.touched && form.controls.username.hasError('required')) {
                <mat-error>Usuario es obligatorio.</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Password</mat-label>
              <mat-icon matPrefix aria-hidden="true">lock</mat-icon>
              <input
                matInput
                formControlName="password"
                [attr.aria-invalid]="form.controls.password.invalid && form.controls.password.touched"
                autocomplete="new-password"
                placeholder="StrongPassword123!"
                type="password"
              />
              <mat-hint>Mínimo 8 caracteres.</mat-hint>
              @if (form.controls.password.touched && form.controls.password.hasError('required')) {
                <mat-error>Password es obligatorio.</mat-error>
              }
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
      </section>
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

      .register-layout {
        width: min(1040px, 100%);
        display: grid;
        gap: var(--space-4);
      }

      .register-brand {
        border-color: color-mix(in srgb, var(--border-soft) 70%, #fff);
        background: linear-gradient(165deg, #1d3760 0%, #27598f 42%, #4f89c1 100%);
        color: #ecf6ff;
        padding: clamp(1rem, 2.4vw, 1.5rem);
        box-shadow: 0 18px 34px rgba(16, 42, 79, 0.24);
        display: grid;
        gap: var(--space-3);
      }

      .register-card {
        border-color: color-mix(in srgb, var(--border-soft) 65%, #fff);
        background: var(--panel-background);
        padding: clamp(1rem, 2.4vw, 1.5rem);
        box-shadow: var(--elevation-1);
      }

      .eyebrow {
        margin: 0;
        text-transform: uppercase;
        letter-spacing: 0.2em;
        font-size: 0.72rem;
        font-weight: 700;
        color: #0f4b8b;
      }

      .register-brand .eyebrow {
        color: #c6def7;
      }

      h1,
      h2 {
        margin: 0.5rem 0 0;
      }

      h1 {
        font-size: clamp(1.6rem, 3.7vw, 2rem);
      }

      h2 {
        font-size: clamp(1.5rem, 3.7vw, 1.95rem);
      }

      .subtitle {
        margin: 0.4rem 0 1.1rem;
        color: var(--text-muted);
      }

      .register-brand .subtitle {
        color: #dcecff;
        margin-bottom: 0;
      }

      .steps {
        list-style: none;
        margin: 0;
        padding: 0;
        display: grid;
        gap: var(--space-2);
      }

      .steps li {
        display: grid;
        grid-template-columns: auto minmax(0, 1fr);
        gap: var(--space-2);
        align-items: center;
      }

      .steps span {
        width: 1.45rem;
        height: 1.45rem;
        border-radius: 50%;
        border: 1px solid rgba(206, 229, 255, 0.7);
        background: rgba(12, 31, 56, 0.25);
        display: inline-grid;
        place-items: center;
        font-size: 0.75rem;
        font-weight: 700;
      }

      form {
        display: grid;
        gap: 0.7rem;
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
        display: flex;
        gap: var(--space-1);
        flex-wrap: wrap;
      }

      .link-line a {
        color: #0057b7;
        font-weight: 700;
      }

      @media (min-width: 900px) {
        .register-layout {
          grid-template-columns: minmax(300px, 1fr) minmax(380px, 1fr);
          align-items: stretch;
        }
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
