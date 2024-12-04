import Fastify from 'fastify';
import pinoPretty from 'pino-pretty';
import authPlugin from './plugins/authPlugin';
import { errorHandler } from './middlewares/errorHandling';
import fastifyCookie from '@fastify/cookie';
import { registerControllers } from './modules/registerControllers';

// Configura o logger
const stream = pinoPretty({
  colorize: true,
  translateTime: 'SYS:standard',
  ignore: 'pid,hostname,reqId',
  singleLine: true,
});

const logger = {
  level: 'info',
  stream,
};

const fastify = Fastify({ logger });

// Registra o plugin de cookies
fastify.register(fastifyCookie, {
  secret: process.env.COOKIE_SECRET || 'your-secure-secret', // Use variável de ambiente
  parseOptions: {} // Opções adicionais de parsing
});

// Registra o plugin de autenticação
fastify.register(authPlugin);

registerControllers(fastify);

fastify.setErrorHandler(errorHandler);

// Inicia o servidor na porta 3000
fastify.listen({ port: 3000, host: '127.0.0.1' }, (err, address) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  fastify.log.info(`Server is running at ${address}`);
});