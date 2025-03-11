import { NotFoundError } from '../../../domain/errors/DomainErrors';
import { IUserRepository } from '../../../domain/repositories/IUserRepository';
import { ICacheService } from '../../interfaces/ICacheService';
import { CacheKeys } from '../../constants/CacheKeys';

export class DeleteUserUseCase {
  constructor(
    private userRepository: IUserRepository,
    private cacheService: ICacheService
  ) {}

  async execute(userId: string): Promise<{ message: string }> {
    // Verificar se o usuário existe
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Excluir usuário
    await this.userRepository.delete(userId);

    // Gerenciar cache
    await this.cacheService.delete(CacheKeys.USER(userId));
    await this.cacheService.delete(CacheKeys.ALL_USERS);
    await this.cacheService.delete(CacheKeys.MY_CARS(userId));

    return { message: 'User deleted successfully' };
  }
}