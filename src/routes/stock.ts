import { Elysia } from 'elysia';
import { authMiddleware } from '../middlewares/authMiddleware';
import { User } from '../entities/User';
import { Stock } from '../entities/Stock';

export const stockRoutes = new Elysia({ prefix: '/stocks' })
  .use(authMiddleware)
  .get('/', async ({ orm, user }) => {
    const em = orm.em.fork();

    const stocks = await em.find(Stock, {});

    return { success: true, message: 'Stock ditemukan', data: stocks };
  })
  .get('/:id', async ({ orm, user, params }) => {
    const em = orm.em.fork();
    const userID = String(user.id);
    const stock = await em.findOne(Stock, {
      id: params.id,
      user: { id: userID },
    });
    if (!stock) {
      return { success: false, message: 'Stock tidak ditemukan' };
    }
    return { success: true, message: 'Stock ditemukan', data: stock };
  });
