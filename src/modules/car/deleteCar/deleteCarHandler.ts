import { PrismaClient } from '@prisma/client';
import { NotFoundError, ForbiddenError } from '../../../error/errors';
import { deleteCache } from '../../../utils/redisClient';

const prisma = new PrismaClient();

// Handler para deletar um carro
export const deleteCarHandler = async (carId: string, userId: string) => {
  // Verifica se o carro existe e pertence ao usuário
  const car = await prisma.car.findUnique({
    where: { id: carId },
  });

  if (!car) {
    throw new NotFoundError('Car not found');
  }

  if (car.ownerId !== userId) {
    throw new ForbiddenError('You are not authorized to delete this car');
  }

  // Deleta o carro
  await prisma.car.delete({
    where: { id: carId },
  });

  // Exclui o cache relacionado
  await deleteCache(`car:${carId}`);
  await deleteCache(`userCars:${userId}`);
  await deleteCache('allCars');

  return { message: 'Car deleted successfully' };
};