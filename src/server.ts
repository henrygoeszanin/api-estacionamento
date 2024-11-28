import Fastify from 'fastify';
import pinoPretty from 'pino-pretty';
import { userController } from './modules/user/controller/userController';
import authPlugin from './plugins/authPlugin';
import { carController } from './modules/car/controller/carController';
import { loginController } from './modules/auth/controller/loginController';

// Configura o logger
const stream = pinoPretty({
  colorize: true,
  translateTime: 'SYS:standard',
  ignore: 'pid,hostname'
});

const logger = {
  level: 'info',
  stream
};

const fastify = Fastify({ logger });

// Registra o plugin de autenticação
fastify.register(authPlugin);

// Registra o controlador de login
fastify.register(loginController);

// Registra o controlador de usuário
fastify.register(userController);

// Registra o controlador de carros
fastify.register(carController);

// Inicia o servidor na porta 3000
fastify.listen({ port: 3000 }, (err, address) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  fastify.log.info(`Server is running at ${address}`);
});