import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ILike } from 'typeorm';
import { ProductsService } from './products.service';
import { Product } from './product.entity';
import { CreateProductDto } from './product.dto';

// ─── Factories ───────────────────────────────────────────────────────────────

const makeProduct = (overrides: Partial<Product> = {}): Product =>
  Object.assign(new Product(), {
    id: 1,
    name: 'Wireless Headphones',
    description: 'Noise cancelling headphones',
    price: 99.99,
    stock: 10,
    image: 'https://picsum.photos/seed/test/300/200',
    category: 'Electronics',
    ...overrides,
  });

const makeDto = (overrides: Partial<CreateProductDto> = {}): CreateProductDto => ({
  name: 'Wireless Headphones',
  description: 'Noise cancelling headphones',
  price: 99.99,
  stock: 10,
  image: 'https://picsum.photos/seed/test/300/200',
  category: 'Electronics',
  ...overrides,
});

// ─── Mock repository type ────────────────────────────────────────────────────

type MockQb = {
  update: jest.Mock;
  set: jest.Mock;
  where: jest.Mock;
  execute: jest.Mock;
};

type MockRepo = {
  count: jest.Mock;
  save: jest.Mock;
  findAndCount: jest.Mock;
  findOne: jest.Mock;
  create: jest.Mock;
  delete: jest.Mock;
  update: jest.Mock;
  createQueryBuilder: jest.Mock;
  _qb: MockQb;
};

const createMockRepo = (): MockRepo => {
  const qb: MockQb = {
    update: jest.fn().mockReturnThis(),
    set: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    execute: jest.fn().mockResolvedValue({ affected: 1 }),
  };
  return {
    count: jest.fn(),
    save: jest.fn(),
    findAndCount: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
    update: jest.fn(),
    createQueryBuilder: jest.fn().mockReturnValue(qb),
    _qb: qb,
  };
};

// ─── Suite ───────────────────────────────────────────────────────────────────

describe('ProductsService', () => {
  let service: ProductsService;
  let repo: MockRepo;

  beforeEach(async () => {
    repo = createMockRepo();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        { provide: getRepositoryToken(Product), useValue: repo },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ─── onModuleInit ──────────────────────────────────────────────────────────

  describe('onModuleInit', () => {
    it('seeds 100 products when the table is empty', async () => {
      // Arrange
      repo.count.mockResolvedValue(0);
      repo.save.mockResolvedValue([]);

      // Act
      await service.onModuleInit();

      // Assert
      expect(repo.save).toHaveBeenCalledTimes(1);
      const [seedData] = repo.save.mock.calls[0];
      expect(seedData).toHaveLength(100);
    });

    it('seeds products with the correct shape', async () => {
      // Arrange
      repo.count.mockResolvedValue(0);
      repo.save.mockResolvedValue([]);

      // Act
      await service.onModuleInit();

      // Assert
      const [seedData] = repo.save.mock.calls[0];
      seedData.forEach((p: Partial<Product>) => {
        expect(p).toMatchObject({
          name: expect.any(String),
          description: expect.any(String),
          price: expect.any(Number),
          stock: expect.any(Number),
          image: expect.stringContaining('https://'),
          category: expect.any(String),
        });
      });
    });

    it('seeds products across all 10 categories', async () => {
      // Arrange
      repo.count.mockResolvedValue(0);
      repo.save.mockResolvedValue([]);

      // Act
      await service.onModuleInit();

      // Assert
      const [seedData] = repo.save.mock.calls[0];
      const categories = new Set(seedData.map((p: Partial<Product>) => p.category));
      expect(categories).toEqual(
        new Set([
          'Electronics', 'Audio', 'Gaming', 'Office', 'Mobile Accessories',
          'Networking', 'Photography', 'Smart Home', 'Wearables', 'Storage',
        ]),
      );
    });

    it('skips seeding when the table already has rows', async () => {
      // Arrange
      repo.count.mockResolvedValue(5);

      // Act
      await service.onModuleInit();

      // Assert
      expect(repo.save).not.toHaveBeenCalled();
    });
  });

  // ─── findAll ──────────────────────────────────────────────────────────────

  describe('findAll', () => {
    const products = [makeProduct({ id: 1 }), makeProduct({ id: 2 })];

    it('returns paginated response shape', async () => {
      // Arrange
      repo.findAndCount.mockResolvedValue([products, 2]);

      // Act
      const result = await service.findAll();

      // Assert
      expect(result).toEqual({
        data: products,
        total: 2,
        page: 1,
        limit: 10,
        totalPages: 1,
      });
    });

    it('uses default page=1 and limit=10 when not supplied', async () => {
      // Arrange
      repo.findAndCount.mockResolvedValue([[], 0]);

      // Act
      await service.findAll();

      // Assert
      expect(repo.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 0, take: 10 }),
      );
    });

    it('calculates skip correctly for page 2', async () => {
      // Arrange
      repo.findAndCount.mockResolvedValue([[], 0]);

      // Act
      await service.findAll(undefined, undefined, 2, 10);

      // Assert
      expect(repo.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 10, take: 10 }),
      );
    });

    it('calculates skip correctly for page 3 with limit 5', async () => {
      // Arrange
      repo.findAndCount.mockResolvedValue([[], 0]);

      // Act
      await service.findAll(undefined, undefined, 3, 5);

      // Assert
      expect(repo.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 10, take: 5 }),
      );
    });

    it('rounds up totalPages correctly', async () => {
      // Arrange — 21 items at 10 per page = 3 pages
      repo.findAndCount.mockResolvedValue([products, 21]);

      // Act
      const result = await service.findAll();

      // Assert
      expect(result.totalPages).toBe(3);
    });

    it('returns totalPages=1 when total equals limit exactly', async () => {
      // Arrange
      repo.findAndCount.mockResolvedValue([products, 10]);

      // Act
      const result = await service.findAll();

      // Assert
      expect(result.totalPages).toBe(1);
    });

    it('returns totalPages=0 when there are no results', async () => {
      // Arrange
      repo.findAndCount.mockResolvedValue([[], 0]);

      // Act
      const result = await service.findAll();

      // Assert
      expect(result.totalPages).toBe(0);
    });

    it('filters by category when provided', async () => {
      // Arrange
      repo.findAndCount.mockResolvedValue([products, 2]);

      // Act
      await service.findAll('Electronics');

      // Assert
      expect(repo.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({ where: { category: 'Electronics' } }),
      );
    });

    it('uses empty where clause when no category or search given', async () => {
      // Arrange
      repo.findAndCount.mockResolvedValue([[], 0]);

      // Act
      await service.findAll();

      // Assert
      expect(repo.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({ where: {} }),
      );
    });

    it('builds ILIKE OR clauses for name and description when search is given', async () => {
      // Arrange
      repo.findAndCount.mockResolvedValue([[], 0]);

      // Act
      await service.findAll(undefined, 'headphone');

      // Assert — where must be an array with two entries
      const { where } = repo.findAndCount.mock.calls[0][0];
      expect(Array.isArray(where)).toBe(true);
      expect(where).toHaveLength(2);
      expect(where[0]).toEqual({ name: ILike('%headphone%') });
      expect(where[1]).toEqual({ description: ILike('%headphone%') });
    });

    it('combines category AND search with ILIKE in both clauses', async () => {
      // Arrange
      repo.findAndCount.mockResolvedValue([[], 0]);

      // Act
      await service.findAll('Audio', 'speaker');

      // Assert — both clauses must include the category
      const { where } = repo.findAndCount.mock.calls[0][0];
      expect(Array.isArray(where)).toBe(true);
      expect(where[0]).toEqual({ name: ILike('%speaker%'), category: 'Audio' });
      expect(where[1]).toEqual({ description: ILike('%speaker%'), category: 'Audio' });
    });

    it('orders results by id ASC', async () => {
      // Arrange
      repo.findAndCount.mockResolvedValue([[], 0]);

      // Act
      await service.findAll();

      // Assert
      expect(repo.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({ order: { id: 'ASC' } }),
      );
    });
  });

  // ─── findOne ──────────────────────────────────────────────────────────────

  describe('findOne', () => {
    it('returns the product when found', async () => {
      // Arrange
      const product = makeProduct({ id: 42 });
      repo.findOne.mockResolvedValue(product);

      // Act
      const result = await service.findOne(42);

      // Assert
      expect(result).toEqual(product);
    });

    it('queries by the correct id', async () => {
      // Arrange
      repo.findOne.mockResolvedValue(makeProduct());

      // Act
      await service.findOne(7);

      // Assert
      expect(repo.findOne).toHaveBeenCalledWith({ where: { id: 7 } });
    });

    it('throws NotFoundException when product does not exist', async () => {
      // Arrange
      repo.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });

    it('error message includes the missing id', async () => {
      // Arrange
      repo.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.findOne(999)).rejects.toThrow('Product 999 not found');
    });

    it('throws NotFoundException for id 0', async () => {
      // Arrange
      repo.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.findOne(0)).rejects.toThrow(NotFoundException);
    });
  });

  // ─── create ───────────────────────────────────────────────────────────────

  describe('create', () => {
    it('returns the saved product', async () => {
      // Arrange
      const dto = makeDto();
      const saved = makeProduct({ id: 101 });
      repo.create.mockReturnValue(saved);
      repo.save.mockResolvedValue(saved);

      // Act
      const result = await service.create(dto);

      // Assert
      expect(result).toEqual(saved);
    });

    it('calls repo.create with the dto', async () => {
      // Arrange
      const dto = makeDto();
      const entity = makeProduct();
      repo.create.mockReturnValue(entity);
      repo.save.mockResolvedValue(entity);

      // Act
      await service.create(dto);

      // Assert
      expect(repo.create).toHaveBeenCalledWith(dto);
    });

    it('calls repo.save with the entity returned by repo.create', async () => {
      // Arrange
      const dto = makeDto();
      const entity = makeProduct();
      repo.create.mockReturnValue(entity);
      repo.save.mockResolvedValue(entity);

      // Act
      await service.create(dto);

      // Assert
      expect(repo.save).toHaveBeenCalledWith(entity);
    });

    it('persists all dto fields', async () => {
      // Arrange
      const dto = makeDto({ name: 'Custom', price: 199.99, stock: 5 });
      const saved = makeProduct({ name: 'Custom', price: 199.99, stock: 5 });
      repo.create.mockReturnValue(saved);
      repo.save.mockResolvedValue(saved);

      // Act
      const result = await service.create(dto);

      // Assert
      expect(result.name).toBe('Custom');
      expect(result.price).toBe(199.99);
      expect(result.stock).toBe(5);
    });
  });

  // ─── remove ───────────────────────────────────────────────────────────────

  describe('remove', () => {
    it('resolves without error when product exists', async () => {
      // Arrange
      repo.delete.mockResolvedValue({ affected: 1 });

      // Act & Assert
      await expect(service.remove(1)).resolves.toBeUndefined();
    });

    it('calls repo.delete with the correct id', async () => {
      // Arrange
      repo.delete.mockResolvedValue({ affected: 1 });

      // Act
      await service.remove(42);

      // Assert
      expect(repo.delete).toHaveBeenCalledWith(42);
    });

    it('throws NotFoundException when no row was deleted', async () => {
      // Arrange
      repo.delete.mockResolvedValue({ affected: 0 });

      // Act & Assert
      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });

    it('error message includes the missing id', async () => {
      // Arrange
      repo.delete.mockResolvedValue({ affected: 0 });

      // Act & Assert
      await expect(service.remove(999)).rejects.toThrow('Product 999 not found');
    });

    it('resolves (does not throw) when affected is undefined — guard only checks === 0', async () => {
      // Arrange — some DB drivers return undefined for affected; the current
      // guard `affected === 0` evaluates to false for undefined, so no error
      // is thrown. If strict guarding is needed, change to `!affected` in the service.
      repo.delete.mockResolvedValue({ affected: undefined });

      // Act & Assert
      await expect(service.remove(1)).resolves.toBeUndefined();
    });
  });

  // ─── decreaseStock ────────────────────────────────────────────────────────

  describe('decreaseStock', () => {
    it('resolves without error when stock is sufficient', async () => {
      // Arrange — execute returns affected: 1 (default from createMockRepo)

      // Act & Assert
      await expect(service.decreaseStock(1, 3)).resolves.toBeUndefined();
    });

    it('issues an atomic UPDATE via createQueryBuilder', async () => {
      // Act
      await service.decreaseStock(1, 3);

      // Assert — query builder chain was invoked
      expect(repo.createQueryBuilder).toHaveBeenCalled();
      expect(repo._qb.execute).toHaveBeenCalled();
    });

    it('throws BadRequestException when quantity exceeds stock (affected: 0)', async () => {
      // Arrange — DB returns affected: 0 (WHERE stock >= quantity not satisfied)
      repo._qb.execute.mockResolvedValue({ affected: 0 });
      repo.findOne.mockResolvedValue(makeProduct({ id: 1, stock: 3 }));

      // Act & Assert
      await expect(service.decreaseStock(1, 4)).rejects.toThrow(BadRequestException);
    });

    it('error message includes available stock count and product name', async () => {
      // Arrange
      repo._qb.execute.mockResolvedValue({ affected: 0 });
      repo.findOne.mockResolvedValue(
        makeProduct({ id: 1, stock: 2, name: 'Wireless Headphones' }),
      );

      // Act & Assert
      await expect(service.decreaseStock(1, 5)).rejects.toThrow(
        'Only 2 unit(s) available for "Wireless Headphones"',
      );
    });

    it('throws BadRequestException when stock is zero (affected: 0)', async () => {
      // Arrange
      repo._qb.execute.mockResolvedValue({ affected: 0 });
      repo.findOne.mockResolvedValue(makeProduct({ id: 1, stock: 0 }));

      // Act & Assert
      await expect(service.decreaseStock(1, 1)).rejects.toThrow(BadRequestException);
    });

    it('propagates NotFoundException when product does not exist', async () => {
      // Arrange — affected: 0 causes fallback findOne, which returns null → NotFoundException
      repo._qb.execute.mockResolvedValue({ affected: 0 });
      repo.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.decreaseStock(999, 1)).rejects.toThrow(NotFoundException);
    });

    it('does not call findOne on the happy path', async () => {
      // Arrange — execute returns affected: 1, so the error branch is skipped

      // Act
      await service.decreaseStock(1, 3);

      // Assert
      expect(repo.findOne).not.toHaveBeenCalled();
    });
  });

  // ─── increaseStock ────────────────────────────────────────────────────────

  describe('increaseStock', () => {
    it('resolves without error on success', async () => {
      // Arrange
      repo.findOne.mockResolvedValue(makeProduct({ id: 1, stock: 5 }));

      // Act & Assert
      await expect(service.increaseStock(1, 2)).resolves.toBeUndefined();
    });

    it('issues an atomic UPDATE via createQueryBuilder', async () => {
      // Arrange
      repo.findOne.mockResolvedValue(makeProduct({ id: 1, stock: 5 }));

      // Act
      await service.increaseStock(1, 3);

      // Assert
      expect(repo.createQueryBuilder).toHaveBeenCalled();
      expect(repo._qb.execute).toHaveBeenCalled();
    });

    it('can increase stock from zero', async () => {
      // Arrange
      repo.findOne.mockResolvedValue(makeProduct({ id: 1, stock: 0 }));

      // Act & Assert — should not throw
      await expect(service.increaseStock(1, 10)).resolves.toBeUndefined();
    });

    it('propagates NotFoundException when product does not exist', async () => {
      // Arrange — findOne (via this.findOne) returns null → NotFoundException
      repo.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.increaseStock(999, 1)).rejects.toThrow(NotFoundException);
    });

    it('does not call createQueryBuilder when the product lookup fails', async () => {
      // Arrange
      repo.findOne.mockResolvedValue(null);

      // Act
      await service.increaseStock(999, 1).catch(() => {});

      // Assert
      expect(repo.createQueryBuilder).not.toHaveBeenCalled();
    });
  });
});
