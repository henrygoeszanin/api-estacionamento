import { FastifyReply, FastifyRequest } from 'fastify';
import fp from 'fastify-plugin';
import fastifyJwt from 'fastify-jwt';

// Plugin de autenticação JWT para Fastify
export default fp(async (fastify) => {
  // Registra o plugin JWT com uma chave secreta
  fastify.register(fastifyJwt, { secret: process.env.JWT_SECRET || 'defaultsecret' });

  // Adiciona um método de autenticação ao Fastify
  fastify.decorate('authenticate', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      // Verifica o token JWT no request
      await request.jwtVerify();
    } catch (err) {
      // Retorna erro 401 se a verificação falhar
      reply.status(401).send({ error: 'Unauthorized' });
    }
  });
});

// Declaração do userId no FastifyRequest
declare module 'fastify' {
  interface FastifyRequest {
    userId?: string;
  }
}