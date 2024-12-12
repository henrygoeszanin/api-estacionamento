import { PrismaClient } from '@prisma/client';
import { NotFoundError } from '../../../error/errors';
import { setCache, getCache } from '../../../utils/redisClient';

const prisma = new PrismaClient();

// Handler para obter todos os carros
export const getAllCarsHandler = async () => {
  const cacheKey = 'allCars';
  const cachedCars = await getCache(cacheKey);

  if (cachedCars) {
    return JSON.parse(cachedCars);
  }

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

  await setCache(cacheKey, JSON.stringify(cars));

  return cars;
};