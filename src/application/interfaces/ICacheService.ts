export interface ICacheService {
  get(key: string): Promise<string | null>;
  set(key: string, value: any, ttl?: number): Promise<void>;
  delete(key: string): Promise<void>;
}