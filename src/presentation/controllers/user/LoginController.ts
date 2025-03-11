import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { LoginUseCase } from '../../../application/useCases/auth/LoginUseCase';
import { PrismaUserRepository } from '../../../infrastructure/database/prisma/repository/PrismaUserRepository';
import { LoginDTO } from '../../../application/dtos/UserDTO';

export class LoginController {
  static register(fastify: FastifyInstance, prismaClient: PrismaClient) {
    fastify.post<{ Body: LoginDTO }>(
      '/login',
      async (request: FastifyRequest, reply: FastifyReply) => {
        try {
          fastify.log.info('User login attempt');
          
          const userRepository = new PrismaUserRepository(prismaClient);
          const loginUseCase = new LoginUseCase(userRepository);
          
          const { email, password } = request.body as LoginDTO;
          const user = await loginUseCase.execute({ email, password });
          
          // Gera um token JWT para o usuário
          const token = await reply.jwtSign(user, { expiresIn: '12h' });
          
          // Define o cookie JWT
          reply.setCookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/',
          });
          
          return reply.send({ message: 'Login successful' });
        } catch (error) {
          fastify.log.error(error);
          if (error.message === 'Invalid email or password') {
            return reply.status(401).send({ error: error.message });
          }
          return reply.status(500).send({ error: 'Internal Server Error' });
        }
      }
    );
  }
}