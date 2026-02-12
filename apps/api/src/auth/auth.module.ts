import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, type ConfigType } from '@nestjs/config';
import authConfig from '../config/auth.config';
import { IntegrationsModule } from '../integrations/integrations.module';
import { SupabaseService } from '../integrations/supabase/supabase.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { InMemoryUsersRepository } from './repositories/in-memory-users.repository';
import { resolveUsersRepository } from './repositories/users-repository.provider';
import { SupabaseUsersRepository } from './repositories/supabase-users.repository';
import {
  USERS_REPOSITORY,
  type UsersRepository,
} from './repositories/users.repository';
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
    SupabaseUsersRepository,
    {
      provide: USERS_REPOSITORY,
      inject: [
        SupabaseService,
        SupabaseUsersRepository,
        InMemoryUsersRepository,
      ],
      useFactory: (
        supabaseService: SupabaseService,
        supabaseRepository: SupabaseUsersRepository,
        inMemoryRepository: InMemoryUsersRepository,
      ): UsersRepository =>
        resolveUsersRepository(
          supabaseService,
          supabaseRepository,
          inMemoryRepository,
        ),
    },
  ],
  exports: [AuthService, JwtAuthGuard, RolesGuard, JwtModule],
})
export class AuthModule {}
