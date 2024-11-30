import { PrismaClient } from '@prisma/client';
import { FastifyReply, FastifyRequest } from 'fastify';
import bcrypt from 'bcrypt';
import { UnauthorizedError } from '../../../error/errors';

const prisma = new PrismaClient();

// Controlador para login de usuário
export const loginHandler = async (request: FastifyRequest, reply: FastifyReply) => {
  const { email, password } = request.body as { email: string; password: string };
  const user = await prisma.user.findUnique({
    where: { email },
  });

  // Verifica se o usuário existe e se a senha está correta
  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new UnauthorizedError('Invalid email or password');
  }

  // Gera um token JWT para o usuário
  const token = await reply.jwtSign({ id: user.id, email: user.email }, { expiresIn: '12h' });
  return reply.send({ token });
};