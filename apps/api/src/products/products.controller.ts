import {
  Body,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CreateProductDto } from './dto/create-product.dto';
import { PaginatedProductsResponseDto } from './dto/paginated-products-response.dto';
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
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @Roles('admin', 'user')
  @ApiOperation({ summary: 'List products' })
  @ApiOkResponse({ type: PaginatedProductsResponseDto })
  @ApiUnauthorizedResponse({ description: 'Invalid or expired token' })
  @ApiForbiddenResponse({ description: 'Missing required role' })
  async findAll(
    @Query() filters: ProductsQueryDto,
  ): Promise<PaginatedProductsResponseDto> {
    const products = await this.productsService.findAll(filters);
    return PaginatedProductsResponseDto.fromDomain(products);
  }

  @Get(':id')
  @Roles('admin', 'user')
  @ApiOperation({ summary: 'Get product by id' })
  @ApiOkResponse({ type: ProductResponseDto })
  @ApiUnauthorizedResponse({ description: 'Invalid or expired token' })
  @ApiForbiddenResponse({ description: 'Missing required role' })
  @ApiNotFoundResponse({ description: 'Product not found' })
  async findOne(
    @Param() params: ProductIdParamDto,
  ): Promise<ProductResponseDto> {
    const product = await this.productsService.findOne(params.id);
    return ProductResponseDto.fromDomain(product);
  }

  @Post()
  @Roles('admin')
  @ApiOperation({ summary: 'Create product' })
  @ApiCreatedResponse({ type: ProductResponseDto })
  @ApiBadRequestResponse({ description: 'Invalid request body' })
  @ApiUnauthorizedResponse({ description: 'Invalid or expired token' })
  @ApiForbiddenResponse({ description: 'Missing required role' })
  async create(@Body() input: CreateProductDto): Promise<ProductResponseDto> {
    const product = await this.productsService.create(input);
    return ProductResponseDto.fromDomain(product);
  }

  @Patch(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Update product' })
  @ApiOkResponse({ type: ProductResponseDto })
  @ApiBadRequestResponse({ description: 'Invalid request body' })
  @ApiUnauthorizedResponse({ description: 'Invalid or expired token' })
  @ApiForbiddenResponse({ description: 'Missing required role' })
  @ApiNotFoundResponse({ description: 'Product not found' })
  async update(
    @Param() params: ProductIdParamDto,
    @Body() input: UpdateProductDto,
  ): Promise<ProductResponseDto> {
    const product = await this.productsService.update(params.id, input);
    return ProductResponseDto.fromDomain(product);
  }

  @Delete(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Delete product' })
  @ApiNoContentResponse({ description: 'Product deleted' })
  @ApiUnauthorizedResponse({ description: 'Invalid or expired token' })
  @ApiForbiddenResponse({ description: 'Missing required role' })
  @ApiNotFoundResponse({ description: 'Product not found' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param() params: ProductIdParamDto): Promise<void> {
    await this.productsService.remove(params.id);
  }
}
