import { Injectable, ConflictException, UnauthorizedException, OnModuleInit } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { UserRole } from '../users/user.entity';

@Injectable()
export class AuthService implements OnModuleInit {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async onModuleInit() {
    const existing = await this.usersService.findByEmail('admin@shop.com');
    if (!existing) {
      const hashed = await bcrypt.hash('admin123', 10);
      await this.usersService.create('admin@shop.com', hashed, UserRole.ADMIN);
    }
  }

  async register(email: string, password: string) {
    const existing = await this.usersService.findByEmail(email);
    if (existing) throw new ConflictException('Email already in use');
    const hashed = await bcrypt.hash(password, 10);
    const user = await this.usersService.create(email, hashed);
    return this.issueToken(user.id, user.email, user.role);
  }

  async login(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.issueToken(user.id, user.email, user.role);
  }

  private issueToken(sub: number, email: string, role: string) {
    return { access_token: this.jwtService.sign({ sub, email, role }) };
  }
}
