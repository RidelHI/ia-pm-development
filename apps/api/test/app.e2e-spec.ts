import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { configureApp } from '../src/bootstrap/configure-app';
import { AppModule } from './../src/app.module';

interface AuthConfigLike {
  jwtSecret: string;
  jwtExpiresInSeconds: number;
  jwtIssuer: string;
  jwtAudience: string;
}

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;
  let userAccessToken: string;
  let adminAccessToken: string;
  const previousSupabaseEnv = {
    url: process.env.SUPABASE_URL,
    secretKey: process.env.SUPABASE_SECRET_KEY,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    anonKey: process.env.SUPABASE_ANON_KEY,
  };
  const unique = (): string =>
    `${Date.now()}-${Math.floor(Math.random() * 100000)}`;

  beforeAll(() => {
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_SECRET_KEY;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    delete process.env.SUPABASE_ANON_KEY;
  });

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    configureApp(app);
    await app.init();

    const username = `auth.user.${unique()}`;
    const password = 'StrongPassword123!';
    await request(app.getHttpServer())
      .post('/v1/auth/register')
      .send({ username, password })
      .expect(201);

    const tokenResponse = await request(app.getHttpServer())
      .post('/v1/auth/token')
      .send({ username, password })
      .expect(200);
    userAccessToken = (tokenResponse.body as { accessToken: string })
      .accessToken;

    const configService = app.get(ConfigService);
    const authConfig =
      configService.get<AuthConfigLike>('auth') ??
      ({
        jwtSecret: 'development-only-secret-change-in-production',
        jwtExpiresInSeconds: 900,
        jwtIssuer: 'warehouse-api',
        jwtAudience: 'warehouse-clients',
      } satisfies AuthConfigLike);
    const jwtService = new JwtService({
      secret: authConfig.jwtSecret,
      signOptions: {
        expiresIn: `${authConfig.jwtExpiresInSeconds}s`,
        issuer: authConfig.jwtIssuer,
        audience: authConfig.jwtAudience,
      },
    });
    adminAccessToken = jwtService.sign({
      sub: 'admin-e2e',
      username: 'admin.e2e',
      roles: ['admin'],
    });
  });

  afterEach(async () => {
    await app.close();
  });

  afterAll(() => {
    process.env.SUPABASE_URL = previousSupabaseEnv.url;
    process.env.SUPABASE_SECRET_KEY = previousSupabaseEnv.secretKey;
    process.env.SUPABASE_SERVICE_ROLE_KEY = previousSupabaseEnv.serviceRoleKey;
    process.env.SUPABASE_ANON_KEY = previousSupabaseEnv.anonKey;
  });

  it('/v1 (GET)', () => {
    return request(app.getHttpServer())
      .get('/v1')
      .expect(200)
      .expect({
        message: 'Warehouse API online',
        docs: {
          healthLive: '/v1/health/live',
          healthReady: '/v1/health/ready',
          authRegister: '/v1/auth/register',
          authToken: '/v1/auth/token',
          products: '/v1/products',
          openApi: '/docs',
        },
      });
  });

  it('/v1/health/live (GET) is public', () => {
    return request(app.getHttpServer()).get('/v1/health/live').expect(200);
  });

  it('/docs-json (GET) exposes OpenAPI document', async () => {
    const response = await request(app.getHttpServer())
      .get('/docs-json')
      .expect(200);
    const body = response.body as {
      openapi?: string;
      info?: {
        title?: string;
      };
    };

    expect(body.openapi).toBeDefined();
    expect(body.info?.title).toBe('Warehouse API');
  });

  it('/v1/health/ready (GET) requires auth', () => {
    return request(app.getHttpServer()).get('/v1/health/ready').expect(401);
  });

  it('/v1/auth/register (POST) creates user without exposing password hash', async () => {
    const username = `new.user.${unique()}`;
    const response = await request(app.getHttpServer())
      .post('/v1/auth/register')
      .send({
        username,
        password: 'StrongPassword123!',
      })
      .expect(201);
    const body = response.body as {
      id: string;
      username: string;
      role: string;
      createdAt: string;
      updatedAt: string;
      passwordHash?: string;
    };

    expect(body.id).toContain('usr_');
    expect(body.username).toBe(username);
    expect(body.role).toBe('user');
    expect(body.createdAt).toBeDefined();
    expect(body.updatedAt).toBeDefined();
    expect(body.passwordHash).toBeUndefined();
  });

  it('/v1/auth/register (POST) rejects duplicated username', async () => {
    const username = `dup.user.${unique()}`;

    await request(app.getHttpServer())
      .post('/v1/auth/register')
      .send({
        username,
        password: 'StrongPassword123!',
      })
      .expect(201);

    await request(app.getHttpServer())
      .post('/v1/auth/register')
      .send({
        username,
        password: 'StrongPassword123!',
      })
      .expect(409);
  });

  it('/v1/auth/token (POST) authenticates persisted user', async () => {
    const username = `login.user.${unique()}`;
    const password = 'StrongPassword123!';

    await request(app.getHttpServer())
      .post('/v1/auth/register')
      .send({ username, password })
      .expect(201);

    const tokenResponse = await request(app.getHttpServer())
      .post('/v1/auth/token')
      .send({ username, password })
      .expect(200);

    expect(
      (tokenResponse.body as { accessToken?: string }).accessToken,
    ).toBeDefined();
  });

  it('/v1/products (GET) requires auth', () => {
    return request(app.getHttpServer()).get('/v1/products').expect(401);
  });

  it('/v1/products (GET) applies pagination for authenticated user', async () => {
    const marker = `E2E-PAG-${unique()}`;
    await request(app.getHttpServer())
      .post('/v1/products')
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .send({
        sku: `${marker}-001`,
        name: `${marker} Product 1`,
        quantity: 1,
        unitPriceCents: 100,
      })
      .expect(201);
    await request(app.getHttpServer())
      .post('/v1/products')
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .send({
        sku: `${marker}-002`,
        name: `${marker} Product 2`,
        quantity: 2,
        unitPriceCents: 200,
      })
      .expect(201);

    const firstPage = await request(app.getHttpServer())
      .get(`/v1/products?q=${marker}&page=1&limit=1`)
      .set('Authorization', `Bearer ${userAccessToken}`)
      .expect(200);

    const secondPage = await request(app.getHttpServer())
      .get(`/v1/products?q=${marker}&page=2&limit=1`)
      .set('Authorization', `Bearer ${userAccessToken}`)
      .expect(200);

    const firstBody = firstPage.body as {
      data: Array<{ id: string }>;
      meta: { page: number; limit: number; total: number; totalPages: number };
    };
    const secondBody = secondPage.body as {
      data: Array<{ id: string }>;
      meta: { page: number; limit: number; total: number; totalPages: number };
    };

    expect(firstBody.data).toHaveLength(1);
    expect(secondBody.data).toHaveLength(1);
    expect(firstBody.meta.page).toBe(1);
    expect(secondBody.meta.page).toBe(2);
    expect(firstBody.data[0]?.id).not.toBe(secondBody.data[0]?.id);
  });

  it('/v1/products (GET) validates pagination params for user token', () => {
    return request(app.getHttpServer())
      .get('/v1/products?page=0&limit=101')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .expect(400);
  });

  it('/v1/products (POST) rejects non-whitelisted fields for admin', () => {
    return request(app.getHttpServer())
      .post('/v1/products')
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .send({
        sku: 'SKU-VALID-001',
        name: 'Valid Product',
        quantity: 10,
        unitPriceCents: 499,
        adminOnlyField: true,
      })
      .expect(400);
  });

  it('/v1/products (POST) denies user role for mutable endpoint', () => {
    return request(app.getHttpServer())
      .post('/v1/products')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send({
        sku: 'SKU-USER-FORBIDDEN-001',
        name: 'User Forbidden Product',
        quantity: 1,
        unitPriceCents: 100,
      })
      .expect(403);
  });
});
