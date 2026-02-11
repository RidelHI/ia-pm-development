import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

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
    await app.init();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect({
        message: 'Warehouse API online',
        docs: {
          health: '/health',
          products: '/products',
        },
      });
  });

  it('/products (POST) rejects non-whitelisted fields', () => {
    return request(app.getHttpServer())
      .post('/products')
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
