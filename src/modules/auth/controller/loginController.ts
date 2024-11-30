import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { loginHandler } from '../handler/loginHandler';

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
    return loginHandler(request, reply);
  });
};