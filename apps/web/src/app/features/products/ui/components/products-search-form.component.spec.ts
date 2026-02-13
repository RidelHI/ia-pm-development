import { TestBed } from '@angular/core/testing';
import { ProductsSearchFormComponent } from './products-search-form.component';

describe('ProductsSearchFormComponent', () => {
  it('emits query change on input event', () => {
    const fixture = TestBed.createComponent(ProductsSearchFormComponent);
    const component = fixture.componentInstance;
    const emittedValues: string[] = [];
    const inputElement = document.createElement('input');
    inputElement.value = 'SKU-01';

    component.queryChange.subscribe((value) => emittedValues.push(value));
    component.onQueryInput({
      target: inputElement,
    } as unknown as Event);

    expect(emittedValues).toEqual(['SKU-01']);
  });

  it('emits search event on submit', () => {
    const fixture = TestBed.createComponent(ProductsSearchFormComponent);
    const component = fixture.componentInstance;
    let emitted = false;

    component.searchRequested.subscribe(() => {
      emitted = true;
    });
    component.submitSearch();

    expect(emitted).toBe(true);
  });

  it('shows loading label and disables submit while loading', () => {
    const fixture = TestBed.createComponent(ProductsSearchFormComponent);

    fixture.componentRef.setInput('loading', true);
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector(
      'button[type="submit"]',
    ) as HTMLButtonElement;

    expect(button.disabled).toBe(true);
    expect(button.textContent).toContain('Cargando...');
    expect(button.getAttribute('aria-busy')).toBe('true');
  });
});
