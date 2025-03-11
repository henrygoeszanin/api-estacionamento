import { Car } from '../../../domain/entities/Car';
import { NotFoundError, ForbiddenError } from '../../../domain/errors/DomainErros';
import { ICarRepository } from '../../../domain/repositories/ICarReporitory';
import { ICacheService } from '../../interfaces/ICacheService';
import { CacheKeys } from '../../constants/CacheKeys';

export class UpdateCarUseCase {
  constructor(
    private carRepository: ICarRepository,
    private cacheService: ICacheService
  ) {}

  async execute(carId: string, userId: string, updateData: { brand?: string; model?: string; plate?: string }): Promise<Car> {
    // Verificar se o carro existe
    const car = await this.carRepository.findById(carId);
    
    if (!car) {
      throw new NotFoundError('Car not found');
    }

    // Verificar se o carro pertence ao usuário
    if (car.ownerId !== userId) {
      throw new ForbiddenError('You are not authorized to update this car');
    }

    // Atualiza o carro
    const updatedCar = await this.carRepository.update(carId, updateData);

    // Gerenciar cache
    await this.cacheService.delete(CacheKeys.CAR(carId));
    await this.cacheService.delete(CacheKeys.MY_CARS(userId));
    await this.cacheService.delete(CacheKeys.ALL_CARS);
    await this.cacheService.set(CacheKeys.CAR(carId), updatedCar);

    return updatedCar;
  }
}