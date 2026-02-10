import { Injectable } from '@nestjs/common';

export interface AppInfo {
  message: string;
  docs: {
    health: string;
    products: string;
  };
}

@Injectable()
export class AppService {
  getInfo(): AppInfo {
    return {
      message: 'Warehouse API online',
      docs: {
        health: '/health',
        products: '/products',
      },
    };
  }
}
