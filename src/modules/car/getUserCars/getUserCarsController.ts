import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { NotFoundError } from "../../../error/errors";
import { extractUserId } from "../../../middlewares/extractUserId";
import { getUserCarsHandler } from "./getUserCarsHandler";

export const getUserCarsController = (fastify: FastifyInstance) => {

fastify.get(
    '/cars/user',
    { preValidation: [fastify.authenticate, extractUserId] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      fastify.log.info(`Fetching cars for userId: ${request.user.id}`);
      try {
        const cars = await getUserCarsHandler(request.user.id);
        if (cars.length === 0) {
          throw new NotFoundError('No cars found for this user');
        }
        return reply.send(cars);
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