import { Elysia, t } from 'elysia';
import { authMiddleware } from '../middlewares/authMiddleware';
import { User } from '../entities/User';
import { Stock } from '../entities/Stock';
import { query } from '../../mysql.config';
export const stockRoutes = new Elysia({ prefix: '/stocks' })
  .use(authMiddleware)
  .get(
    '/',
    async ({ user }) => {
      const userCheck = await query('SELECT id, role FROM user WHERE id = ?', [
        user.id,
      ]);
      if (userCheck[0].role !== 'admin') {
        return { success: false, message: 'Unauthorized access' };
      }
      if (userCheck.length === 0) {
        return { success: false, message: 'Unauthorized access' };
      }
      const Stocks = await query(
        'SELECT stock.id as Stock_ID, stock.nama_produk, stock.jumlah_produk, stock.harga_produk, user.name as Ditambahkan_oleh FROM stock LEFT JOIN user ON stock.user_id = user.id WHERE stock.user_id = ?',
        [userCheck[0].id]
      );
      return {
        success: true,
        message: 'Daftar Stock',
        data: Stocks,
        timestamp: new Date(),
      };
    },
    {
      headers: t.Object({
        authorization: t.String(),
      }),
    }
  )
  .get(
    '/:id',
    async ({ params, user }) => {
      const id = String(params.id).trim();
      const userCheck = await query('SELECT id FROM user WHERE id = ?', [
        user.id,
      ]);
      if (userCheck.length === 0) {
        return { success: false, message: 'Unauthorized access' };
      }
      const Stock = await query(
        'SELECT stock.id as Stock_ID, stock.nama_produk, stock.jumlah_produk, stock.harga_produk, user.name as Ditambahkan_oleh FROM stock LEFT JOIN user ON stock.user_id = user.id WHERE stock.id = ? AND stock.user_id = ? LIMIT 1',
        // 'SELECT id, nama_produk, jumlah_produk, harga_produk FROM stock WHERE id = ? AND user_id = ?',
        [id, userCheck[0].id]
      );
      if (Stock.length === 0) {
        return { success: false, message: 'Stock tidak ditemukan' };
      }
      return {
        success: true,
        message: 'Stock ditemukan',
        data: Stock[0],
        timestamp: new Date(),
      };
    },
    {
      headers: t.Object({
        authorization: t.String(),
      }),
    }
  );

// .get('/', async ({ orm, user }) => {
//   const em = orm.em.fork();

//   const stocks = await em.find(Stock, {});

//   return { success: true, message: 'Stock ditemukan', data: stocks };
// })
// .get('/:id', async ({ orm, user, params }) => {
//   const em = orm.em.fork();
//   const userID = String(user.id);
//   const stock = await em.findOne(Stock, {
//     id: params.id,
//     user: { id: userID },
//   });
//   if (!stock) {
//     return { success: false, message: 'Stock tidak ditemukan' };
//   }
//   return { success: true, message: 'Stock ditemukan', data: stock };
// })
// .post('/', async ({ orm, user, body }) => {
//   const em = orm.em.fork();
//   const userID = String(user.id);
//   const stock = em.create(Stock, {
//     name: body.name,
//     quantity: body.quantity,
//     user: { id: userID },
//   });
//   await em.persistAndFlush(stock);
//   return {
//     success: true,
//     message: 'Stock berhasil ditambahkan',
//     data: stock,
//   };
// })
// .delete('/:id', async ({ orm, user, params }) => {
//   const em = orm.em.fork();
//   const userID = String(user.id);
//   const id = String(params.id).trim();
//   const existingUser = await em.findOne(User, { id: userID });
//   if (user.role !== 'admin') {
//     return {
//       success: false,
//       message: 'Unauthorized access',
//     };
//   }
//   if (!existingUser) {
//     return { success: false, message: 'Unauthorized access' };
//   }
//   const stock = await em.findOne(Stock, {
//     id: id,
//     user: { id: userID },
//   });
//   if (!stock) {
//     return { success: false, message: 'Stock tidak ditemukan' };
//   }
//   await em.removeAndFlush(stock);
//   return { success: true, message: 'Stock berhasil dihapus' };
// });
