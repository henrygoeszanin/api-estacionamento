import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { loginHandler } from '../handler/loginHandler';
import { UnauthorizedError } from '../../../error/errors';

// Declaração do método de autenticação no Fastify
declare module 'fastify' {
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}

// Controlador para rota de login
export const loginController = (fastify: FastifyInstance) => {
  fastify.post('/login', async (request: FastifyRequest, reply: FastifyReply) => {
    fastify.log.info('User login attempt');
    try {
      return await loginHandler(request, reply);
    } catch (error) {
      fastify.log.error(error);
      if (error instanceof UnauthorizedError) {
        return reply.status(401).send({ error: error.message });
      }
      return reply.status(500).send({ error: 'Internal Server Error' });
    }
  });
};