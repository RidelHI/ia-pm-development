import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { AuthApiService } from '../../data-access/auth-api.service';

@Component({
  selector: 'app-register-page',
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <main class="min-h-screen bg-shell p-6 md:p-10">
      <section class="mx-auto max-w-2xl rounded-3xl border border-stone-200 bg-white p-8 shadow-2xl shadow-sky-950/10 md:p-10">
        <p class="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-700">
          Registro
        </p>
        <h1 class="mt-3 text-3xl font-semibold text-slate-900">Crear usuario</h1>
        <p class="mt-2 text-sm text-slate-600">
          Endpoint backend: <code>/v1/auth/register</code>
        </p>

        <form [formGroup]="form" (ngSubmit)="submit()" class="mt-6 space-y-4" novalidate>
          <label class="block space-y-1">
            <span class="text-sm font-semibold text-slate-700">Usuario</span>
            <input
              formControlName="username"
              [attr.aria-invalid]="form.controls.username.invalid && form.controls.username.touched"
              autocomplete="username"
              class="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none ring-cyan-400 transition focus:ring-2"
              placeholder="warehouse.user"
              type="text"
            />
          </label>

          <label class="block space-y-1">
            <span class="text-sm font-semibold text-slate-700">Password</span>
            <input
              formControlName="password"
              [attr.aria-invalid]="form.controls.password.invalid && form.controls.password.touched"
              autocomplete="new-password"
              class="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none ring-cyan-400 transition focus:ring-2"
              placeholder="StrongPassword123!"
              type="password"
            />
          </label>

          @if (errorMessage()) {
            <p
              aria-live="assertive"
              class="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700"
              role="alert"
            >
              {{ errorMessage() }}
            </p>
          }

          @if (successMessage()) {
            <p
              aria-live="polite"
              class="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700"
              role="status"
            >
              {{ successMessage() }}
            </p>
          }

          <button
            [attr.aria-busy]="isSubmitting()"
            [disabled]="isSubmitting()"
            class="w-full rounded-xl bg-cyan-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-cyan-600 disabled:cursor-not-allowed disabled:opacity-60"
            type="submit"
          >
            @if (isSubmitting()) { Registrando... } @else { Registrar usuario }
          </button>
        </form>

        <p class="mt-5 text-sm text-slate-600">
          ¿Ya tienes cuenta?
          <a routerLink="/login" class="font-semibold text-cyan-700 underline">Ir a login</a>
        </p>
      </section>
    </main>
  `,
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
