import { FastifyRequest, FastifyReply, FastifyInstance } from "fastify";
import { PrismaClient } from "@prisma/client";
import { PrismaCarRepository } from "../../../infrastructure/database/prisma/repository/PrismaCarRepository";
import { RedisCache } from "../../../infrastructure/cache/RedisCache";
import { UpdateCarUseCase } from "../../../application/useCases/car/UpdateCarUseCase";
import { NotFoundError, ForbiddenError } from "../../../domain/errors/DomainErros";

export class UpdateCarController {
  static register(fastify: FastifyInstance, prismaClient: PrismaClient) {
    fastify.put(
      '/cars/:id',
      { preValidation: [fastify.authenticate] },
      async (request: FastifyRequest, reply: FastifyReply) => {
        try {
          const carId = (request.params as { id: string }).id;
          const userId = request.user.id;
          const updateData = request.body as {
            brand?: string;
            model?: string;
            plate?: string;
          };
          
          fastify.log.info(`Updating car with ID: ${carId} for userId: ${userId}`);
          
          const carRepository = new PrismaCarRepository(prismaClient);
          const cacheService = new RedisCache();
          
          const updateCarUseCase = new UpdateCarUseCase(
            carRepository, 
            cacheService
          );
          
          const updatedCar = await updateCarUseCase.execute(carId, userId, updateData);
          
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
  }
}