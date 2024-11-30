import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { createCarHandler } from '../handler/createCarHandler';
import { getAllCarsHandler } from '../handler/getAllCarsHandler';
import { getUserCarsHandler } from '../handler/getUserCarHandler';
import { getCarByIdHandler } from '../handler/getCarByIdHandler';
import { updateCarHandler } from '../handler/updateCarHandler';
import { deleteCarHandler } from '../handler/deleteCarHandler';
import { extractUserId } from '../../../middlewares/extractUserId';
import { BadRequestError, NotFoundError, ForbiddenError } from '../../../error/errors';

// Controlador para rotas de carro
export const carController = (fastify: FastifyInstance) => {
  // Rota para criar um novo carro
  fastify.post(
    '/cars',
    { preValidation: [fastify.authenticate, extractUserId] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const userId = request.userId!;
      const { brand, model, plate } = request.body as {
        brand: string;
        model: string;
        plate: string;
      };
      fastify.log.info(`Creating a new car for userId: ${userId}`);
      try {
        const car = await createCarHandler({
          brand,
          model,
          ownerId: userId,
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
  );

  // Rota para obter todos os carros
  fastify.get('/cars', async (request: FastifyRequest, reply: FastifyReply) => {
    fastify.log.info('Fetching all cars');
    try {
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
  });

  // Rota para obter os carros de um usuário específico
  fastify.get(
    '/cars/user',
    { preValidation: [fastify.authenticate, extractUserId] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const userId = request.userId!;
      fastify.log.info(`Fetching cars for userId: ${userId}`);
      try {
        const cars = await getUserCarsHandler(userId);
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
  );

  // Rota para obter um carro por ID
  fastify.get(
    '/cars/:id',
    async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
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

  // Rota para atualizar um carro
  fastify.put(
    '/cars/:id',
    { preValidation: [fastify.authenticate, extractUserId] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const carId = (request.params as { id: string }).id;
      const userId = request.userId!;
      const updateData = request.body as {
        brand?: string;
        model?: string;
        plate?: string;
      };
      fastify.log.info(`Updating car with ID: ${carId} for userId: ${userId}`);
      try {
        const updatedCar = await updateCarHandler(carId, userId, updateData);
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
  );

  // Rota para deletar um carro
  fastify.delete(
    '/cars/:id',
    { preValidation: [fastify.authenticate, extractUserId] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const carId = (request.params as { id: string }).id;
      const userId = request.userId!;
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
};