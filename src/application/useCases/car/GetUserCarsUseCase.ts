import { Car } from '../../../domain/entities/Car';
import { NotFoundError } from '../../../domain/errors/DomainErrors';
import { ICarRepository } from '../../../domain/repositories/ICarReporitory';
import { ICacheService } from '../../interfaces/ICacheService';
import { CacheKeys } from '../../constants/CacheKeys';

export class GetUserCarsUseCase {
  constructor(
    private carRepository: ICarRepository,
    private cacheService: ICacheService
  ) {}

  async execute(userId: string): Promise<Car[]> {
    // Verificar cache primeiro
    const cachedCars = await this.cacheService.get(CacheKeys.MY_CARS(userId));
    if (cachedCars) {
      return JSON.parse(cachedCars);
    }

    // Buscar do banco de dados
    const cars = await this.carRepository.findByOwner(userId);
    
    if (!cars || cars.length === 0) {
      throw new NotFoundError('No cars found for this user');
    }

    // Armazenar no cache
    await this.cacheService.set(CacheKeys.MY_CARS(userId), cars);
    
    return cars;
  }
}