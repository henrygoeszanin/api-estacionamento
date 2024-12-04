import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { authHandler } from './authHandler';
import { UnauthorizedError } from '../../error/errors';

// Declaração do método de autenticação no Fastify
declare module 'fastify' {
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}

// Controlador para rota de login
export const authController = (fastify: FastifyInstance) => {
  fastify.post('/login', async (request: FastifyRequest, reply: FastifyReply) => {
    fastify.log.info('User login attempt');
    try {
      return await authHandler(request, reply);
    } catch (error) {
      fastify.log.error(error);
      if (error instanceof UnauthorizedError) {
        return reply.status(401).send({ error: error.message });
      }
      return reply.status(500).send({ error: 'Internal Server Error' });
    }
  });
};