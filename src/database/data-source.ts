import { DataSource } from 'typeorm';
import { User } from '../modules/user/entity/User';
import { Car } from '../modules/car/entity/Car';

// Configuração da fonte de dados do TypeORM
export const AppDataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'password',
  database: 'fastifydb',
  synchronize: true,
  logging: true,
  entities: [User, Car],
});

// Inicializa a conexão com o banco de dados
AppDataSource.initialize()
  .then(() => console.log('Database connected'))
  .catch(err => console.error('Database connection failed:', err));