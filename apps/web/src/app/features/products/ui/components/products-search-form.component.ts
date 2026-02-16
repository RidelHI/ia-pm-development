import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-products-search-form',
  imports: [
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <form class="search-form" (submit)="onSubmit($event)" novalidate>
      <mat-form-field appearance="outline" class="search-input">
        <mat-icon matPrefix aria-hidden="true">search</mat-icon>
        <input
          matInput
          id="products-query"
          [value]="query()"
          (input)="onQueryInput($event)"
          aria-label="Buscar productos por nombre o SKU"
          placeholder="SKU, nombre, marca o ubicación"
          type="search"
        />
        <button
          mat-icon-button
          matSuffix
          type="button"
          aria-label="Limpiar búsqueda"
          [disabled]="!query()"
          (click)="queryChange.emit('')"
        >
          <mat-icon aria-hidden="true">close</mat-icon>
        </button>
        <mat-hint>Usa coincidencias parciales para encontrar resultados más rápido.</mat-hint>
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
          Aplicar filtros
        }
      </button>
    </form>
  `,
  styles: [
    `
      .search-form {
        display: grid;
        gap: var(--space-3);
      }

      .search-input {
        width: 100%;
        --mat-form-field-container-height: 40px;
        --mat-form-field-container-text-size: 0.88rem;
        --mat-form-field-container-vertical-padding: 0.35rem;
      }

      .search-input .mat-mdc-form-field-subscript-wrapper {
        margin-top: 2px;
      }

      button[type='submit'] {
        width: 100%;
        min-height: 40px;
        font-size: 0.88rem;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: var(--space-2);
      }

      .button-spinner {
        --mdc-circular-progress-active-indicator-color: currentColor;
      }

      @media (min-width: 760px) {
        .search-form {
          grid-template-columns: minmax(0, 1fr) auto;
          align-items: start;
        }

        button[type='submit'] {
          width: auto;
          padding-inline: 1rem;
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
