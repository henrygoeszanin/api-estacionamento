import { Car } from '../entities/Car';

export interface ICarRepository {
  create(car: Omit<Car, 'id'>, details?: any): Promise<Car>;
  findById(id: string): Promise<Car | null>;
  findByOwner(ownerId: string): Promise<Car[]>;
  findAll(): Promise<Car[]>;
  update(id: string, data: Partial<Car>): Promise<Car>;
  delete(id: string): Promise<void>;
  existsForOwner(ownerId: string, brand: string, model: string, plate: string): Promise<boolean>;
}