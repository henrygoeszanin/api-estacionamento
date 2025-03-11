import { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';
import fp from 'fastify-plugin';
import { LoginController } from '../controllers/user/LoginController';
import { CreateCarController } from '../controllers/car/CreateCarController';
import { DeleteCarController } from '../controllers/car/DeleteCarController';
import { GetAllCarsController } from '../controllers/car/GetAllCarsController';
import { GetCarByIdController } from '../controllers/car/GetCarByIdController';
import { GetUserCarsController } from '../controllers/car/GetUserCarsController';
import { UpdateCarController } from '../controllers/car/UpdateCarController';
import { CreateUserController } from '../controllers/user/CreateUserController';
import { DeleteUserController } from '../controllers/user/DeleteUserController';
import { GetUsersController } from '../controllers/user/GetUsersController';
import { UpdateUserController } from '../controllers/user/UpdateUserController';
// ...other imports remain the same...

// Convert to a Fastify plugin
export const routeRegister = fp(async (fastify: FastifyInstance, options: { prismaClient: PrismaClient }) => {
  const { prismaClient } = options;
  
  // Auth
  LoginController.register(fastify, prismaClient);
  
  // Cars
  CreateCarController.register(fastify, prismaClient);
  GetAllCarsController.register(fastify, prismaClient);
  GetCarByIdController.register(fastify, prismaClient);
  GetUserCarsController.register(fastify, prismaClient);
  UpdateCarController.register(fastify, prismaClient);
  DeleteCarController.register(fastify, prismaClient);
  
  // Users
  CreateUserController.register(fastify, prismaClient);
  GetUsersController.register(fastify, prismaClient);
  UpdateUserController.register(fastify, prismaClient);
  DeleteUserController.register(fastify, prismaClient);
  
  fastify.log.info('All routes registered');
});