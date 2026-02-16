import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
  effect,
  input,
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Chart, DoughnutController, ArcElement, Tooltip, Legend } from 'chart.js';
import type { Product } from '../../domain/products.models';

Chart.register(DoughnutController, ArcElement, Tooltip, Legend);

@Component({
  selector: 'app-products-stock-chart',
  imports: [MatIconModule],
  template: `
    <section class="chart-card" aria-labelledby="stock-chart-title">
      <div class="chart-header">
        <div>
          <p class="chart-eyebrow">Inventario</p>
          <h3 id="stock-chart-title">Distribución de estado</h3>
        </div>
        <mat-icon aria-hidden="true">donut_small</mat-icon>
      </div>

      @if (products().length > 0) {
        <div class="chart-shell">
          <canvas #chartCanvas aria-label="Distribución de productos por estado"></canvas>
        </div>
      } @else {
        <div class="chart-empty">
          <mat-icon aria-hidden="true">insights</mat-icon>
          <p>Sin datos para graficar todavía.</p>
        </div>
      }
    </section>
  `,
  styles: [
    `
      .chart-card {
        min-height: 100%;
        padding: var(--space-1);
      }

      .chart-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: var(--space-2);
      }

      .chart-eyebrow {
        margin: 0;
        color: var(--text-muted);
        text-transform: uppercase;
        letter-spacing: 0.08em;
        font-size: 0.7rem;
        font-weight: 700;
      }

      .chart-header h3 {
        margin-top: var(--space-1);
        font-size: 1rem;
      }

      .chart-shell {
        margin-top: var(--space-4);
        width: min(300px, 100%);
        margin-inline: auto;
      }

      .chart-empty {
        margin-top: var(--space-4);
        min-height: 180px;
        border: 1px dashed var(--border-soft);
        border-radius: var(--radius-md);
        display: grid;
        place-items: center;
        gap: var(--space-2);
        color: var(--text-muted);
      }

      .chart-empty p {
        margin: 0;
      }

      canvas {
        width: 100%;
        height: auto;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductsStockChartComponent implements AfterViewInit, OnDestroy {
  readonly products = input.required<Product[]>();

  @ViewChild('chartCanvas')
  private chartCanvas?: ElementRef<HTMLCanvasElement>;

  private chart: Chart | null = null;

  constructor() {
    effect(() => {
      this.products();
      this.refreshChart();
    });
  }

  ngAfterViewInit(): void {
    this.refreshChart();
  }

  ngOnDestroy(): void {
    this.chart?.destroy();
  }

  private refreshChart(): void {
    const canvas = this.chartCanvas?.nativeElement;

    if (!canvas) {
      return;
    }
    const context = canvas.getContext('2d');

    if (!context) {
      return;
    }

    const activeCount = this.products().filter((product) => product.status === 'active').length;
    const inactiveCount = this.products().filter((product) => product.status === 'inactive').length;
    const lowStockCount = this.products().filter(
      (product) => product.minimumStock !== null && product.quantity <= product.minimumStock,
    ).length;

    const data = [activeCount, inactiveCount, lowStockCount];

    if (!this.chart) {
      this.chart = new Chart(context, {
        type: 'doughnut',
        data: {
          labels: ['Activos', 'Inactivos', 'Stock bajo'],
          datasets: [
            {
              data,
              backgroundColor: ['#2ca58d', '#f25f5c', '#f6bd60'],
              borderColor: ['#ffffff', '#ffffff', '#ffffff'],
              borderWidth: 2,
              hoverOffset: 8,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                usePointStyle: true,
                boxWidth: 10,
                color: '#5f6c87',
              },
            },
          },
        },
      });
      return;
    }

    this.chart.data.datasets[0].data = data;
    this.chart.update();
  }
}
