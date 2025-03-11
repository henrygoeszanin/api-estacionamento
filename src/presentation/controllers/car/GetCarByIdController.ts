import { FastifyRequest, FastifyReply, FastifyInstance } from "fastify";
import { PrismaClient } from "@prisma/client";
import { GetCarByIdUseCase } from "../../../application/useCases/car/GetCarByIdUseCase";
import { NotFoundError } from "../../../domain/errors/DomainErros";
import { RedisCache } from "../../../infrastructure/cache/RedisCache";
import { PrismaCarRepository } from "../../../infrastructure/database/prisma/repository/PrismaCarRepository";

export class GetCarByIdController {
  static register(fastify: FastifyInstance, prismaClient: PrismaClient) {
    fastify.get<{ Params: { id: string } }>(
      '/cars/:id',
      { preValidation: [fastify.authenticate] },
      async (request: FastifyRequest, reply: FastifyReply) => {
        try {
          const carId = (request.params as { id: string }).id;
          
          fastify.log.info(`Fetching car with ID: ${carId}`);
          
          const carRepository = new PrismaCarRepository(prismaClient);
          const cacheService = new RedisCache();
          
          const getCarByIdUseCase = new GetCarByIdUseCase(
            carRepository, 
            cacheService
          );
          
          const car = await getCarByIdUseCase.execute(carId);
          
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
  }
}