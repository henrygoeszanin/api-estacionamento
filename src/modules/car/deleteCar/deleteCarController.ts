import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { NotFoundError, ForbiddenError } from "../../../error/errors";
import { deleteCarHandler } from "./deleteCarHandler";

export const deleteCarController = (fastify: FastifyInstance) => {

fastify.delete(
    '/cars/:id',
    { preValidation: [fastify.authenticate] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const carId = (request.params as { id: string }).id;
      const userId = request.user.id;
      fastify.log.info(`Deleting car with ID: ${carId} for userId: ${userId}`);
      try {
        const result = await deleteCarHandler(carId, userId);
        return reply.send(result);
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
  );
}
