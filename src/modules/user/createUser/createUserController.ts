import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { BadRequestError } from "../../../error/errors";
import { createUserHandler } from "./createUserHandler";

export const createUserController = (fastify: FastifyInstance) => {

fastify.post(
    '/users',
    { preValidation: [fastify.authenticate] },
    async (request: FastifyRequest, reply: FastifyReply) => {
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
  })
};