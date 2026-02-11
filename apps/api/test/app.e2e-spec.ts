import { Test, TestingModule } from '@nestjs/testing';
import {
  INestApplication,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;
  let accessToken: string;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
      }),
    );
    app.enableVersioning({
      type: VersioningType.URI,
      defaultVersion: '1',
    });
    await app.init();

    const tokenResponse = await request(app.getHttpServer())
      .post('/v1/auth/token')
      .send({
        username: 'admin',
        password: 'admin123!',
      })
      .expect(201);

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
        },
      });
  });

  it('/v1/health/live (GET) is public', () => {
    return request(app.getHttpServer()).get('/v1/health/live').expect(200);
  });

  it('/v1/health/ready (GET) requires auth', () => {
    return request(app.getHttpServer()).get('/v1/health/ready').expect(401);
  });

  it('/v1/products (GET) requires auth', () => {
    return request(app.getHttpServer()).get('/v1/products').expect(401);
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
