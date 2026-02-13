import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { AuthApiService } from '../../data-access/auth-api.service';

@Component({
  selector: 'app-login-page',
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <main class="min-h-screen bg-shell px-4 py-6 md:px-8 md:py-10">
      <section class="mx-auto grid max-w-5xl overflow-hidden rounded-3xl border border-white/60 bg-white/90 shadow-xl shadow-cyan-950/10 backdrop-blur md:grid-cols-2">
        <article class="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-900 to-cyan-800 p-8 text-white md:p-10">
          <div class="pointer-events-none absolute -right-8 top-4 h-32 w-32 rounded-full bg-cyan-300/30 blur-2xl"></div>
          <p class="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200">
            Warehouse Portal
          </p>
          <h1 class="mt-3 text-3xl font-semibold leading-tight md:text-4xl">
            Login para ver productos protegidos
          </h1>
          <p class="mt-4 text-sm leading-relaxed text-cyan-100/90">
            Accede al dashboard para gestionar productos, imagenes y estados del inventario.
          </p>
          <div class="mt-6 rounded-2xl border border-cyan-100/20 bg-white/10 p-4">
            <p class="text-xs uppercase tracking-[0.18em] text-cyan-100/85">
              Sesion segura
            </p>
            <p class="mt-1 text-sm text-cyan-100/90">
              Guard funcional, interceptor bearer y estado persistido.
            </p>
          </div>
        </article>

        <article class="p-8 md:p-10">
          <p class="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">
            Iniciar sesion
          </p>
          <h2 class="mt-2 text-2xl font-semibold text-slate-900">Bienvenido de nuevo</h2>
          <p class="mt-1 text-sm text-slate-600">
            Ingresa tus credenciales para continuar al panel principal.
          </p>

          <form [formGroup]="form" (ngSubmit)="submit()" class="mt-6 space-y-4" novalidate>
            <label class="block space-y-1">
              <span class="text-sm font-semibold text-slate-700">Usuario</span>
              <input
                formControlName="username"
                [attr.aria-invalid]="form.controls.username.invalid && form.controls.username.touched"
                autocomplete="username"
                class="w-full rounded-xl border border-slate-300 bg-slate-50/70 px-3 py-2 text-sm outline-none ring-cyan-400 transition focus:border-cyan-400 focus:bg-white focus:ring-2"
                placeholder="warehouse.user"
                type="text"
              />
            </label>

            <label class="block space-y-1">
              <span class="text-sm font-semibold text-slate-700">Password</span>
              <input
                formControlName="password"
                [attr.aria-invalid]="form.controls.password.invalid && form.controls.password.touched"
                autocomplete="current-password"
                class="w-full rounded-xl border border-slate-300 bg-slate-50/70 px-3 py-2 text-sm outline-none ring-cyan-400 transition focus:border-cyan-400 focus:bg-white focus:ring-2"
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

            @if (infoMessage()) {
              <p
                aria-live="polite"
                class="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700"
                role="status"
              >
                {{ infoMessage() }}
              </p>
            }

            <button
              [attr.aria-busy]="isSubmitting()"
              [disabled]="isSubmitting()"
              class="w-full rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
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
      await this.router.navigate(['/dashboard/products']);
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
