import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { createUserHandler } from '../handler/createUserHandler';
import { getUserHandler } from '../handler/getUserHandler';

// Declaração do método de autenticação no Fastify
declare module 'fastify' {
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}

// Controlador para rotas de usuário
export const userController = (fastify: FastifyInstance) => {
  // Rota para criar um novo usuário
  fastify.post('/users', async (request: FastifyRequest, reply: FastifyReply) => {
    fastify.log.info('Creating a new user');
    const user = await createUserHandler(request.body as { name: string; email: string; password: string });
    return reply.send(user);
  });

  // Rota para obter todos os usuários, protegida por autenticação
  fastify.get('/users', { preValidation: [fastify.authenticate] }, async (request, reply) => {
    fastify.log.info('Fetching all users');
    const users = await getUserHandler();
    return reply.send(users);
  });
};