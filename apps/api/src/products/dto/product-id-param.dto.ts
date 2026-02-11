import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';
import { trimString } from './transforms';

export class ProductIdParamDto {
  @Transform(trimString)
  @IsString()
  @IsNotEmpty()
  id!: string;
}
