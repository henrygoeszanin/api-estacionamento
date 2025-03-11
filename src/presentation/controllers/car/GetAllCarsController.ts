import { FastifyRequest, FastifyReply, FastifyInstance } from "fastify";
import { PrismaClient } from "@prisma/client";
import { GetAllCarsUseCase } from "../../../application/useCases/car/GetAllCarsUseCase";
import { NotFoundError } from "../../../domain/errors/DomainErros";
import { RedisCache } from "../../../infrastructure/cache/RedisCache";
import { PrismaCarRepository } from "../../../infrastructure/database/prisma/repository/PrismaCarRepository";

export class GetAllCarsController {
  static register(fastify: FastifyInstance, prismaClient: PrismaClient) {
    fastify.get(
      '/cars',
      { preValidation: [fastify.authenticate] },
      async (request: FastifyRequest, reply: FastifyReply) => {
        try {
          fastify.log.info('Fetching all cars');
          request.log.info('user: ', request.user);
          
          const carRepository = new PrismaCarRepository(prismaClient);
          const cacheService = new RedisCache();
          
          const getAllCarsUseCase = new GetAllCarsUseCase(
            carRepository, 
            cacheService
          );
          
          const cars = await getAllCarsUseCase.execute();
          
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