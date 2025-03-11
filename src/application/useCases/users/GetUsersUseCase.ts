import { NotFoundError } from '../../../domain/errors/DomainErros';
import { IUserRepository } from '../../../domain/repositories/IUserRepository';
import { ICacheService } from '../../interfaces/ICacheService';
import { CacheKeys } from '../../constants/CacheKeys';
import { UserResponseDTO } from '../../dtos/UserDTO';

export class GetUsersUseCase {
  constructor(
    private userRepository: IUserRepository,
    private cacheService: ICacheService
  ) {}

  async execute(): Promise<UserResponseDTO[]> {
    // Verificar cache primeiro
    const cachedUsers = await this.cacheService.get(CacheKeys.ALL_USERS);
    if (cachedUsers) {
      return JSON.parse(cachedUsers);
    }

    // Buscar do banco de dados
    const users = await this.userRepository.findAll();
    
    if (!users || users.length === 0) {
      throw new NotFoundError('No users found');
    }

    // Mapear para a resposta DTO (sem senha)
    const userDTOs = users.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email
    }));

    // Armazenar no cache
    await this.cacheService.set(CacheKeys.ALL_USERS, JSON.stringify(userDTOs));
    
    return userDTOs;
  }
}