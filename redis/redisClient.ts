import Redis from 'ioredis';

// Cria um cliente Redis
const redis = new Redis({
  host: process.env.REDIS_HOST ?? 'localhost', // ou o endereço do seu servidor Redis
  port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT, 10) : 6379, // porta padrão do Redis
  retryStrategy(times) {
    const delay = Math.min(times * 100, 2001); // Aumenta o tempo de espera entre as tentativas, até um máximo de 2 segundos
    console.log(`Tentativa de reconexão ao Redis em ${delay}ms`);
    if (delay > 2000) {
      console.error('Não foi possível reconectar ao Redis, encerrando aplicação...');
      return undefined;
    }
    return delay;
  },
});

// Lida com eventos de erro
redis.on('error', (err) => {
  console.error('Erro ao conectar ao Redis', err);
});

// Função para definir o cache
export async function setCache(key: string, value: string, db: number = 0, ttl: number = 5): Promise<void> {
  try {
    await redis.select(db);
    await redis.set(key, value, 'EX', ttl);
    console.log(`Cache definido para a chave ${key} no banco ${db} com TTL de ${ttl} segundos`);
  } catch (err) {
    console.error('Erro ao definir cache', err);
  }
}

// Função para obter o cache
export async function getCache(key: string, db: number = 0): Promise<string | null> {
  try {
    await redis.select(db);
    const value = await redis.get(key);
    console.log(`Valor obtido para a chave ${key} no banco ${db}: ${value}`);
    return value;
  } catch (err) {
    console.error('Erro ao obter cache', err);
    return null;
  }
}

// Função para excluir o cache
export async function deleteCache(key: string, db: number = 0): Promise<void> {
  try {
    await redis.select(db);
    await redis.del(key);
    console.log(`Cache excluído para a chave ${key} no banco ${db}`);
  } catch (err) {
    console.error('Erro ao excluir cache', err);
  }
}