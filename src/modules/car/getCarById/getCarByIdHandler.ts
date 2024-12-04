import { PrismaClient } from '@prisma/client';
import { NotFoundError } from '../../../error/errors';

const prisma = new PrismaClient();

// Handler para obter um carro por ID
export const getCarByIdHandler = async (carId: string) => {
  const car = await prisma.car.findUnique({
    where: { id: carId },
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

  if (!car) {
    throw new NotFoundError('Car not found');
  }

  return car;
};