import { PrismaClient } from '@prisma/client';
import { NotFoundError, BadRequestError } from '../../../error/errors';
import { ulid } from 'ulid';

const prisma = new PrismaClient();

// Handler para criar um novo carro
export const createCarHandler = async (data: { brand: string; model: string; ownerId: string; plate: string }) => {
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
    },
  });
  return car;
};