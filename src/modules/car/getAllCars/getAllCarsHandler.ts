import { PrismaClient } from '@prisma/client';
import { NotFoundError } from '../../../error/errors';

const prisma = new PrismaClient();

// Handler para obter todos os carros
export const getAllCarsHandler = async () => {
  const cars = await prisma.car.findMany({
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
    throw new NotFoundError('No cars found');
  }

  return cars;
};