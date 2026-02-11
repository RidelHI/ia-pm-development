import { Injectable } from '@nestjs/common';

export interface AppInfo {
  message: string;
  docs: {
    healthLive: string;
    healthReady: string;
    authToken: string;
    products: string;
  };
}

@Injectable()
export class AppService {
  getInfo(): AppInfo {
    return {
      message: 'Warehouse API online',
      docs: {
        healthLive: '/v1/health/live',
        healthReady: '/v1/health/ready',
        authToken: '/v1/auth/token',
        products: '/v1/products',
      },
    };
  }
}
