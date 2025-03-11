import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { PrismaClient } from "@prisma/client";
import { DeleteUserUseCase } from "../../../application/useCases/users/DeleteUserUseCase";
import { NotFoundError } from "../../../domain/errors/DomainErros";
import { RedisCache } from "../../../infrastructure/cache/RedisCache";
import { PrismaUserRepository } from "../../../infrastructure/database/prisma/repository/PrismaUserRepository";


export class DeleteUserController {
  static register(fastify: FastifyInstance, prismaClient: PrismaClient) {
    fastify.delete(
      '/users',
      { preValidation: [fastify.authenticate] },
      async (request: FastifyRequest, reply: FastifyReply) => {
        try {
          const userId = request.user.id;
          
          fastify.log.info(`Deleting user with ID: ${userId}`);
          
          const userRepository = new PrismaUserRepository(prismaClient);
          const cacheService = new RedisCache();
          
          const deleteUserUseCase = new DeleteUserUseCase(
            userRepository, 
            cacheService
          );
          
          const result = await deleteUserUseCase.execute(userId);
          
          return reply.send(result);
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