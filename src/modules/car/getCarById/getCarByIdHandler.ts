import { PrismaClient } from '@prisma/client';
import { NotFoundError } from '../../../error/errors';
import { setCache, getCache } from '../../../../redis/redisClient';
import { CACHE_KEYS } from '../../../../redis/redisCacheKeys';

const prisma = new PrismaClient();

// Handler para obter um carro por ID
export const getCarByIdHandler = async (carId: string) => {
  const cacheKey = CACHE_KEYS.CAR(carId);
  const cachedCar = await getCache(cacheKey);

  if (cachedCar) {
    return JSON.parse(cachedCar);
  }

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

  await setCache(cacheKey, JSON.stringify(car));

  return car;
};