import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { NotFoundError } from "../../../error/errors";
import { getUserHandler } from "./getUserHandler";

export const getUserController = (fastify: FastifyInstance) => {

fastify.get(
    '/users',
    { preValidation: [fastify.authenticate] },
    async (request: FastifyRequest, reply: FastifyReply) => {
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
}