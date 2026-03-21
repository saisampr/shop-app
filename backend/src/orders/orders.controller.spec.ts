import { Test, TestingModule } from '@nestjs/testing';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { CartService } from '../cart/cart.service';

const mockOrdersService = {
  findAll: jest.fn(),
  findOne: jest.fn(),
  createOrder: jest.fn(),
};

const mockCartService = {
  getCart: jest.fn(),
  getTotal: jest.fn(),
  clearCart: jest.fn(),
};

describe('OrdersController', () => {
  let controller: OrdersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrdersController],
      providers: [
        { provide: OrdersService, useValue: mockOrdersService },
        { provide: CartService, useValue: mockCartService },
      ],
    }).compile();

    controller = module.get<OrdersController>(OrdersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
