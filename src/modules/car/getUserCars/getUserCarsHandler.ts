import { PrismaClient } from '@prisma/client';
import { NotFoundError } from '../../../error/errors';

const prisma = new PrismaClient();

// Handler para obter os carros de um usuário específico
export const getUserCarsHandler = async (userId: string) => {
  const cars = await prisma.car.findMany({
    where: { ownerId: userId },
    include: {
      owner: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  if (!cars) {
    throw new NotFoundError('No cars found for this user');
  }

  return cars;
};