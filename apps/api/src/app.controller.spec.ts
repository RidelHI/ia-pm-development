import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return api info payload', () => {
      expect(appController.getInfo()).toEqual({
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
  });
});
