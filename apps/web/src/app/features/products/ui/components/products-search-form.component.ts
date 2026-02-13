import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'app-products-search-form',
  template: `
    <form class="flex flex-wrap gap-3" (submit)="onSubmit($event)" novalidate>
      <label class="sr-only" for="products-query">Buscar productos</label>
      <input
        id="products-query"
        [value]="query()"
        (input)="onQueryInput($event)"
        aria-label="Buscar productos por nombre o SKU"
        class="min-w-64 flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-cyan-400 focus:ring-2"
        placeholder="Buscar por nombre o SKU"
        type="search"
      />
      <button
        [attr.aria-busy]="loading()"
        [disabled]="loading()"
        class="rounded-lg bg-cyan-700 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-600 disabled:cursor-not-allowed disabled:opacity-60"
        type="submit"
      >
        @if (loading()) { Cargando... } @else { Buscar }
      </button>
    </form>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductsSearchFormComponent {
  readonly query = input('');
  readonly loading = input(false);
  readonly queryChange = output<string>();
  readonly searchRequested = output<void>();

  onQueryInput(event: Event): void {
    const target = event.target;

    if (!(target instanceof HTMLInputElement)) {
      return;
    }

    this.queryChange.emit(target.value);
  }

  onSubmit(event: Event): void {
    event.preventDefault();
    this.searchRequested.emit();
  }
}
