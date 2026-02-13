import { expect, test, type APIRequestContext, type Page } from '@playwright/test';

interface Credentials {
  username: string;
  password: string;
}

const apiBaseUrl = 'http://127.0.0.1:3000/v1';

function uniqueCredentials(): Credentials {
  const suffix = `${Date.now()}-${Math.floor(Math.random() * 100_000)}`;

  return {
    username: `e2e.user.${suffix}`,
    password: 'StrongPassword123!',
  };
}

async function registerUser(
  request: APIRequestContext,
  credentials: Credentials,
): Promise<void> {
  const response = await request.post(`${apiBaseUrl}/auth/register`, {
    data: credentials,
  });

  expect(response.ok()).toBeTruthy();
}

async function loginFromUi(page: Page, credentials: Credentials): Promise<void> {
  await page.goto('/login');
  await page.getByLabel('Usuario').fill(credentials.username);
  await page.getByLabel('Password').fill(credentials.password);
  await page.getByRole('button', { name: /^Entrar$/ }).click();
  await expect(
    page.getByRole('heading', {
      name: 'Productos',
      exact: true,
    }),
  ).toBeVisible();
}

test('allows a registered user to login and access products', async ({
  page,
  request,
}) => {
  const credentials = uniqueCredentials();
  await registerUser(request, credentials);
  await loginFromUi(page, credentials);
});

test('shows empty state when search has no matching products', async ({
  page,
  request,
}) => {
  const credentials = uniqueCredentials();
  const noMatchQuery = `no-match-${Date.now()}`;

  await registerUser(request, credentials);
  await loginFromUi(page, credentials);

  await page
    .getByRole('searchbox', { name: 'Buscar productos por nombre o SKU' })
    .fill(noMatchQuery);
  await page.getByRole('button', { name: /^Buscar$/ }).click();

  await expect(
    page.getByText('No hay productos para mostrar con los filtros actuales.'),
  ).toBeVisible();
});
