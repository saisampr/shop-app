import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CartItem } from './cart-item.entity';
import { AddToCartDto } from './cart.dto';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(CartItem)
    private readonly cartRepo: Repository<CartItem>,
  ) {}

  getCart(): Promise<CartItem[]> {
    return this.cartRepo.find();
  }

  async addItem(dto: AddToCartDto, name: string, price: number): Promise<CartItem[]> {
    const existing = await this.cartRepo.findOne({ where: { productId: dto.productId } });
    if (existing) {
      await this.cartRepo.update(existing.id, { quantity: existing.quantity + dto.quantity });
    } else {
      await this.cartRepo.save({ productId: dto.productId, name, price, quantity: dto.quantity });
    }
    return this.cartRepo.find();
  }

  async removeItem(productId: number): Promise<CartItem> {
    const item = await this.cartRepo.findOne({ where: { productId } });
    if (!item) throw new NotFoundException(`Item ${productId} not in cart`);
    await this.cartRepo.delete(item.id);
    return item;
  }

  async clearCart(): Promise<void> {
    await this.cartRepo.clear();
  }

  async getTotal(): Promise<number> {
    const items = await this.cartRepo.find();
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }
}
