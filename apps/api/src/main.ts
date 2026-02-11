import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { configureApp, resolveLoggerLevels } from './bootstrap/configure-app';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, {
    logger: resolveLoggerLevels(process.env.NODE_ENV),
  });

  configureApp(app);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('app.port', 3000);

  await app.listen(port);
  new Logger('Bootstrap').log(`Warehouse API listening on port ${port}`);
}

void bootstrap();
