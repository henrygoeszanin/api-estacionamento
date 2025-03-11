import { Car } from '../../../domain/entities/Car';
import { NotFoundError } from '../../../domain/errors/DomainErrors';
import { ICarRepository } from '../../../domain/repositories/ICarReporitory';
import { ICacheService } from '../../interfaces/ICacheService';

export class GetAllCarsUseCase {
  constructor(
    private carRepository: ICarRepository,
    private cacheService: ICacheService
  ) {}

  async execute(): Promise<Car[]> {
    // Verificar cache primeiro
    const cachedCars = await this.cacheService.get('allCars');
    if (cachedCars) {
      return JSON.parse(cachedCars);
    }

    // Buscar do banco de dados
    const cars = await this.carRepository.findAll();
    
    if (!cars || cars.length === 0) {
      throw new NotFoundError('No cars found');
    }

    // Armazenar no cache
    await this.cacheService.set('allCars', JSON.stringify(cars));
    
    return cars;
  }
}