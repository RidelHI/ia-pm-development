import { Body, Controller, Post } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import {
  ApiOperation,
  ApiTags,
  ApiTooManyRequestsResponse,
} from '@nestjs/swagger';
import { AuthService, type AccessTokenResponse } from './auth.service';
import { LoginDto } from './dto/login.dto';

@Controller({
  path: 'auth',
  version: '1',
})
@ApiTags('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('token')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @ApiOperation({ summary: 'Issue access token' })
  @ApiTooManyRequestsResponse({ description: 'Rate limit exceeded' })
  createToken(@Body() input: LoginDto): AccessTokenResponse {
    return this.authService.issueAccessToken(input.username, input.password);
  }
}
