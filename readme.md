# Meus carros API

Esta é uma API construída com Fastify, TypeORM e PostgreSQL. A API fornece funcionalidades para gerenciar usuários e seus carros, incluindo autenticação JWT.

## Requisitos

- Node.js
- PostgreSQL
- Docker (opcional, para usar o Docker Compose)

## Configuração

### Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto e adicione a seguinte variável de ambiente:

Substitua `your_secret_key` por uma chave secreta de sua escolha.

### Instalação

1. Clone o repositório:

   ```sh
   git clone <url-do-repositorio>
   cd api-meus-carros
   ```

2. Instale as dependências:

   ```sh
   npm install
   ```

3. Compile o código TypeScript para JavaScript:
   ```sh
   npm run build
   ```

### Executando a Aplicação

#### Localmente

Para rodar a aplicação localmente, utilize o seguinte comando:

```sh
npm run dev
```

### Usando o Docker

1. Construa a imagem docker

```sh
docker build -t api-meus-carros .
```

3. Execute o container

```sh
docker run -p 3000:3000 --env-file .env api-meus-carros
```

### Subir o banco de dados postgres em docker

1. Suba o banco usando o comando na pasta raiz do projeto

```sh
docker compose up -d
```

### Endpoints

as rotas estão no arquivo endpoints.json na pasta raiz, ele pode ser importado no Postman
