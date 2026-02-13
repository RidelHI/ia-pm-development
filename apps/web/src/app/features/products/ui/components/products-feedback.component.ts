import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-products-feedback',
  template: `
    @if (errorMessage()) {
      <section
        aria-live="assertive"
        class="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
        role="alert"
      >
        {{ errorMessage() }}
      </section>
    } @else if (isEmpty()) {
      <section
        aria-live="polite"
        class="rounded-2xl border border-stone-200 bg-white px-4 py-8 text-center text-sm text-slate-600 shadow-sm"
      >
        No hay productos para mostrar con los filtros actuales.
      </section>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductsFeedbackComponent {
  readonly errorMessage = input<string | null>(null);
  readonly isEmpty = input(false);
}
