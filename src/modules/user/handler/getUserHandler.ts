import { PrismaClient } from '@prisma/client';
import { NotFoundError } from '../../../error/errors';

const prisma = new PrismaClient();

// Handler para obter todos os usuários
export const getUserHandler = async () => {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
    },
  });

  if(!users) {
    throw new NotFoundError('Users not found');
  }
  return users;
};