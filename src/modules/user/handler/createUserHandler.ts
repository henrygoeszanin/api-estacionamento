import { AppDataSource } from '../../../database/data-source';
import { User } from '../entity/User';

// Handler para criar um novo usuário
export const createUserHandler = async (data: { name: string; email: string; password: string }) => {
  const userRepo = AppDataSource.getRepository(User);
  const user = userRepo.create(data);
  return userRepo.save(user);
};