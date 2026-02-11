import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import authConfig from '../../config/auth.config';
import {
  AUTH_ROLES,
  type AuthenticatedUser,
  type AuthTokenPayload,
} from '../auth.types';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @Inject(authConfig.KEY)
    private readonly config: ConfigType<typeof authConfig>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.jwtSecret,
      issuer: config.jwtIssuer,
      audience: config.jwtAudience,
    });
  }

  validate(payload: AuthTokenPayload): AuthenticatedUser {
    const hasInvalidRole = payload.roles.some(
      (role) => !AUTH_ROLES.includes(role),
    );

    if (hasInvalidRole) {
      throw new UnauthorizedException('Token contains invalid roles');
    }

    return payload as AuthenticatedUser;
  }
}
