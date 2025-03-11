import { BadRequestError } from '../../../domain/errors/DomainErrors';
import { IUserRepository } from '../../../domain/repositories/IUserRepository';
import { ICacheService } from '../../interfaces/ICacheService';
import { CreateUserDTO } from '../../dtos/UserDTO';
import { CacheKeys } from '../../constants/CacheKeys';
import bcrypt from 'bcrypt';

export class CreateUserUseCase {
  constructor(
    private userRepository: IUserRepository,
    private cacheService: ICacheService
  ) {}

  async execute(data: CreateUserDTO): Promise<{ id: string }> {
    // Verificar se já existe usuário com este email
    const existingUser = await this.userRepository.findByEmail(data.email);
    if (existingUser) {
      throw new BadRequestError('User already exists');
    }

    // Criptografar senha
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Criar usuário
    const user = await this.userRepository.create({
      name: data.name,
      email: data.email,
      password: hashedPassword
    });

    // Gerenciar cache
    await this.cacheService.delete(CacheKeys.ALL_USERS);

    return { id: user.id };
  }
}