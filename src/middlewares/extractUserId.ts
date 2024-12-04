import { FastifyReply, FastifyRequest } from 'fastify';

// Interface para o payload JWT
interface JwtPayload {
  id: string;
  email: string;
}

// Middleware para extrair o userId do token JWT
export const extractUserId = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    // Verifica o token JWT no request e decodifica o payload
    const decoded = await request.jwtVerify<JwtPayload>();
    // O objeto `request.user` já está disponível após a verificação
    request.user = { id: decoded.id, email: decoded.email };
  } catch (err) {
    // Retorna erro 401 se a verificação falhar
    reply.status(401).send({ error: 'Unauthorized' });
  }
};