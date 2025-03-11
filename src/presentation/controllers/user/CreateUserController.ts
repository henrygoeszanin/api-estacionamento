import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { PrismaClient } from "@prisma/client";
import { CreateUserDTO } from "../../../application/dtos/UserDTO";
import { CreateUserUseCase } from "../../../application/useCases/users/CreateUserUseCase";
import { BadRequestError } from "../../../domain/errors/DomainErrors";
import { RedisCache } from "../../../infrastructure/cache/RedisCache";
import { PrismaUserRepository } from "../../../infrastructure/database/prisma/repository/PrismaUserRepository";


export class CreateUserController {
  static register(fastify: FastifyInstance, prismaClient: PrismaClient) {
    fastify.post<{ Body: CreateUserDTO }>(
      '/users',
      async (request: FastifyRequest, reply: FastifyReply) => {
        try {
          fastify.log.info('Creating a new user');
          
          const userRepository = new PrismaUserRepository(prismaClient);
          const cacheService = new RedisCache();
          
          const createUserUseCase = new CreateUserUseCase(
            userRepository, 
            cacheService
          );
          
          const { name, email, password } = request.body as CreateUserDTO;
          const user = await createUserUseCase.execute({ name, email, password });
          
          return reply.status(201).send(user);
        } catch (error) {
          fastify.log.error(error);
          if (error instanceof BadRequestError) {
            return reply.status(400).send({ error: error.message });
          }
          return reply.status(500).send({ error: 'Internal Server Error' });
        }
      }
    );
  }
}