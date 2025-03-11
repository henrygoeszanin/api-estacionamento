import { Car } from '../../../domain/entities/Car';
import { NotFoundError } from '../../../domain/errors/DomainErros';
import { ICarRepository } from '../../../domain/repositories/ICarReporitory';
import { ICacheService } from '../../interfaces/ICacheService';
import { CacheKeys } from '../../constants/CacheKeys';

export class GetCarByIdUseCase {
  constructor(
    private carRepository: ICarRepository,
    private cacheService: ICacheService
  ) {}

  async execute(carId: string): Promise<Car> {
    // Verificar cache primeiro
    const cachedCar = await this.cacheService.get(CacheKeys.CAR(carId));
    if (cachedCar) {
      return JSON.parse(cachedCar);
    }

    // Buscar do banco de dados
    const car = await this.carRepository.findById(carId);
    
    if (!car) {
      throw new NotFoundError('Car not found');
    }

    // Armazenar no cache
    await this.cacheService.set(CacheKeys.CAR(carId), car);
    
    return car;
  }
}