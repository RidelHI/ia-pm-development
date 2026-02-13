import { TestBed } from '@angular/core/testing';
import { ProductsFeedbackComponent } from './products-feedback.component';

describe('ProductsFeedbackComponent', () => {
  it('renders error feedback when error is present', () => {
    const fixture = TestBed.createComponent(ProductsFeedbackComponent);

    fixture.componentRef.setInput('errorMessage', 'Error de carga');
    fixture.componentRef.setInput('isEmpty', false);
    fixture.detectChanges();

    const html = fixture.nativeElement as HTMLElement;
    expect(html.textContent).toContain('Error de carga');
  });

  it('renders empty feedback when list is empty and no error exists', () => {
    const fixture = TestBed.createComponent(ProductsFeedbackComponent);

    fixture.componentRef.setInput('errorMessage', null);
    fixture.componentRef.setInput('isEmpty', true);
    fixture.detectChanges();

    const html = fixture.nativeElement as HTMLElement;
    expect(html.textContent).toContain('No hay productos');
  });
});
