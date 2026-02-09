import type { Request, Response } from 'express';
import express from 'express';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from '../src/app.module';

const expressApp = express();
let isBootstrapped = false;

async function bootstrap() {
  if (!isBootstrapped) {
    const app = await NestFactory.create(
      AppModule,
      new ExpressAdapter(expressApp),
    );
    await app.init();
    isBootstrapped = true;
  }

  return expressApp;
}

export default async function handler(
  req: Request,
  res: Response,
): Promise<void> {
  const app = await bootstrap();
  app(req, res);
}
