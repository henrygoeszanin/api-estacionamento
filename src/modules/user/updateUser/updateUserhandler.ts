import { PrismaClient } from '@prisma/client';
import { NotFoundError } from '../../../error/errors';
import bcrypt from 'bcrypt';
import { deleteCache, setCache } from '../../../../redis/redisClient';
import { CACHE_KEYS } from '../../../../redis/redisCacheKeys';

const prisma = new PrismaClient();

// Handler para atualizar o usuário
export const updateUserHandler = async (
  userId: string,
  data: { name?: string; email?: string; password?: string }
) => {
  // Verifica se o usuário existe
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new NotFoundError('User not found');
  }

  // Prepara os dados para atualização
  const updatedData: any = { ...data };

  // Se estiver atualizando a senha, criptografa
  if (updatedData.password) {
    updatedData.password = await bcrypt.hash(updatedData.password, 10);
  }

  // Atualiza o usuário
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: updatedData,
    select: {
      id: true,
      name: true,
      email: true,
    },
  });

  await deleteCache(CACHE_KEYS.ALL_USERS);
  await setCache(CACHE_KEYS.USER(userId), JSON.stringify(updatedUser));

  return updatedUser;
};