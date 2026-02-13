import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-products-feedback',
  imports: [MatCardModule],
  template: `
    @if (errorMessage()) {
      <mat-card class="feedback-card feedback-error" appearance="outlined" role="alert" aria-live="assertive">
        <p>{{ errorMessage() }}</p>
      </mat-card>
    } @else if (isEmpty()) {
      <mat-card class="feedback-card feedback-empty" appearance="outlined" role="status" aria-live="polite">
        <p>No hay productos para mostrar con los filtros actuales.</p>
      </mat-card>
    }
  `,
  styles: [
    `
      .feedback-card {
        border-radius: 14px;
      }

      .feedback-card p {
        margin: 0;
      }

      .feedback-error {
        border-color: #f2b0b0;
        background: #fff4f4;
        color: var(--status-error);
      }

      .feedback-empty {
        border-color: color-mix(in srgb, var(--border-soft) 80%, white);
        color: var(--text-muted);
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductsFeedbackComponent {
  readonly errorMessage = input<string | null>(null);
  readonly isEmpty = input(false);
}
