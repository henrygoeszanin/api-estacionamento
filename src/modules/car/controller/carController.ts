import { FastifyInstance } from 'fastify';
import { createCarHandler } from '../handler/createCarHandler';
import { extractUserId } from '../../../middlewares/extractUserId';
import { getUserCarsHandler } from '../handler/getUserCarHandler';
import { getAllCarsHandler } from '../handler/getAlllCarsHandler';

// Controlador para rotas de carro
export const carController = (fastify: FastifyInstance) => {
  // Rota para criar um novo carro
  fastify.post('/cars', { preValidation: [fastify.authenticate, extractUserId] }, async (request, reply) => {
    const userId = request.userId!;
    const { brand, model } = request.body as { brand: string; model: string };
    fastify.log.info(`Creating a new car for userId: ${userId}`);
    const car = await createCarHandler({ brand, model, ownerId: userId });
    return reply.send(car);
  });

  // Rota para obter os carros de um usuário específico
  fastify.get('/cars/user', { preValidation: [fastify.authenticate, extractUserId] }, async (request, reply) => {
    const userId = request.userId!;
    fastify.log.info(`Fetching cars for userId: ${userId}`);
    const cars = await getUserCarsHandler(userId);
    return reply.send(cars);
  });

  // Rota para obter todos os carros
  fastify.get('/cars', async (request, reply) => {
    fastify.log.info('Fetching all cars');
    const cars = await getAllCarsHandler();
    return reply.send(cars);
  });
};