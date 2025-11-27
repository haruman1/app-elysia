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
  })
  .post('/', async ({ orm, user, body }) => {
    const em = orm.em.fork();
    const userID = String(user.id);
    const stock = em.create(Stock, {
      name: body.name,
      quantity: body.quantity,
      user: { id: userID },
    });
    await em.persistAndFlush(stock);
    return {
      success: true,
      message: 'Stock berhasil ditambahkan',
      data: stock,
    };
  })
  .delete('/:id', async ({ orm, user, params }) => {
    const em = orm.em.fork();
    const userID = String(user.id);
    const id = String(params.id).trim();
    const existingUser = await em.findOne(User, { id: userID });
    if (user.role !== 'admin') {
      return {
        success: false,
        message: 'Unauthorized access',
      };
    }
    if (!existingUser) {
      return { success: false, message: 'Unauthorized access' };
    }
    const stock = await em.findOne(Stock, {
      id: id,
      user: { id: userID },
    });
    if (!stock) {
      return { success: false, message: 'Stock tidak ditemukan' };
    }
    await em.removeAndFlush(stock);
    return { success: true, message: 'Stock berhasil dihapus' };
  });
