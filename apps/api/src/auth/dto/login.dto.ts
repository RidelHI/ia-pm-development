import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'admin', minLength: 3, maxLength: 64 })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(64)
  username!: string;

  @ApiProperty({ example: 'admin123!', minLength: 8, maxLength: 128 })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(128)
  password!: string;
}
