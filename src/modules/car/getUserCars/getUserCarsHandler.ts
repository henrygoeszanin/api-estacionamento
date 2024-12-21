import { PrismaClient } from '@prisma/client';
import { NotFoundError } from '../../../error/errors';
import { setCache, getCache } from '../../../../redis/redisClient';
import { CACHE_KEYS } from '../../../../redis/redisCacheKeys';

const prisma = new PrismaClient();

// Handler para obter os carros de um usuário específico
export const getUserCarsHandler = async (userId: string) => {
  const cacheKey = CACHE_KEYS.MY_CARS(userId);
  const cachedCars = await getCache(cacheKey);

  if (cachedCars) {
    return JSON.parse(cachedCars);
  }

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

  await setCache(cacheKey, JSON.stringify(cars));

  return cars;
};