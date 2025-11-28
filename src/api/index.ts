import { Elysia, t } from 'elysia';
import { jwt } from '@elysiajs/jwt';
import Mysql from '../mysql.config';
import { authRoutes } from './routes/auth';
import { userRoutes } from './routes/users';
import openapi from '@elysiajs/openapi';
import { stockRoutes } from './routes/stock';
import { cors } from '@elysiajs/cors';
import { movementStockRoutes } from './routes/movementStock';

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
      return { success: false, message: 'Unauthorized Access' };
    }
  })
  .get('/', () => 'Hello Elysia')
  .use(
    cors({
      origin: ['*'],
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  )
  .use(openapi())
  .use(authRoutes)
  .use(userRoutes)
  .use(stockRoutes)
  .use(movementStockRoutes);

// ❗ Vercel tidak boleh pakai .listen(), jadi hilangkan
// .listen(parseInt(process.env.PORT!));

export const config = {
  runtime: 'bun', // WAJIB: karena MySQL, JWT, dll
};

// Vercel akan menjalankan ini sebagai handler
export default app;
