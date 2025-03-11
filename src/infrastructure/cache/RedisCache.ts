import Redis from 'ioredis';
import { ICacheService } from '../../application/interfaces/ICacheService';

export class RedisCache implements ICacheService {
  private redis: Redis;
  
  constructor() {
    this.redis = new Redis({
      host: process.env.REDIS_HOST ?? 'localhost',
      port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT) : 6379,
      retryStrategy(times) {
        const delay = Math.min(times * 100, 2001);
        if (delay > 2000) {
          console.error('Não foi possível reconectar ao Redis');
          return undefined;
        }
        return delay;
      }
    });
    
    this.redis.on('error', (err) => {
      console.error('Erro ao conectar ao Redis', err);
    });
  }
  
  async get(key: string): Promise<string | null> {
    return this.redis.get(key);
  }
  
  async set(key: string, value: any, ttl: number = 5): Promise<void> {
    await this.redis.set(key, typeof value === 'string' ? value : JSON.stringify(value), 'EX', ttl);
  }
  
  async delete(key: string): Promise<void> {
    await this.redis.del(key);
  }
}