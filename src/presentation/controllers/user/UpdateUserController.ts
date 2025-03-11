import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { PrismaClient } from "@prisma/client";
import { UpdateUserUseCase } from "../../../application/useCases/users/UpdateUserUseCase";
import { NotFoundError, BadRequestError } from "../../../domain/errors/DomainErrors";
import { RedisCache } from "../../../infrastructure/cache/RedisCache";
import { PrismaUserRepository } from "../../../infrastructure/database/prisma/repository/PrismaUserRepository";

export class UpdateUserController {
  static register(fastify: FastifyInstance, prismaClient: PrismaClient) {
    fastify.patch(
      '/users',
      { preValidation: [fastify.authenticate] },
      async (request: FastifyRequest, reply: FastifyReply) => {
        try {
          const userId = request.user.id;
          
          fastify.log.info(`Updating user with ID: ${userId}`);
          
          const userRepository = new PrismaUserRepository(prismaClient);
          const cacheService = new RedisCache();
          
          const updateUserUseCase = new UpdateUserUseCase(
            userRepository, 
            cacheService
          );
          
          const data = request.body as {
            name?: string;
            email?: string;
            password?: string;
          };
          
          const updatedUser = await updateUserUseCase.execute(userId, data);
          
          return reply.send(updatedUser);
        } catch (error) {
          fastify.log.error(error);
          if (error instanceof NotFoundError) {
            return reply.status(404).send({ error: error.message });
          }
          if (error instanceof BadRequestError) {
            return reply.status(400).send({ error: error.message });
          }
          return reply.status(500).send({ error: 'Internal Server Error' });
        }
      }
    );
  }
}