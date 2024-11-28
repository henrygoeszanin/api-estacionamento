import { AppDataSource } from '../../../database/data-source';
import { FastifyReply, FastifyRequest } from 'fastify';
import { User } from '../entity/User';

// Controlador para login de usuário
export const loginUserHandler = async (request: FastifyRequest, reply: FastifyReply) => {
  const { email, password } = request.body as { email: string; password: string };
  const userRepo = AppDataSource.getRepository(User);
  const user = await userRepo.findOneBy({ email });

  // Verifica se o usuário existe e se a senha está correta
  if (!user || !(await user.validatePassword(password))) {
    return reply.status(401).send({ error: 'Invalid email or password' });
  }

  // Gera um token JWT para o usuário
  const token = await reply.jwtSign({ id: user.id, email: user.email }, { expiresIn: '12h' });
  return reply.send({ token });
};