import { FastifyError, FastifyReply, FastifyRequest } from 'fastify';
import { AppError } from '../error/errors';

export const errorHandler = (error: FastifyError, request: FastifyRequest, reply: FastifyReply) => {
  if (error instanceof AppError) {
    reply.status(error.statusCode).send({ error: error.message });
  } else {
    reply.status(500).send({ error: 'Internal Server Error' });
  }
};