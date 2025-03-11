import Fastify from 'fastify';
import pinoPretty from 'pino-pretty';
import fastifyCookie from '@fastify/cookie';
import fastifyHelmet from '@fastify/helmet';
import fastifyRateLimit from '@fastify/rate-limit';
import fastifyCompress from '@fastify/compress';
import fastifyMetrics from 'fastify-metrics';
import fastifyHealthcheck from 'fastify-healthcheck';
import fastifyCors from '@fastify/cors';
import { PrismaClient } from '@prisma/client';
import { RouteRegister } from '../presentation/routes/RouteRegister';
import { errorHandler } from '../presentation/middlewares/errorHandling';
import jwtAuthProvider from '../infrastructure/auth/JwtAuthProvider';

export function buildApp() {
  // Configura o logger
  const stream = pinoPretty({
    colorize: true,
    translateTime: 'SYS:standard',
    ignore: 'pid,hostname,reqId',
    singleLine: true,
  });

  const logger = { level: 'info', stream };
  const fastify = Fastify({ logger });
  const prismaClient = new PrismaClient();

  // Registra plugins
  fastify.register(fastifyHelmet);
  fastify.register(fastifyRateLimit, { max: 100, timeWindow: '1 minute' });
  fastify.register(fastifyHealthcheck, { healthcheckUrl: '/health', exposeUptime: true });
  fastify.register(fastifyCompress);
  fastify.register(fastifyCors, {
    origin: '*',
    methods: ['GET', 'PUT', 'POST', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type'],
  });
  fastify.register(fastifyCookie, {
    secret: process.env.COOKIE_SECRET || 'your-secure-secret',
    parseOptions: {},
  });
  fastify.register(jwtAuthProvider);
  fastify.register(fastifyMetrics, {
    endpoint: '/metrics',
    routeMetrics: {
      enabled: { histogram: true, summary: true },
      overrides: {
        histogram: {
          name: 'http_request_duration_seconds',
          help: 'request duration in seconds',
          buckets: [0.05, 0.1, 0.5, 1, 3, 5, 10],
        },
        summary: {
          name: 'http_request_summary_seconds',
          help: 'request duration in seconds summary',
          percentiles: [0.5, 0.9, 0.95, 0.99],
        },
      },
    },
  });

  // Registra rotas
  RouteRegister.registerRoutes(fastify, prismaClient);

  // Configura o manipulador de erros
  fastify.setErrorHandler(errorHandler);

  return { fastify, prismaClient };
}