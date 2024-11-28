import { AppDataSource } from '../../../database/data-source';
import { Car } from '../entity/Car';
import { User } from '../../user/entity/User';

// Handler para criar um novo carro
export const createCarHandler = async (data: { brand: string; model: string; ownerId: number }) => {
  const carRepo = AppDataSource.getRepository(Car);
  const userRepo = AppDataSource.getRepository(User);

  // Verifica se o usuário existe
  const owner = await userRepo.findOneBy({ id: data.ownerId });
  if (!owner) {
    throw new Error('Owner not found');
  }

  // Cria o carro e associa o proprietário
  const car = carRepo.create({ ...data, owner });
  return carRepo.save(car);
};