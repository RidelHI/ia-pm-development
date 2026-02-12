import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { AuthApiService } from '../../../core/auth/auth-api.service';

@Component({
  selector: 'app-login-page',
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <main class="min-h-screen bg-shell p-6 md:p-10">
      <section class="mx-auto grid max-w-5xl overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-2xl shadow-sky-950/10 md:grid-cols-2">
        <article class="bg-gradient-to-br from-sky-900 to-cyan-700 p-8 text-white md:p-10">
          <p class="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-200">
            Warehouse Portal
          </p>
          <h1 class="mt-3 text-3xl font-semibold leading-tight md:text-4xl">
            Login para ver productos protegidos
          </h1>
          <p class="mt-4 text-sm leading-relaxed text-cyan-100/90">
            Base FE-03 con arquitectura feature-first, guard funcional e interceptor HTTP.
          </p>
        </article>

        <article class="p-8 md:p-10">
          <form [formGroup]="form" (ngSubmit)="submit()" class="space-y-4">
            <label class="block space-y-1">
              <span class="text-sm font-semibold text-slate-700">Usuario</span>
              <input
                formControlName="username"
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
                autocomplete="current-password"
                class="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none ring-cyan-400 transition focus:ring-2"
                placeholder="StrongPassword123!"
                type="password"
              />
            </label>

            @if (errorMessage()) {
              <p class="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                {{ errorMessage() }}
              </p>
            }

            @if (infoMessage()) {
              <p class="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                {{ infoMessage() }}
              </p>
            }

            <button
              [disabled]="isSubmitting()"
              class="w-full rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
              type="submit"
            >
              @if (isSubmitting()) { Entrando... } @else { Entrar }
            </button>
          </form>

          <p class="mt-4 text-sm text-slate-600">
            ¿No tienes cuenta?
            <a routerLink="/register" class="font-semibold text-cyan-700 underline">
              Crear usuario
            </a>
          </p>
        </article>
      </section>
    </main>
  `,
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
