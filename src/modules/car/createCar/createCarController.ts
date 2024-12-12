import { FastifyRequest, FastifyReply, FastifyInstance } from "fastify";
import { BadRequestError, NotFoundError } from "../../../error/errors";
import { createCarHandler } from "./createCarHandler";

export const createCarController = (fastify: FastifyInstance) => {
fastify.post(
    '/cars',
    { preValidation: [fastify.authenticate] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      
      const { brand, model, plate } = request.body as {
        brand: string;
        model: string;
        plate: string;
      };
      fastify.log.info(`Creating a new car for userId: ${request.user.id}`);
      try {
        const car = await createCarHandler({
          brand,
          model,
          ownerId: request.user.id,
          plate,
        });
        return reply.status(201).send(car);
      } catch (error) {
        fastify.log.error(error);
        if (error instanceof BadRequestError) {
          return reply.status(400).send({ error: error.message });
        }
        if (error instanceof NotFoundError) {
          return reply.status(404).send({ error: error.message });
        }
        return reply.status(500).send({ error: 'Internal Server Error' });
      }
    }
  )
};