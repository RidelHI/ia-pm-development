import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductIdParamDto } from './dto/product-id-param.dto';
import { ProductResponseDto } from './dto/product-response.dto';
import { ProductsQueryDto } from './dto/products-query.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductsService } from './products.service';

@Controller({
  path: 'products',
  version: '1',
})
@UseGuards(JwtAuthGuard)
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  async findAll(
    @Query() filters: ProductsQueryDto,
  ): Promise<ProductResponseDto[]> {
    const products = await this.productsService.findAll(filters);
    return ProductResponseDto.fromDomainList(products);
  }

  @Get(':id')
  async findOne(
    @Param() params: ProductIdParamDto,
  ): Promise<ProductResponseDto> {
    const product = await this.productsService.findOne(params.id);
    return ProductResponseDto.fromDomain(product);
  }

  @Post()
  async create(@Body() input: CreateProductDto): Promise<ProductResponseDto> {
    const product = await this.productsService.create(input);
    return ProductResponseDto.fromDomain(product);
  }

  @Patch(':id')
  async update(
    @Param() params: ProductIdParamDto,
    @Body() input: UpdateProductDto,
  ): Promise<ProductResponseDto> {
    const product = await this.productsService.update(params.id, input);
    return ProductResponseDto.fromDomain(product);
  }

  @Delete(':id')
  remove(@Param() params: ProductIdParamDto) {
    return this.productsService.remove(params.id);
  }
}
