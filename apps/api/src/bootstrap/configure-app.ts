import {
  Logger,
  ValidationPipe,
  VersioningType,
  type INestApplication,
  type LogLevel,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { json, urlencoded } from 'express';
import type { AppConfig } from '../config/app.config';

export function resolveLoggerLevels(nodeEnv: string | undefined): LogLevel[] {
  if (nodeEnv === 'production') {
    return ['error', 'warn', 'log'];
  }

  return ['error', 'warn', 'log', 'debug', 'verbose'];
}

export function configureApp(app: INestApplication): void {
  const configService = app.get(ConfigService);
  const appConfig = configService.getOrThrow<AppConfig>('app');

  app.use(json({ limit: '10mb' }));
  app.use(urlencoded({ extended: true, limit: '10mb' }));

  app.use(
    helmet({
      contentSecurityPolicy: appConfig.environment === 'production',
      crossOriginEmbedderPolicy: false,
    }),
  );

  app.enableCors({
    origin: appConfig.cors.origins,
    credentials: appConfig.cors.credentials,
    exposedHeaders: ['x-request-id'],
  });

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

  app.enableShutdownHooks();

  if (appConfig.docs.enabled) {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('Warehouse API')
      .setDescription('Warehouse product management API')
      .setVersion(appConfig.version)
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup(appConfig.docs.path, app, document, {
      swaggerOptions: {
        persistAuthorization: true,
      },
    });

    Logger.log(
      `Swagger docs available at /${appConfig.docs.path}`,
      'Bootstrap',
    );
  }
}
