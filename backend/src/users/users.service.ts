import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  findByEmail(email: string): Promise<User | null> {
    return this.userRepo.findOne({ where: { email } });
  }

  create(email: string, hashedPassword: string, role = UserRole.USER): Promise<User> {
    return this.userRepo.save(
      this.userRepo.create({ email, password: hashedPassword, role }),
    );
  }
}
