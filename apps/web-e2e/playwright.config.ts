import { defineConfig, devices } from '@playwright/test';

const isCI = Boolean(process.env.CI);

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  forbidOnly: isCI,
  retries: isCI ? 1 : 0,
  workers: isCI ? 1 : undefined,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'http://127.0.0.1:4200',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: [
    {
      command: 'pnpm --filter api start',
      url: 'http://127.0.0.1:3000/v1/health/live',
      reuseExistingServer: false,
      timeout: 120_000,
      env: {
        ...process.env,
        PORT: '3000',
      },
    },
    {
      command: 'pnpm --filter web exec ng serve --host 127.0.0.1 --port 4200',
      url: 'http://127.0.0.1:4200/login',
      reuseExistingServer: false,
      timeout: 120_000,
    },
  ],
});
