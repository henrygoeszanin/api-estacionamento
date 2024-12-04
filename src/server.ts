import Fastify from 'fastify';
import pinoPretty from 'pino-pretty';
import fastifyCookie from '@fastify/cookie';
import fastifyHelmet from '@fastify/helmet';
import fastifyRateLimit from '@fastify/rate-limit';
import fastifyCompress from '@fastify/compress';
import fastifyMetrics from 'fastify-metrics';
import authPlugin from './plugins/authPlugin';
import { errorHandler } from './middlewares/errorHandling';
import { registerControllers } from './modules/registerControllers';
import fastifyHealthcheck from 'fastify-healthcheck';
import fastifyCors from '@fastify/cors';

// Configura o logger
const stream = pinoPretty({
  colorize: true, // Adiciona cores ao log
  translateTime: 'SYS:standard', // Adiciona timestamp ao log
  ignore: 'pid,hostname,reqId', // Ignora campos específicos no log
  singleLine: true, // Exibe logs em uma única linha
});

const logger = {
  level: 'info', // Define o nível de log como 'info'
  stream, // Usa o stream configurado acima
};

const fastify = Fastify({ logger }); // Cria uma instância do Fastify com o logger configurado

// Registra plugins de segurança e desempenho
fastify.register(fastifyHelmet); // Adiciona cabeçalhos de segurança HTTP
fastify.register(fastifyRateLimit, {
  max: 100, // Limita o número máximo de requisições por minuto
  timeWindow: '1 minute', // Define a janela de tempo para o rate limit
});

// Registra o plugin de health check
fastify.register(fastifyHealthcheck, {
  healthcheckUrl: '/health', // Define a rota de health check
  exposeUptime: true, // Exibe o tempo de atividade do servidor
});

fastify.register(fastifyCompress); // Comprime as respostas HTTP

// Registra o plugin de CORS
fastify.register(fastifyCors, {
  origin: '*', // Permite todas as origens. Ajuste conforme necessário.
  methods: ['GET', 'PUT', 'POST', 'DELETE', 'PATCH'], // Métodos permitidos
  allowedHeaders: ['Content-Type'], // Cabeçalhos permitidos
});

// Registra o plugin de cookies
fastify.register(fastifyCookie, {
  secret: process.env.COOKIE_SECRET || 'your-secure-secret',
  parseOptions: {}, // Opções adicionais de parsing
});

// Registra o plugin de autenticação
fastify.register(authPlugin);

// Registra o plugin de métricas
fastify.register(fastifyMetrics, {
  endpoint: '/metrics', // Define a rota de métricas
  routeMetrics: {
    enabled: {
      histogram: true,
      summary: true,
    },
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

// Registra todos os controladores
registerControllers(fastify);

// Configura o manipulador de erros
fastify.setErrorHandler(errorHandler);

// Inicia o servidor na porta 3000
fastify.listen({ port: 3000, host: '127.0.0.1' }, (err, address) => {
  if (err) {
    fastify.log.error(err); // Loga o erro se o servidor não iniciar
    process.exit(1); // Encerra o processo com código de erro
  }
  fastify.log.info(`Server is running at ${address}`); // Loga a mensagem de sucesso com o endereço do servidor
});

// Graceful shutdown
process.on('SIGINT', () => {
  fastify.close().then(() => {
    fastify.log.info('Server closed'); // Loga a mensagem de encerramento do servidor
    process.exit(0); // Encerra o processo com sucesso
  });
});