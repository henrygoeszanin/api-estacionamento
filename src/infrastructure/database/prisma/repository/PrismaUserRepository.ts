import { PrismaClient } from '@prisma/client';
import { User } from '../../../../domain/entities/User';
import { IUserRepository } from '../../../../domain/repositories/IUserRepository';
import { ulid } from 'ulid';
import bcrypt from 'bcrypt';

export class PrismaUserRepository implements IUserRepository {
  constructor(private prisma: PrismaClient) {}
  
  async create(user: Omit<User, 'id'>): Promise<User> {
    const hashedPassword = await bcrypt.hash(user.password, 10);
    
    return this.prisma.user.create({
      data: {
        id: ulid(),
        name: user.name,
        email: user.email,
        password: hashedPassword
      }
    });
  }
  
  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id }
    });
  }
  
  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email }
    });
  }
  
  async findAll(): Promise<User[]> {
    return this.prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        password: false
      }
    });
  }
  
  async update(id: string, data: Partial<User>): Promise<User> {
    const updateData: any = { ...data };
    
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }
    
    return this.prisma.user.update({
      where: { id },
      data: updateData
    });
  }
  
  async delete(id: string): Promise<void> {
    await this.prisma.user.delete({
      where: { id }
    });
  }
}