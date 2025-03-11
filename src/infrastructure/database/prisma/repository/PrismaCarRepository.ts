import { PrismaClient } from '@prisma/client';
import { Car, CarDetails } from '../../../../domain/entities/Car';
import { ICarRepository } from '../../../../domain/repositories/ICarRepository';
import { ulid } from 'ulid';

export class PrismaCarRepository implements ICarRepository {
  constructor(private prisma: PrismaClient) {}

  async create(car: Omit<Car, 'id'>, details?: any): Promise<Car> {
    const newCar = await this.prisma.car.create({
      data: {
        id: ulid(),
        brand: car.brand,
        model: car.model,
        plate: car.plate,
        ownerId: car.ownerId,
        details: details ? {
          create: {
            id: ulid(),
            cor: details.cor,
            ano: details.ano,
            anoModelo: details.anoModelo,
            uf: details.uf,
            municipio: details.municipio,
            chassi: details.chassi,
            dataAtualizacaoCaracteristicas: details.dataAtualizacaoCaracteristicas,
            dataAtualizacaoRouboFurto: details.dataAtualizacaoRouboFurto,
            dataAtualizacaoAlarme: details.dataAtualizacaoAlarme,
          }
        } : undefined
      },
      include: { details: true }
    });

    return newCar;
  }

  async findById(id: string): Promise<Car | null> {
    return await this.prisma.car.findUnique({
      where: { id },
      include: { details: true }
    });
  }

  async findByOwner(ownerId: string): Promise<Car[]> {
    return await this.prisma.car.findMany({
      where: { ownerId },
      include: { details: true }
    });
  }

  async findAll(): Promise<Car[]> {
    return await this.prisma.car.findMany({
      include: { 
        details: true,
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      }
    });
  }

  async update(id: string, data: Partial<Car>): Promise<Car> {
    return await this.prisma.car.update({
      where: { id },
      data,
      include: { details: true }
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.car.delete({
      where: { id }
    });
  }

  async existsForOwner(ownerId: string, brand: string, model: string, plate: string): Promise<boolean> {
    const car = await this.prisma.car.findFirst({
      where: {
        ownerId,
        brand,
        model,
        plate
      }
    });
    
    return car !== null;
  }
}