import { FastifyInstance } from 'fastify';
import { authController } from './auth/authController';
import { createCarController } from './car/createCar/createCarController';
import { deleteCarController } from './car/deleteCar/deleteCarController';
import { getAllCarsController } from './car/getAllCars/getAllCarsController';
import { getUserCarsController } from './car/getUserCars/getUserCarsController';
import { updateCarController } from './car/updateCar/updateCarController';
import { getCarByIdController } from './car/getCarById/getCarByIdController';
import { createUserController } from './user/createUser/createUserController';
import { updateUserController } from './user/updateUser/updateUserController';
import { deleteUserController } from './user/deleteUser/deleteUserController';
import { getUserController } from './user/getUsers/getUserController';

export const registerControllers = (fastify: FastifyInstance) => {
  fastify.register(authController);
  fastify.register(createCarController);
  fastify.register(getUserCarsController);
  fastify.register(getAllCarsController);
  fastify.register(updateCarController);
  fastify.register(deleteCarController);
  fastify.register(getCarByIdController);
  fastify.register(createUserController);
  fastify.register(getUserController);
  fastify.register(updateUserController);
  fastify.register(deleteUserController);
  fastify.log.info('Controllers registered');
};