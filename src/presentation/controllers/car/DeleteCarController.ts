import { FastifyRequest, FastifyReply, FastifyInstance } from "fastify";
import { PrismaClient } from "@prisma/client";
import { DeleteCarUseCase } from "../../../application/useCases/car/DeleteCarUseCase";
import { NotFoundError, ForbiddenError } from "../../../domain/errors/DomainErrors";
import { RedisCache } from "../../../infrastructure/cache/RedisCache";
import { PrismaCarRepository } from "../../../infrastructure/database/prisma/repository/PrismaCarRepository";

export class DeleteCarController {
  static register(fastify: FastifyInstance, prismaClient: PrismaClient) {
    fastify.delete(
      '/cars/:id',
      { preValidation: [fastify.authenticate] },
      async (request: FastifyRequest, reply: FastifyReply) => {
        try {
          const carId = (request.params as { id: string }).id;
          const userId = request.user.id;
          
          fastify.log.info(`Deleting car with ID: ${carId} for userId: ${userId}`);
          
          const carRepository = new PrismaCarRepository(prismaClient);
          const cacheService = new RedisCache();
          
          const deleteCarUseCase = new DeleteCarUseCase(
            carRepository, 
            cacheService
          );
          
          const result = await deleteCarUseCase.execute(carId, userId);
          
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
}