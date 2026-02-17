import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-products-feedback',
  imports: [MatButtonModule, MatCardModule, MatIconModule],
  template: `
    @if (errorMessage()) {
      <mat-card
        class="feedback-card feedback-error"
        appearance="outlined"
        role="alert"
        aria-live="assertive"
      >
        <div class="feedback-layout">
          <mat-icon aria-hidden="true">error</mat-icon>
          <div>
            <h3>No se pudo cargar inventario</h3>
            <p>{{ errorMessage() }}</p>
            <button mat-stroked-button type="button" (click)="retryRequested.emit()">
              Reintentar
            </button>
          </div>
        </div>
      </mat-card>
    } @else if (isEmpty()) {
      <mat-card
        class="feedback-card feedback-empty"
        appearance="outlined"
        role="status"
        aria-live="polite"
      >
        <div class="feedback-layout">
          <mat-icon aria-hidden="true">inventory_2</mat-icon>
          <div>
            <h3>No hay productos para mostrar</h3>
            <p>Ajusta filtros o crea tu primer producto para comenzar.</p>
            <button mat-flat-button color="primary" type="button" (click)="createRequested.emit()">
              Crear producto
            </button>
          </div>
        </div>
      </mat-card>
    }
  `,
  styles: [
    `
      .feedback-card {
        border-radius: var(--radius-lg);
        padding: var(--space-2);
      }

      .feedback-error {
        border-color: #f9c9c9;
        background: #fff5f5;
        color: var(--status-error);
      }

      .feedback-empty {
        border-color: var(--border-soft);
        background: var(--panel-background);
        color: var(--text-muted);
      }

      .feedback-layout {
        display: grid;
        grid-template-columns: auto minmax(0, 1fr);
        gap: var(--space-4);
        align-items: flex-start;
      }

      .feedback-layout mat-icon {
        margin-top: var(--space-1);
      }

      h3 {
        margin: 0;
        font-size: 1.1rem;
      }

      p {
        margin: var(--space-2) 0 var(--space-4);
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductsFeedbackComponent {
  readonly errorMessage = input<string | null>(null);
  readonly isEmpty = input(false);
  readonly retryRequested = output<void>();
  readonly createRequested = output<void>();
}
