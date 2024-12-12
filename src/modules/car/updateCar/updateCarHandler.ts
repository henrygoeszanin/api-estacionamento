import { PrismaClient } from '@prisma/client';
import { NotFoundError, ForbiddenError } from '../../../error/errors';
import { deleteCache } from '../../../utils/redisClient';

const prisma = new PrismaClient();

// Handler para atualizar um carro
export const updateCarHandler = async (carId: string, userId: string, updateData: { brand?: string; model?: string; plate?: string }) => {
  // Verifica se o carro existe e pertence ao usuário
  const car = await prisma.car.findUnique({
    where: { id: carId },
  });

  if (!car) {
    throw new NotFoundError('Car not found');
  }

  if (car.ownerId !== userId) {
    throw new ForbiddenError('You are not authorized to update this car');
  }

  // Atualiza o carro
  const updatedCar = await prisma.car.update({
    where: { id: carId },
    data: updateData,
  });

  // Exclui o cache relacionado
  await deleteCache(`car:${carId}`);
  await deleteCache(`userCars:${userId}`);
  await deleteCache('allCars');

  return updatedCar;
};