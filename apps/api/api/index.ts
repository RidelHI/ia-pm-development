import 'reflect-metadata';
import type { Request, Response } from 'express';
import express from 'express';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from '../src/app.module';
import {
  configureApp,
  resolveLoggerLevels,
} from '../src/bootstrap/configure-app';

const expressApp = express();
let isBootstrapped = false;

async function bootstrap() {
  if (!isBootstrapped) {
    try {
      console.log('bootstrap: creating Nest application');
      const app = await NestFactory.create(
        AppModule,
        new ExpressAdapter(expressApp),
        {
          logger: resolveLoggerLevels(process.env.NODE_ENV),
        },
      );
      configureApp(app);
      console.log('bootstrap: initializing Nest application');

      const timeoutMs = Number(process.env.BOOTSTRAP_TIMEOUT_MS ?? 25000);
      await Promise.race([
        app.init(),
        new Promise((_, reject) =>
          setTimeout(
            () => reject(new Error(`Bootstrap timeout after ${timeoutMs}ms`)),
            timeoutMs,
          ),
        ),
      ]);

      console.log('bootstrap: Nest application initialized');
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
