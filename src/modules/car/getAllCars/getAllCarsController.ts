import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { NotFoundError } from "../../../error/errors";
import { getAllCarsHandler } from "./getAllCarsHandler";

// Declaração do método de autenticação no Fastify
declare module 'fastify' {
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}

export const getAllCarsController = (fastify: FastifyInstance) => {
fastify.get('/cars',
  { preValidation: [fastify.authenticate] },
  async (request: FastifyRequest, reply: FastifyReply) => {
    fastify.log.info('Fetching all cars');
    try {
      request.log.info('user: ', request.user);
      const cars = await getAllCarsHandler();
      if (cars.length === 0) {
        throw new NotFoundError('No cars found');
      }
      return reply.send(cars);
    } catch (error) {
      fastify.log.error(error);
      if (error instanceof NotFoundError) {
        return reply.status(404).send({ error: error.message });
      }
      return reply.status(500).send({ error: 'Internal Server Error' });
    }
  })
};