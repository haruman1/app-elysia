import { Elysia } from 'elysia';

import { jwt } from '@elysiajs/jwt';
import { authRoutes } from './routes/auth';
import { userRoutes } from './routes/users';
import openapi from '@elysiajs/openapi';
import { stockRoutes } from './routes/stock';

async function bootstrap() {
  const app = new Elysia()
    .use(
      jwt({
        name: 'jwt',
        secret: process.env.JWT_SECRET!,
        exp: '2h',
      })
    )
    .get('/', () => 'Hello Elysia')
    .use(openapi())
    .use(authRoutes)
    .use(userRoutes)
    .use(stockRoutes)
    .listen(parseInt(process.env.PORT!));

  console.log(`🚀 Running at http://localhost:${process.env.PORT}`);
}

bootstrap();
