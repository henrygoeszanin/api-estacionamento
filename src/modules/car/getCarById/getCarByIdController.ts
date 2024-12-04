import { FastifyInstance } from "fastify";
import { NotFoundError } from "../../../error/errors";
import { getCarByIdHandler } from "./getCarByIdHandler";
import { extractUserId } from "../../../middlewares/extractUserId";

export const getCarByIdController = (fastify: FastifyInstance) => {
  fastify.get<{ Params: { id: string } }>(
    '/cars/:id',
    { preValidation: [fastify.authenticate, extractUserId] },
    async (request, reply) => {
      const carId = request.params.id;
      fastify.log.info(`Fetching car with ID: ${carId}`);
      try {
        const car = await getCarByIdHandler(carId);
        return reply.send(car);
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