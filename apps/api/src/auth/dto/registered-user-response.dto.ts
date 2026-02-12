import { ApiProperty } from '@nestjs/swagger';
import type { AuthRole, AuthUser } from '../auth.types';

export class RegisteredUserResponseDto {
  @ApiProperty({ example: 'usr_01JX7C03MF6X6V6A3VC5DV5C0W' })
  id!: string;

  @ApiProperty({ example: 'warehouse.user' })
  username!: string;

  @ApiProperty({ enum: ['admin', 'user'], example: 'user' })
  role!: AuthRole;

  @ApiProperty({ example: '2026-02-10T10:00:00.000Z' })
  createdAt!: string;

  @ApiProperty({ example: '2026-02-10T10:00:00.000Z' })
  updatedAt!: string;

  static fromDomain(user: AuthUser): RegisteredUserResponseDto {
    return {
      id: user.id,
      username: user.username,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
