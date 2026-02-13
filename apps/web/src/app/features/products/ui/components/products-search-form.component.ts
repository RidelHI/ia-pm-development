import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-products-search-form',
  imports: [
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <form class="search-form" (submit)="onSubmit($event)" novalidate>
      <mat-form-field appearance="outline" class="search-input">
        <mat-label>Buscar productos</mat-label>
        <input
          matInput
          id="products-query"
          [value]="query()"
          (input)="onQueryInput($event)"
          aria-label="Buscar productos por nombre o SKU"
          placeholder="Buscar por nombre o SKU"
          type="search"
        />
      </mat-form-field>

      <button
        mat-flat-button
        color="primary"
        [attr.aria-busy]="loading()"
        [disabled]="loading()"
        type="submit"
      >
        @if (loading()) {
          <mat-progress-spinner
            class="button-spinner"
            diameter="18"
            mode="indeterminate"
          ></mat-progress-spinner>
          Cargando...
        } @else {
          Buscar
        }
      </button>
    </form>
  `,
  styles: [
    `
      .search-form {
        display: grid;
        gap: 0.75rem;
      }

      .search-input {
        width: 100%;
      }

      button[type='submit'] {
        width: 100%;
        min-height: 46px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
      }

      .button-spinner {
        --mdc-circular-progress-active-indicator-color: currentColor;
      }

      @media (min-width: 760px) {
        .search-form {
          grid-template-columns: minmax(280px, 1fr) auto;
          align-items: center;
        }

        button[type='submit'] {
          width: auto;
          padding-inline: 1.2rem;
        }
      }
    `,
  ],
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
