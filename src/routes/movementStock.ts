import { Elysia, t } from 'elysia';
import { authMiddleware } from '../middlewares/authMiddleware';
import { User } from '../entities/User';
import { MovementStock } from '../entities/MovementStock';
import { Stock } from '../entities/Stock';

export const movementStockRoutes = new Elysia({
  prefix: '/movement-stock',
})
  .use(authMiddleware)
  .get('/', async ({ orm, user }) => {
    const em = orm.em.fork();
    const movements = await em.find(MovementStock, {});
    return {
      success: true,
      message: 'Daftar movement stock',
      data: movements,
    };
  });
