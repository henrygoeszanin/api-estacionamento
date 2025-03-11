import { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { LoginController } from '../controllers/user/LoginController';
import { CreateCarController } from '../controllers/car/CreateCarController';
import { CreateUserController } from '../controllers/user/CreateUserController';
import { DeleteCarController } from '../controllers/car/DeleteCarController';
import { DeleteUserController } from '../controllers/user/DeleteUserController';
import { GetAllCarsController } from '../controllers/car/GetAllCarsController';
import { GetCarByIdController } from '../controllers/car/GetCarByIdController';
import { GetUserCarsController } from '../controllers/car/GetUserCarsController';
import { GetUsersController } from '../controllers/user/GetUsersController';
import { UpdateCarController } from '../controllers/car/UpdateCarController';
import { UpdateUserController } from '../controllers/user/UpdateUserController';


export class RouteRegister {
  static registerRoutes(fastify: FastifyInstance, prismaClient: PrismaClient) {
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
  }
}