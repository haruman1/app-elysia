import { Elysia, t } from 'elysia';

import { jwt } from '@elysiajs/jwt';
import Mysql from '../mysql.config';
import { authRoutes } from './routes/auth';
import { userRoutes } from './routes/users';
import openapi from '@elysiajs/openapi';
import { stockRoutes } from './routes/stock';
import { cors } from '@elysiajs/cors';

async function bootstrap() {
  const app = new Elysia()
    .use(
      jwt({
        name: 'jwt',
        secret: process.env.JWT_SECRET!,
        exp: '2h',
      })
    )
    .guard({
      headers: t.Object({
        authorization: t.Optional(t.String()),
      }),
    })
    .onError(({ code, error }) => {
      if (code === 401) {
        return { success: false, message: 'Unauthorized Access' };
      }
      if (code === 'NOT_FOUND') {
        return {
          success: false,
          message: 'Unauthorized Access',
        };
      }
    })
    .get('/', () => 'Hello Elysia')
    .use(
      cors({
        origin: ['*'], // FE Vite
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
      })
    )
    .use(openapi())
    .use(authRoutes)
    .use(userRoutes)
    .use(stockRoutes)
    .listen(parseInt(process.env.PORT!));

  console.log(`🚀 Running at http://localhost:${process.env.PORT}`);
}

bootstrap();
