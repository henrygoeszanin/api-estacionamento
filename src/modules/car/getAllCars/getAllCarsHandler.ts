import { PrismaClient } from '@prisma/client';
import { NotFoundError } from '../../../error/errors';
import { setCache, getCache } from '../../../../redis/redisClient';
import { CACHE_KEYS } from '../../../../redis/redisCacheKeys';

const prisma = new PrismaClient();

// Handler para obter todos os carros
export const getAllCarsHandler = async () => {
  const cachedCars = await getCache(CACHE_KEYS.ALL_CARS);

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

  await setCache(CACHE_KEYS.ALL_CARS, JSON.stringify(cars));

  return cars;
};