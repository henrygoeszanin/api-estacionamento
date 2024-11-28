import { AppDataSource } from '../../../database/data-source';
import { User } from '../entity/User';

// Handler para obter todos os usuários
export const getUserHandler = async () => {
  const userRepo = AppDataSource.getRepository(User);
  const users = await userRepo.find({
    select: ['id', 'name', 'email']
  });
  return users;
};