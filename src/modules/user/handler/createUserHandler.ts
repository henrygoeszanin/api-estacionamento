import { PrismaClient } from '@prisma/client';
import { BadRequestError } from '../../../error/errors';
import { ulid } from 'ulid';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// Handler para criar um novo usuário
export const createUserHandler = async (data: { name: string; email: string; password: string }) => {
  // Verifica se existe um usuário com o mesmo e-mail
  const userExists = await prisma.user.findFirst({
    where: { email: data.email },
  });
  if (userExists) {
    throw new BadRequestError('User already exists');
  }

  // Criptografa a senha
  const hashedPassword = await bcrypt.hash(data.password, 10);

  const newUser = {
    ...data,
    id: ulid(),
    password: hashedPassword,
  };

  // Cria o novo usuário
  const user = await prisma.user.create({
    data: newUser,
    select: {
      id: true,
    },
  });

  return user;
};