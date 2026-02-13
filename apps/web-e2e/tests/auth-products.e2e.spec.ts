import {
  expect,
  test,
  type APIRequestContext,
  type Locator,
  type Page,
} from '@playwright/test';

interface Credentials {
  username: string;
  password: string;
}

interface ProductFixture {
  sku: string;
  name: string;
  updatedName: string;
}

const apiBaseUrl = 'http://127.0.0.1:3000/v1';

function uniqueSuffix(): string {
  return `${Date.now()}-${Math.floor(Math.random() * 100_000)}`;
}

function uniqueCredentials(): Credentials {
  const suffix = uniqueSuffix();

  return {
    username: `e2e.user.${suffix}`,
    password: 'StrongPassword123!',
  };
}

function uniqueProductFixture(): ProductFixture {
  const suffix = uniqueSuffix();

  return {
    sku: `E2E-SKU-${suffix}`,
    name: `Producto E2E ${suffix}`,
    updatedName: `Producto E2E ${suffix} - Editado`,
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
  await expect(page).toHaveURL(/\/dashboard\/products$/);
  await expect(
    page.getByRole('heading', {
      name: 'Productos',
      exact: true,
    }),
  ).toBeVisible();
}

function productCard(page: Page, text: string): Locator {
  return page
    .locator('app-products-grid article')
    .filter({
      has: page.getByRole('button', { name: 'Ver detalle' }),
      hasText: text,
    })
    .first();
}

test('redirects guests from /dashboard/products to /login', async ({ page }) => {
  await page.goto('/dashboard/products');

  await expect(page).toHaveURL(/\/login$/);
  await expect(
    page.getByRole('heading', {
      name: 'Login para ver productos protegidos',
      exact: true,
    }),
  ).toBeVisible();
});

test('registers via UI, logs in, logs out, and blocks protected route afterwards', async ({
  page,
}) => {
  const credentials = uniqueCredentials();

  await page.goto('/register');
  await page.getByLabel('Usuario').fill(credentials.username);
  await page.getByLabel('Password').fill(credentials.password);
  await page.getByRole('button', { name: /^Registrar usuario$/ }).click();

  await expect(page).toHaveURL(/\/login\?registered=1/);
  await expect(
    page.getByRole('status').filter({
      hasText: 'Usuario registrado. Ahora inicia sesión.',
    }),
  ).toBeVisible();
  await expect(page.getByLabel('Usuario')).toHaveValue(credentials.username);

  await page.getByLabel('Password').fill(credentials.password);
  await page.getByRole('button', { name: /^Entrar$/ }).click();

  await expect(page).toHaveURL(/\/dashboard\/products$/);
  await expect(
    page.getByRole('heading', {
      name: 'Productos',
      exact: true,
    }),
  ).toBeVisible();

  await page.getByRole('button', { name: /^Cerrar sesión$/ }).click();
  await expect(page).toHaveURL(/\/login$/);
  await expect
    .poll(() => page.evaluate(() => localStorage.getItem('warehouse.auth.session')))
    .toBeNull();

  await page.goto('/dashboard/products');
  await expect(page).toHaveURL(/\/login$/);
});

test('shows invalid credentials feedback on login failure', async ({
  page,
  request,
}) => {
  const credentials = uniqueCredentials();
  await registerUser(request, credentials);

  await page.goto('/login');
  await page.getByLabel('Usuario').fill(credentials.username);
  await page.getByLabel('Password').fill('WrongPassword123!');
  await page.getByRole('button', { name: /^Entrar$/ }).click();

  await expect(page).toHaveURL(/\/login$/);
  await expect(
    page.getByRole('alert').filter({
      hasText: 'Credenciales inválidas. Revisa usuario y password.',
    }),
  ).toBeVisible();
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

test('supports create, search, detail, edit, and delete for products', async ({
  page,
  request,
}) => {
  const credentials = uniqueCredentials();
  const product = uniqueProductFixture();

  await registerUser(request, credentials);
  await loginFromUi(page, credentials);

  await page.getByRole('button', { name: /^Nuevo producto$/ }).click();
  await expect(
    page.getByRole('heading', { name: 'Crear producto', exact: true }),
  ).toBeVisible();

  await page.locator('[formcontrolname="sku"]').fill(product.sku);
  await page.locator('[formcontrolname="name"]').fill(product.name);
  await page.locator('[formcontrolname="quantity"]').fill('12');
  await page.locator('[formcontrolname="unitPriceCents"]').fill('1299');
  await page.locator('[formcontrolname="location"]').fill('E2E-A1');
  await page.getByRole('button', { name: /^Crear producto$/ }).click();

  await expect(
    page.getByRole('status').filter({
      hasText: `Producto ${product.sku} creado correctamente.`,
    }),
  ).toBeVisible();

  await page
    .getByRole('searchbox', { name: 'Buscar productos por nombre o SKU' })
    .fill(product.sku);
  await page.getByRole('button', { name: /^Buscar$/ }).click();

  const createdCard = productCard(page, product.sku);
  await expect(createdCard).toBeVisible();
  await expect(createdCard.getByRole('heading', { name: product.name })).toBeVisible();

  await createdCard.getByRole('button', { name: /^Ver detalle$/ }).click();
  await expect(
    page.getByRole('heading', { name: 'Detalle de producto', exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText(new RegExp(`SKU:\\s*${product.sku}`)),
  ).toBeVisible();

  await Promise.all([
    page.waitForResponse(
      (response) =>
        response.request().method() === 'GET' &&
        response.url().includes('/v1/products/') &&
        response.status() === 200,
    ),
    page.getByRole('button', { name: /^Editar producto$/ }).click(),
  ]);
  await expect(
    page.getByRole('heading', { name: 'Editar producto', exact: true }),
  ).toBeVisible();
  await page.locator('[formcontrolname="name"]').fill(product.updatedName);
  await page.locator('[formcontrolname="status"]').selectOption('inactive');
  await page.getByRole('button', { name: /^Guardar cambios$/ }).click();

  await expect(
    page.getByRole('status').filter({
      hasText: `Producto ${product.sku} actualizado correctamente.`,
    }),
  ).toBeVisible();

  const updatedCard = productCard(page, product.updatedName);
  await expect(updatedCard).toBeVisible();
  await expect(
    updatedCard.getByRole('heading', { name: product.updatedName }),
  ).toBeVisible();

  page.once('dialog', (dialog) => {
    void dialog.accept();
  });
  await updatedCard.getByRole('button', { name: /^Eliminar$/ }).click();

  await expect(
    page.getByRole('status').filter({
      hasText: 'Producto eliminado correctamente.',
    }),
  ).toBeVisible();
  await expect(
    page.getByText('No hay productos para mostrar con los filtros actuales.'),
  ).toBeVisible();
});
