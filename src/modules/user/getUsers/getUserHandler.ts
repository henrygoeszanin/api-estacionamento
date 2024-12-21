import { PrismaClient } from '@prisma/client';
import { NotFoundError } from '../../../error/errors';
import { setCache, getCache } from '../../../../redis/redisClient';
import { CACHE_KEYS } from '../../../../redis/redisCacheKeys';

const prisma = new PrismaClient();

// Handler para obter todos os usuários
export const getUserHandler = async () => {
  const cacheKey = CACHE_KEYS.ALL_USERS;
  const cachedUsers = await getCache(cacheKey);

  if (cachedUsers) {
    return JSON.parse(cachedUsers);
  }

  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
    },
  });

  if (!users) {
    throw new NotFoundError('Users not found');
  }

  await setCache(cacheKey, JSON.stringify(users));

  return users;
};