import { Controller, Get, Post, Delete, Param, Body, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { CartService } from './cart.service';
import { AddToCartDto } from './cart.dto';
import { ProductsService } from '../products/products.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('cart')
export class CartController {
  constructor(
    private readonly cartService: CartService,
    private readonly productsService: ProductsService,
  ) {}

  @Get()
  async getCart() {
    return {
      items: await this.cartService.getCart(),
      total: await this.cartService.getTotal(),
    };
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async addItem(@Body() dto: AddToCartDto) {
    const product = await this.productsService.findOne(dto.productId);
    await this.productsService.decreaseStock(dto.productId, dto.quantity);
    return this.cartService.addItem(dto, product.name, product.price);
  }

  @Delete()
  @UseGuards(JwtAuthGuard)
  async clearCart() {
    const items = await this.cartService.getCart();
    await this.cartService.clearCart();
    for (const item of items) {
      await this.productsService.increaseStock(item.productId, item.quantity);
    }
    return { message: 'Cart cleared' };
  }

  @Delete(':productId')
  @UseGuards(JwtAuthGuard)
  async removeItem(@Param('productId') productId: string) {
    const removed = await this.cartService.removeItem(+productId);
    await this.productsService.increaseStock(removed.productId, removed.quantity);
    return {
      items: await this.cartService.getCart(),
      total: await this.cartService.getTotal(),
    };
  }
}
