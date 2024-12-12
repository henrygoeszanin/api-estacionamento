import { PrismaClient } from '@prisma/client';
import { NotFoundError, BadRequestError } from '../../../error/errors';
import { ulid } from 'ulid';
import axios from 'axios';
import { deleteCache } from '../../../utils/redisClient';

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

  // Configurações da API SINESP
  const sinespConfig = {
    host: 'apicarros.com',
    endpoint: 'consulta',
    serviceVersion: 'v1',
    timeout: 5000, // 5 segundos
    maximumRetry: 3,
  };

  // Função para buscar informações adicionais do carro
  const fetchVehicleInfo = async (plate: string) => {
    const url = `https://${sinespConfig.host}/${sinespConfig.serviceVersion}/${sinespConfig.endpoint}/${plate}`;
    try {
      const response = await axios.get(url, { timeout: sinespConfig.timeout });
      return response.data;
    } catch (error) {
      throw new BadRequestError('Erro ao buscar informações do veículo. Verifique a placa e tente novamente.');
    }
  };

  // Busca informações adicionais do carro
  const vehicleInfo = await fetchVehicleInfo(data.plate);

  console.log(vehicleInfo);

  // Verifica se todos os campos necessários estão presentes
  if (!vehicleInfo.cor || !vehicleInfo.ano || !vehicleInfo.anoModelo || !vehicleInfo.uf || !vehicleInfo.municipio || !vehicleInfo.chassi || !vehicleInfo.dataAtualizacaoCaracteristicasVeiculo || !vehicleInfo.dataAtualizacaoRouboFurto || !vehicleInfo.dataAtualizacaoAlarme) {
    throw new BadRequestError('Informações do veículo incompletas. Verifique a placa e tente novamente.');
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
          cor: vehicleInfo.cor,
          ano: vehicleInfo.ano,
          anoModelo: vehicleInfo.anoModelo,
          uf: vehicleInfo.uf,
          municipio: vehicleInfo.municipio,
          chassi: vehicleInfo.chassi,
          dataAtualizacaoCaracteristicas: vehicleInfo.dataAtualizacaoCaracteristicasVeiculo,
          dataAtualizacaoRouboFurto: vehicleInfo.dataAtualizacaoRouboFurto,
          dataAtualizacaoAlarme: vehicleInfo.dataAtualizacaoAlarme,
        },
      },
    },
  });

  // Exclui o cache relacionado
  await deleteCache(`userCars:${data.ownerId}`);
  await deleteCache('allCars');

  return car;
};