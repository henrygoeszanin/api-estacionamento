import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { NotFoundError } from "../../../error/errors";
import { extractUserId } from "../../../middlewares/extractUserId";
import { deleteUserHandler } from "./deleteUserHandler";

export const deleteUserController = (fastify: FastifyInstance) => {

fastify.delete(
    '/users',
    { preValidation: [fastify.authenticate, extractUserId] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const userId = request.user.id;
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
  )
};