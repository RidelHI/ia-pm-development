import { TestBed } from '@angular/core/testing';
import { API_BASE_URL } from './api-base-url.token';

interface RuntimeConfigGlobal {
  __APP_CONFIG__?: {
    apiBaseUrl?: string;
  };
}

describe('API_BASE_URL token', () => {
  const runtimeConfigGlobal = globalThis as typeof globalThis & RuntimeConfigGlobal;

  afterEach(() => {
    delete runtimeConfigGlobal.__APP_CONFIG__;
    TestBed.resetTestingModule();
  });

  it('uses localhost fallback when runtime config is missing', () => {
    const baseUrl = TestBed.inject(API_BASE_URL);

    expect(baseUrl).toBe('http://localhost:3000/v1');
  });

  it('uses runtime apiBaseUrl and normalizes trailing slash', () => {
    runtimeConfigGlobal.__APP_CONFIG__ = {
      apiBaseUrl: 'https://warehouse-api.onrender.com/v1/',
    };

    const baseUrl = TestBed.inject(API_BASE_URL);

    expect(baseUrl).toBe('https://warehouse-api.onrender.com/v1');
  });
});
