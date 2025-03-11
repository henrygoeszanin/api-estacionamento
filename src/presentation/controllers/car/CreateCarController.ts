import { FastifyRequest, FastifyReply, FastifyInstance } from "fastify";
import { CreateCarUseCase } from "../../../application/useCases/car/CreateCarUseCase";
import { PrismaCarRepository } from "../../../infrastructure/database/prisma/repository/PrismaCarRepository";
import { PrismaUserRepository } from "../../../infrastructure/database/prisma/repository/PrismaUserRepository";
import { RedisCache } from "../../../infrastructure/cache/RedisCache";
import { PrismaClient } from "@prisma/client";
import { CreateCarDTO } from "../../../application/dtos/CarDTO";

export class CreateCarController {
  static register(fastify: FastifyInstance, prismaClient: PrismaClient) {
    fastify.post<{ Body: CreateCarDTO }>(
      '/cars',
      { preValidation: [fastify.authenticate] },
      async (request: FastifyRequest, reply: FastifyReply) => {
        try {
          const carRepository = new PrismaCarRepository(prismaClient);
          const userRepository = new PrismaUserRepository(prismaClient);
          const cacheService = new RedisCache();
          
          const createCarUseCase = new CreateCarUseCase(
            carRepository,
            userRepository,
            cacheService
          );
          
          const { brand, model, plate, cor, ano, anoModelo, uf, municipio, chassi, 
            dataAtualizacaoCaracteristicas, dataAtualizacaoRouboFurto, 
            dataAtualizacaoAlarme } = request.body as CreateCarDTO;
          
          fastify.log.info(`Creating a new car for userId: ${request.user.id}`);
          
          const car = await createCarUseCase.execute({
            brand,
            model,
            ownerId: request.user.id,
            plate,
            cor,
            ano,
            anoModelo,
            uf,
            municipio,
            chassi,
            dataAtualizacaoCaracteristicas,
            dataAtualizacaoRouboFurto,
            dataAtualizacaoAlarme
          });
          
          return reply.status(201).send(car);
        } catch (error) {
          fastify.log.error(error);
          if (error.message === 'Owner not found') {
            return reply.status(404).send({ error: error.message });
          }
          if (error.message === 'Car already exists for this owner') {
            return reply.status(400).send({ error: error.message });
          }
          return reply.status(500).send({ error: 'Internal Server Error' });
        }
      }
    );
  }
}