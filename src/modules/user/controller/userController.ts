import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { createUserHandler } from '../handler/createUserHandler';
import { getUserHandler } from '../handler/getUserHandler';
import { BadRequestError, NotFoundError } from '../../../error/errors';
import { updateUserHandler } from '../handler/updateUserhandler';
import { extractUserId } from '../../../middlewares/extractUserId';
import { deleteUserHandler } from '../handler/deleteUserHandler';

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
    try {
      const user = await createUserHandler(request.body as { name: string; email: string; password: string });
      return reply.status(201).send(user);
    } catch (error) {
      fastify.log.error(error);
      if (error instanceof BadRequestError) {
        return reply.status(400).send({ error: error.message });
      }
    }
  });

  // Rota para obter todos os usuários, protegida por autenticação
  fastify.get('/users', { preValidation: [fastify.authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
    fastify.log.info('Fetching all users');
    try{
      const users = await getUserHandler();
      return reply.send(users);
    } catch (error) {
      if (error instanceof NotFoundError) {
        return reply.status(404).send({ error: error.message });
      }
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Internal Server Error' });
    }
  });

  fastify.patch(
    '/users',
    { preValidation: [fastify.authenticate, extractUserId] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const userId = request.userId!;
      fastify.log.info(`Updating user with ID: ${userId}`);
      try {
        const data = request.body as {
          name?: string;
          email?: string;
          password?: string;
        };
        const updatedUser = await updateUserHandler(userId, data);
        return reply.send(updatedUser);
      } catch (error) {
        fastify.log.error(error);
        if (error instanceof NotFoundError) {
          return reply.status(404).send({ error: error.message });
        }
        if (error instanceof BadRequestError) {
          return reply.status(400).send({ error: error.message });
        }
        return reply.status(500).send({ error: 'Internal Server Error' });
      }
    }
  );

  fastify.delete(
    '/users',
    { preValidation: [fastify.authenticate, extractUserId] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const userId = request.userId!;
      fastify.log.info(`Deleting user with ID: ${userId}`);
      try {
        const result = await deleteUserHandler(userId);
        return reply.send(result);
      } catch (error) {
        fastify.log.error(error);
        if (error instanceof NotFoundError) {
          return reply.status(404).send({ error: error.message });
        }
        return reply.status(500).send({ error: 'Internal Server Error' });
      }
    }
  );
};