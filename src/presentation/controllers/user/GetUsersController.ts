import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { PrismaClient } from "@prisma/client";
import { PrismaUserRepository } from "../../../infrastructure/database/prisma/repository/PrismaUserRepository";
import { GetUsersUseCase } from "../../../application/useCases/users/GetUsersUseCase";
import { NotFoundError } from "../../../domain/errors/DomainErros";
import { RedisCache } from "../../../infrastructure/cache/RedisCache";

export class GetUsersController {
  static register(fastify: FastifyInstance, prismaClient: PrismaClient) {
    fastify.get(
      '/users',
      { preValidation: [fastify.authenticate] },
      async (request: FastifyRequest, reply: FastifyReply) => {
        try {
          fastify.log.info('Fetching all users');
          
          const userRepository = new PrismaUserRepository(prismaClient);
          const cacheService = new RedisCache();
          
          const getUsersUseCase = new GetUsersUseCase(
            userRepository, 
            cacheService
          );
          
          const users = await getUsersUseCase.execute();
          
          return reply.send(users);
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