import { PrismaClient } from '@prisma/client';
import { NotFoundError } from '../../../error/errors';
import { CACHE_KEYS } from '../../../../redis/redisCacheKeys';
import { deleteCache } from '../../../../redis/redisClient';

const prisma = new PrismaClient();

// Handler para deletar o usuário
export const deleteUserHandler = async (userId: string) => {
  // Verifica se o usuário existe
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new NotFoundError('User not found');
  }

  // Deleta o usuário
  await prisma.user.delete({
    where: { id: userId },
  });

  await deleteCache(CACHE_KEYS.USER(userId));
  await deleteCache(CACHE_KEYS.ALL_USERS);

  return { message: 'User deleted successfully' };
};