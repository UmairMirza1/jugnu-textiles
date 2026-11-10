import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto, UpdateProductDto } from './product.dto';
import { AdminGuard } from '../common/admin.guard';

@Controller('products')
export class ProductsController {
  constructor(private readonly products: ProductsService) {}

  @Get()
  list(@Query('category') category?: string) {
    return this.products.findPublic(category);
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.products.findOne(id);
  }
}

@Controller('admin/products')
@UseGuards(AdminGuard)
export class AdminProductsController {
  constructor(private readonly products: ProductsService) {}

  @Get() list() { return this.products.findAll(); }
  @Post() create(@Body() dto: CreateProductDto) { return this.products.create(dto); }
  @Patch(':id') update(@Param('id') id: string, @Body() dto: UpdateProductDto) { return this.products.update(id, dto); }
  @Delete(':id') remove(@Param('id') id: string) { return this.products.remove(id); }
}
