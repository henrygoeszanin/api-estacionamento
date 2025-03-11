import { UnauthorizedError } from '../../../domain/errors/DomainErros';
import { IUserRepository } from '../../../domain/repositories/IUserRepository';
import { LoginDTO } from '../../dtos/UserDTO';
import bcrypt from 'bcrypt';

export class LoginUseCase {
  constructor(private userRepository: IUserRepository) {}
  
  async execute(data: LoginDTO): Promise<{ id: string; email: string }> {
    const user = await this.userRepository.findByEmail(data.email);
    
    if (!user || !(await bcrypt.compare(data.password, user.password))) {
      throw new UnauthorizedError('Invalid email or password');
    }
    
    return {
      id: user.id,
      email: user.email
    };
  }
}