import { Car } from '../../../domain/entities/Car';
import { IUserRepository } from '../../../domain/repositories/IUserRepository';
import { ICacheService } from '../../interfaces/ICacheService';
import { CreateCarDTO } from '../../dtos/CarDTO';
import { ICarRepository } from '../../../domain/repositories/ICarReporitory';
import { BadRequestError, NotFoundError } from '../../../domain/errors/DomainErrors';

export class CreateCarUseCase {
  constructor(
    private carRepository: ICarRepository,
    private userRepository: IUserRepository,
    private cacheService: ICacheService
  ) {}

  async execute(data: CreateCarDTO): Promise<Car> {
    // Verifica se o usuário existe
    const owner = await this.userRepository.findById(data.ownerId);
    if (!owner) {
      throw new NotFoundError('Owner not found');
    }

    // Verifica se o carro já existe para o mesmo proprietário
    const carExists = await this.carRepository.existsForOwner(
      data.ownerId, 
      data.brand, 
      data.model, 
      data.plate
    );
    
    if (carExists) {
      throw new BadRequestError('Car already exists for this owner');
    }

    // Cria o carro
    const car = await this.carRepository.create({
      brand: data.brand,
      model: data.model,
      ownerId: owner.id,
      plate: data.plate,
    }, {
      cor: data.cor,
      ano: data.ano,
      anoModelo: data.anoModelo,
      uf: data.uf,
      municipio: data.municipio,
      chassi: data.chassi,
      dataAtualizacaoCaracteristicas: data.dataAtualizacaoCaracteristicas,
      dataAtualizacaoRouboFurto: data.dataAtualizacaoRouboFurto,
      dataAtualizacaoAlarme: data.dataAtualizacaoAlarme,
    });

    // Gerenciamento de cache
    await this.cacheService.delete(`myCars-${data.ownerId}`);
    await this.cacheService.delete('allCars');
    await this.cacheService.set(`car-${car.id}`, car);

    return car;
  }
}