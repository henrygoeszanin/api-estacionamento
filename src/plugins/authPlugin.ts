import { FastifyReply, FastifyRequest } from 'fastify';
import fp from 'fastify-plugin';
import fastifyJwt from 'fastify-jwt';

export default fp(async (fastify) => {
  // Registra o plugin JWT com a opção de cookie
  fastify.register(fastifyJwt, {
    secret: process.env.JWT_SECRET || 'defaultsecret',
  });

  // Adiciona um método de autenticação ao Fastify
  fastify.decorate('authenticate', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      // Extrai o token JWT do cookie manualmente
      const token = request.cookies.token;
      if (!token) {
        throw new Error('No token provided');
      }

      // Verifica o token JWT manualmente
      const decoded = fastify.jwt.verify(token) as { id: string; email: string };
      request.user = { id: decoded.id, email: decoded.email };
    } catch (err) {
      // Retorna erro 401 se a verificação falhar
      reply.status(401).send({ error: 'Unauthorized' });
    }
  });
});

// Declaração do usuário no FastifyRequest
// Estender a interface FastifyJWT no módulo fastify-jwt
declare module 'fastify-jwt' {
  interface FastifyJWT {
    payload: { id: string; email: string }; // Tipo do payload
    user: {
      id: string;
      email: string;
    }; // Tipo do usuário
  }
}
// Estender a interface FastifyJWT no módulo fastify-jwt
declare module 'fastify-jwt' {
  interface FastifyJWT {
    payload: { id: string; email: string }; // Tipo do payload
    user: {
      id: string;
      email: string;
    }; // Tipo do usuário
  }
}