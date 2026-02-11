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
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
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
@ApiTags('products')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @ApiOperation({ summary: 'List products' })
  async findAll(
    @Query() filters: ProductsQueryDto,
  ): Promise<ProductResponseDto[]> {
    const products = await this.productsService.findAll(filters);
    return ProductResponseDto.fromDomainList(products);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get product by id' })
  async findOne(
    @Param() params: ProductIdParamDto,
  ): Promise<ProductResponseDto> {
    const product = await this.productsService.findOne(params.id);
    return ProductResponseDto.fromDomain(product);
  }

  @Post()
  @ApiOperation({ summary: 'Create product' })
  async create(@Body() input: CreateProductDto): Promise<ProductResponseDto> {
    const product = await this.productsService.create(input);
    return ProductResponseDto.fromDomain(product);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update product' })
  async update(
    @Param() params: ProductIdParamDto,
    @Body() input: UpdateProductDto,
  ): Promise<ProductResponseDto> {
    const product = await this.productsService.update(params.id, input);
    return ProductResponseDto.fromDomain(product);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete product' })
  remove(@Param() params: ProductIdParamDto) {
    return this.productsService.remove(params.id);
  }
}
