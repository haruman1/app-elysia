import { Elysia } from 'elysia';
import { MikroORM } from '@mikro-orm/core';
import mikroConfig from '../mikro-orm.config';
import { jwt } from '@elysiajs/jwt';

import { authRoutes } from './routes/auth';
import { userRoutes } from './routes/users';
import openapi from '@elysiajs/openapi';
import { stockRoutes } from './routes/stock';

import { movementStockRoutes } from './routes/movementStock';
let orm: MikroORM | null = null;
/**
 * Initialize the Elysia application with MikroORM and start the server.
 * This function initializes the MikroORM instance and then creates a new Elysia application.
 * It then decorates the application with the MikroORM instance and adds the various routes.
 * Finally, it starts the server listening on the port specified in the PORT environment variable.
 */

async function bootstrap() {
  if (!orm) orm = await MikroORM.init(mikroConfig);

  const app = new Elysia()
    .use(
      jwt({
        name: 'jwt',
        secret: process.env.JWT_SECRET!,
        exp: '2h',
      })
    )
    .decorate('orm', orm)
    .get('/', () => 'Hello Elysia')
    .use(
      openapi({
        title: 'Haruman API',
        version: '1.0.0',
      })
    )
    .use(authRoutes)
    .use(userRoutes)
    .use(stockRoutes)
    .use(movementStockRoutes)
    .listen(parseInt(process.env.PORT!));

  console.log(`🚀 Running at http://localhost:${process.env.PORT}`);
}

bootstrap();
