import { AppDataSource } from '../../../database/data-source';
import { Car } from '../entity/Car';

// Handler para obter todos os carros
export const getAllCarsHandler = async () => {
  const carRepo = AppDataSource.getRepository(Car);
  const cars = await carRepo.find({
    relations: ['owner'],
    select: {
      owner: {
        id: true,
        name: true,
        email: true
      }
    }
  });  return cars;
};