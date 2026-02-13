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
});
