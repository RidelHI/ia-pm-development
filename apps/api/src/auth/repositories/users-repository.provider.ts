import type { PrismaService } from '../../integrations/prisma/prisma.service';
import type { UsersRepository } from './users.repository';

type RuntimeEnvironment = 'development' | 'test' | 'production';

export async function resolveUsersRepository(
  prismaService: PrismaService,
  prismaRepository: UsersRepository,
  inMemoryRepository: UsersRepository,
  nodeEnv: RuntimeEnvironment = (process.env.NODE_ENV ??
    'development') as RuntimeEnvironment,
): Promise<UsersRepository> {
  if (prismaService.isConfigured()) {
    try {
      await prismaService.user.findFirst({
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
