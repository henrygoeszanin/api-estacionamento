import { AppDataSource } from '../../../database/data-source';
import { Car } from '../entity/Car';

// Handler para obter os carros de um usuário específico
export const getUserCarsHandler = async (userId: number) => {
  const carRepo = AppDataSource.getRepository(Car);
  const cars = await carRepo.find({ 
    where: { owner: { id: userId } }, 
    relations: ['owner'], 
    select: {
    owner: {
      id: true,
      name: true,
      email: true
        }
      } 
    });
  return cars;
};