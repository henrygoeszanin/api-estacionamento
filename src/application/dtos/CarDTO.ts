export interface CreateCarDTO {
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

export interface CarResponseDTO {
  id: string;
  brand: string;
  model: string;
  plate: string;
  ownerId: string;
  details?: {
    cor: string;
    ano: string;
    anoModelo: string;
    uf: string;
    municipio: string;
    chassi: string;
  };
}