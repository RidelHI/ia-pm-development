import { InjectionToken } from '@angular/core';

const DEFAULT_API_BASE_URL = 'http://localhost:3000/v1';

interface RuntimeConfig {
  apiBaseUrl?: string;
}

const normalizeApiBaseUrl = (value: string): string => value.replace(/\/+$/, '');

const resolveApiBaseUrl = (): string => {
  const runtimeConfig = (
    globalThis as typeof globalThis & { __APP_CONFIG__?: RuntimeConfig }
  ).__APP_CONFIG__;
  const apiBaseUrl = runtimeConfig?.apiBaseUrl ?? DEFAULT_API_BASE_URL;

  return normalizeApiBaseUrl(apiBaseUrl);
};

export const API_BASE_URL = new InjectionToken<string>('API_BASE_URL', {
  providedIn: 'root',
  factory: () => resolveApiBaseUrl(),
});
