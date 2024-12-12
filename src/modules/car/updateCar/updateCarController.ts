import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { NotFoundError, ForbiddenError } from "../../../error/errors";
import { updateCarHandler } from "./updateCarHandler";

export const updateCarController = (fastify: FastifyInstance) => {

fastify.put(
    '/cars/:id',
    { preValidation: [fastify.authenticate] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const carId = (request.params as { id: string }).id;
      const updateData = request.body as {
        brand?: string;
        model?: string;
        plate?: string;
      };
      fastify.log.info(`Updating car with ID: ${carId} for userId: ${request.user.id}`);
      try {
        const updatedCar = await updateCarHandler(carId, request.user.id, updateData);
        return reply.send(updatedCar);
      } catch (error) {
        fastify.log.error(error);
        if (error instanceof NotFoundError) {
          return reply.status(404).send({ error: error.message });
        }
        if (error instanceof ForbiddenError) {
          return reply.status(403).send({ error: error.message });
        }
        return reply.status(500).send({ error: 'Internal Server Error' });
      }
    }
  )
};