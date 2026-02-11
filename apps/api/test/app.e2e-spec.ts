import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { configureApp } from '../src/bootstrap/configure-app';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;
  let accessToken: string;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    configureApp(app);
    await app.init();

    const tokenResponse = await request(app.getHttpServer())
      .post('/v1/auth/token')
      .send({
        username: 'admin',
        password: 'admin123!',
      })
      .expect(200);

    const body = tokenResponse.body as { accessToken: string };
    accessToken = body.accessToken;
  });

  afterEach(async () => {
    await app.close();
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

  it('/v1/products (GET) requires auth', () => {
    return request(app.getHttpServer()).get('/v1/products').expect(401);
  });

  it('/v1/products (GET) applies pagination', async () => {
    const marker = `E2E-PAG-${Date.now()}`;
    await request(app.getHttpServer())
      .post('/v1/products')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        sku: `${marker}-001`,
        name: `${marker} Product 1`,
        quantity: 1,
        unitPriceCents: 100,
      })
      .expect(201);
    await request(app.getHttpServer())
      .post('/v1/products')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        sku: `${marker}-002`,
        name: `${marker} Product 2`,
        quantity: 2,
        unitPriceCents: 200,
      })
      .expect(201);

    const firstPage = await request(app.getHttpServer())
      .get(`/v1/products?q=${marker}&page=1&limit=1`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    const secondPage = await request(app.getHttpServer())
      .get(`/v1/products?q=${marker}&page=2&limit=1`)
      .set('Authorization', `Bearer ${accessToken}`)
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

  it('/v1/products (GET) validates pagination params', () => {
    return request(app.getHttpServer())
      .get('/v1/products?page=0&limit=101')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(400);
  });

  it('/v1/products (POST) rejects non-whitelisted fields', () => {
    return request(app.getHttpServer())
      .post('/v1/products')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        sku: 'SKU-VALID-001',
        name: 'Valid Product',
        quantity: 10,
        unitPriceCents: 499,
        adminOnlyField: true,
      })
      .expect(400);
  });
});
