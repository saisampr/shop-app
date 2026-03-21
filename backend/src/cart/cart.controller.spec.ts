import { Test, TestingModule } from '@nestjs/testing';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';
import { ProductsService } from '../products/products.service';

const mockCartService = {
  getCart: jest.fn(),
  addItem: jest.fn(),
  removeItem: jest.fn(),
  clearCart: jest.fn(),
  getTotal: jest.fn(),
};

const mockProductsService = {
  findOne: jest.fn(),
  decreaseStock: jest.fn(),
  increaseStock: jest.fn(),
};

describe('CartController', () => {
  let controller: CartController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CartController],
      providers: [
        { provide: CartService, useValue: mockCartService },
        { provide: ProductsService, useValue: mockProductsService },
      ],
    }).compile();

    controller = module.get<CartController>(CartController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
