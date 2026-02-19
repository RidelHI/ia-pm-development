import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, type ConfigType } from '@nestjs/config';
import authConfig from '../config/auth.config';
import { IntegrationsModule } from '../integrations/integrations.module';
import { PrismaService } from '../integrations/prisma/prisma.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { InMemoryUsersRepository } from './repositories/in-memory-users.repository';
import { PrismaUsersRepository } from './repositories/prisma-users.repository';
import { resolveUsersRepository } from './repositories/users-repository.provider';
import { USERS_REPOSITORY } from './repositories/users.repository';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    ConfigModule,
    IntegrationsModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [authConfig.KEY],
      useFactory: (config: ConfigType<typeof authConfig>) => ({
        secret: config.jwtSecret,
        signOptions: {
          expiresIn: `${config.jwtExpiresInSeconds}s`,
          issuer: config.jwtIssuer,
          audience: config.jwtAudience,
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    JwtAuthGuard,
    RolesGuard,
    InMemoryUsersRepository,
    PrismaUsersRepository,
    {
      provide: USERS_REPOSITORY,
      inject: [PrismaService, PrismaUsersRepository, InMemoryUsersRepository],
      useFactory: async (
        prismaService: PrismaService,
        prismaRepository: PrismaUsersRepository,
        inMemoryRepository: InMemoryUsersRepository,
      ) =>
        await resolveUsersRepository(
          prismaService,
          prismaRepository,
          inMemoryRepository,
        ),
    },
  ],
  exports: [AuthService, JwtAuthGuard, RolesGuard, JwtModule],
})
export class AuthModule {}
