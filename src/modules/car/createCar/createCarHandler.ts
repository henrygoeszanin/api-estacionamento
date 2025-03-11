import { PrismaClient } from '@prisma/client';
import { NotFoundError, BadRequestError } from '../../../error/errors';
import { ulid } from 'ulid';
import { deleteCache, setCache } from '../../../../redis/redisClient';
import { CACHE_KEYS } from '../../../../redis/redisCacheKeys';

const prisma = new PrismaClient();

interface CarData {
  brand: string;
  model: string;
  ownerId: string;
  plate: string;
  cor: string;
  ano: string;
  anoModelo: string;
  uf: string;
  municipio: string;
  chassi: string;
  dataAtualizacaoCaracteristicas: string;
  dataAtualizacaoRouboFurto: string;
  dataAtualizacaoAlarme: string;
}

// Handler para criar um novo carro
export const createCarHandler = async (data: CarData) => {
  // Verifica se o usuário existe
  const owner = await prisma.user.findUnique({
    where: { id: data.ownerId },
  });
  if (!owner) {
    throw new NotFoundError('Owner not found');
  }

  // Verifica se o carro já existe para o mesmo proprietário
  const carExists = await prisma.car.findFirst({
    where: {
      brand: data.brand,
      model: data.model,
      ownerId: data.ownerId,
      plate: data.plate,
    },
  });
  if (carExists) {
    throw new BadRequestError('Car already exists for this owner');
  }

  // Cria o carro e associa o proprietário
  const car = await prisma.car.create({
    data: {
      id: ulid(),
      brand: data.brand,
      model: data.model,
      ownerId: owner.id,
      plate: data.plate,
      details: {
        create: {
          id: ulid(),
          cor: data.cor,
          ano: data.ano,
          anoModelo: data.anoModelo,
          uf: data.uf,
          municipio: data.municipio,
          chassi: data.chassi,
          dataAtualizacaoCaracteristicas: data.dataAtualizacaoCaracteristicas,
          dataAtualizacaoRouboFurto: data.dataAtualizacaoRouboFurto,
          dataAtualizacaoAlarme: data.dataAtualizacaoAlarme,
        },
      },
    },
  });

  // Consulta o carro recém-criado com todos os detalhes
  const createdCar = await prisma.car.findUnique({
    where: { id: car.id },
    include: { details: true },
  });

  // Exclui o cache relacionado
  await deleteCache(CACHE_KEYS.MY_CARS(data.ownerId));
  await deleteCache(CACHE_KEYS.ALL_CARS);

  // seta o cache para o carro criado
  await setCache(CACHE_KEYS.CAR(createdCar.id), createdCar);

  return car;
};