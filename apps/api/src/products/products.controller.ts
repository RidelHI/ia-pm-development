import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import type {
  CreateProductInput,
  ProductFilters,
  UpdateProductInput,
} from './product.types';
import { ProductsService } from './products.service';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  findAll(@Query('q') q?: string, @Query('status') status?: string) {
    const filters: ProductFilters = { q };

    if (status !== undefined) {
      if (status !== 'active' && status !== 'inactive') {
        throw new BadRequestException('status must be active or inactive');
      }

      filters.status = status;
    }

    return this.productsService.findAll(filters);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @Post()
  create(@Body() input: unknown) {
    return this.productsService.create(this.toCreateInput(input));
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() input: unknown) {
    return this.productsService.update(id, this.toUpdateInput(input));
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }

  private toCreateInput(input: unknown): CreateProductInput {
    if (!input || typeof input !== 'object') {
      throw new BadRequestException('body must be a JSON object');
    }

    return input as CreateProductInput;
  }

  private toUpdateInput(input: unknown): UpdateProductInput {
    if (!input || typeof input !== 'object') {
      throw new BadRequestException('body must be a JSON object');
    }

    return input as UpdateProductInput;
  }
}
