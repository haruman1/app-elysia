import { Elysia } from 'elysia';
import { userRoutes } from '../src/routes/users';
import { stockRoutes } from '../src/routes/stock';
import openapi from '@elysiajs/openapi';

const app = new Elysia()
  .get('/', () => ({
    status: 'ok',
    message: 'Elysia running on Vercel!',
  }))
  .use(userRoutes)
  .use(stockRoutes)
  .use(openapi());

export default app.handle;
