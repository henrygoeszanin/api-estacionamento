import { FastifyReply, FastifyRequest } from 'fastify';

// Interface para o payload JWT
interface JwtPayload {
  id: number;
  email: string;
}

// Middleware para extrair o userId do token JWT
export const extractUserId = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    // Verifica o token JWT no request
    await request.jwtVerify<JwtPayload>();
    // Adiciona o userId ao objeto request
    request.userId = (request.user as JwtPayload).id;
  } catch (err) {
    // Retorna erro 401 se a verificação falhar
    reply.status(401).send({ error: 'Unauthorized' });
  }
};