import { ForbiddenError, NotFoundError } from '../../../domain/errors/DomainErros';
import { ICarRepository } from '../../../domain/repositories/ICarReporitory';
import { ICacheService } from '../../interfaces/ICacheService';

export class DeleteCarUseCase {
  constructor(
    private carRepository: ICarRepository,
    private cacheService: ICacheService
  ) {}

  async execute(carId: string, userId: string): Promise<{ message: string }> {
    // Verificar se o carro existe
    const car = await this.carRepository.findById(carId);
    
    if (!car) {
      throw new NotFoundError('Car not found');
    }

    // Verificar se o carro pertence ao usuário
    if (car.ownerId !== userId) {
      throw new ForbiddenError('You are not authorized to delete this car');
    }

    // Excluir o carro
    await this.carRepository.delete(carId);

    // Gerenciar cache
    await this.cacheService.delete(`car-${carId}`);
    await this.cacheService.delete(`myCars-${userId}`);
    await this.cacheService.delete('allCars');

    return { message: 'Car deleted successfully' };
  }
}