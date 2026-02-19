import type { PrismaService } from '../../integrations/prisma/prisma.service';
import type { ProductsRepository } from './products.repository';

type RuntimeEnvironment = 'development' | 'test' | 'production';

export async function resolveProductsRepository(
  prismaService: PrismaService,
  prismaRepository: ProductsRepository,
  inMemoryRepository: ProductsRepository,
  nodeEnv: RuntimeEnvironment = (process.env.NODE_ENV ??
    'development') as RuntimeEnvironment,
): Promise<ProductsRepository> {
  if (prismaService.isConfigured()) {
    try {
      await prismaService.product.findFirst({
        select: { id: true },
      });

      return prismaRepository;
    } catch (error) {
      if (nodeEnv === 'production') {
        throw error;
      }
    }
  }

  return inMemoryRepository;
}
