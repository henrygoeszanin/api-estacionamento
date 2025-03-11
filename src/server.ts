import { buildApp } from './config/app';

const { fastify, prismaClient } = buildApp();

// Inicia o servidor
fastify.listen({ port: 3000, host: '127.0.0.1' }, (err, address) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  fastify.log.info(`Server is running at ${address}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  fastify.close().then(() => {
    fastify.log.info('Server closed');
    prismaClient.$disconnect();
    process.exit(0);
  });
});