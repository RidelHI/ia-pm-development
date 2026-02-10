import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

function loadLocalEnvFiles(): void {
  const loader = (
    process as unknown as {
      loadEnvFile?: (path?: string) => void;
    }
  ).loadEnvFile;

  if (!loader) {
    return;
  }

  const candidates = [
    resolve(process.cwd(), '.env'),
    resolve(process.cwd(), '.env.local'),
    resolve(process.cwd(), 'apps/api/.env'),
    resolve(process.cwd(), 'apps/api/.env.local'),
  ];

  for (const envPath of candidates) {
    if (existsSync(envPath)) {
      loader(envPath);
    }
  }
}

async function bootstrap() {
  loadLocalEnvFiles();
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
