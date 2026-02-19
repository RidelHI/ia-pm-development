import { PrismaService } from './prisma.service';

describe('PrismaService', () => {
  it('reports not configured when DATABASE_URL is missing', () => {
    const service = new PrismaService({
      url: null,
      schema: 'public',
    });

    expect(service.isConfigured()).toBe(false);
  });

  it('reports configured when DATABASE_URL exists', () => {
    const service = new PrismaService({
      url: 'postgresql://postgres:postgres@localhost:5432/postgres?schema=public',
      schema: 'public',
    });

    expect(service.isConfigured()).toBe(true);
  });
});
