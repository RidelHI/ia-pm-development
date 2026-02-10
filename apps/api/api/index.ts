import 'reflect-metadata';
import type { Request, Response } from 'express';
import express from 'express';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from '../src/app.module';

const expressApp = express();
let isBootstrapped = false;

async function bootstrap() {
  if (!isBootstrapped) {
    try {
      const app = await NestFactory.create(
        AppModule,
        new ExpressAdapter(expressApp),
      );
      await app.init();
      isBootstrapped = true;
    } catch (error) {
      // Vercel will show this in runtime logs (vercel logs).
      console.error('Nest bootstrap failed');
      console.error(error);
      throw error;
    }
  }

  return expressApp;
}

export default async function handler(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const app = await bootstrap();
    app(req, res);
  } catch {
    if (!res.headersSent) {
      res.status(500).type('text/plain').send('FUNCTION_INVOCATION_FAILED');
    }
  }
}
