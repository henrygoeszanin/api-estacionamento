import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { NotFoundError, BadRequestError } from "../../../error/errors";
import { updateUserHandler } from "./updateUserhandler";


export const updateUserController = (fastify: FastifyInstance) => {

fastify.patch(
    '/users',
    { preValidation: [fastify.authenticate] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const userId = request.user.id;
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
  )
};