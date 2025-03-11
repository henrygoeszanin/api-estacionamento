import { FastifyRequest, FastifyReply, FastifyInstance } from "fastify";
import { PrismaClient } from "@prisma/client";
import { GetUserCarsUseCase } from "../../../application/useCases/car/GetUserCarsUseCase";
import { NotFoundError } from "../../../domain/errors/DomainErros";
import { RedisCache } from "../../../infrastructure/cache/RedisCache";
import { PrismaCarRepository } from "../../../infrastructure/database/prisma/repository/PrismaCarRepository";

export class GetUserCarsController {
  static register(fastify: FastifyInstance, prismaClient: PrismaClient) {
    fastify.get(
      '/cars/user',
      { preValidation: [fastify.authenticate] },
      async (request: FastifyRequest, reply: FastifyReply) => {
        try {
          const userId = request.user.id;
          
          fastify.log.info(`Fetching cars for userId: ${userId}`);
          
          const carRepository = new PrismaCarRepository(prismaClient);
          const cacheService = new RedisCache();
          
          const getUserCarsUseCase = new GetUserCarsUseCase(
            carRepository, 
            cacheService
          );
          
          const cars = await getUserCarsUseCase.execute(userId);
          
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
  }
}