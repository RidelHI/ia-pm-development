import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { trimString } from './transforms';

export class ProductIdParamDto {
  @ApiProperty({ example: 'prod-001' })
  @Transform(trimString)
  @IsString()
  @IsNotEmpty()
  id!: string;
}
