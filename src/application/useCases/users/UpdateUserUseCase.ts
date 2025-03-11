import { NotFoundError } from '../../../domain/errors/DomainErros';
import { IUserRepository } from '../../../domain/repositories/IUserRepository';
import { ICacheService } from '../../interfaces/ICacheService';
import { CacheKeys } from '../../constants/CacheKeys';
import bcrypt from 'bcrypt';
import { User } from '@prisma/client';

interface UpdateUserData {
  name?: string;
  email?: string;
  password?: string;
}

export class UpdateUserUseCase {
  constructor(
    private userRepository: IUserRepository,
    private cacheService: ICacheService
  ) {}

  async execute(userId: string, data: UpdateUserData): Promise<Partial<User>> {
    // Verificar se o usuário existe
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    const updateData: UpdateUserData = { ...data };

    // Criptografar senha se fornecida
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }

    // Atualizar usuário
    const updatedUser = await this.userRepository.update(userId, updateData);

    // Preparar resposta sem senha
    const userResponse = {
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email
    };

    // Gerenciar cache
    await this.cacheService.delete(CacheKeys.USER(userId));
    await this.cacheService.delete(CacheKeys.ALL_USERS);
    await this.cacheService.set(CacheKeys.USER(userId), JSON.stringify(userResponse));

    return userResponse;
  }
}