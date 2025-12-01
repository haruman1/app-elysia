import { Elysia, t } from 'elysia';

import { query } from '../../mysql.config';
import { authMiddleware } from '../middlewares/authMiddleware';
import { generateUUID } from '../utils/uuid';

export const movementStockRoutes = new Elysia({
  prefix: '/stocks/movement',
})
  .use(authMiddleware)
  .post(
    '/',
    async ({ body, user }) => {
      if (!user) {
        throw new Error('UNAUTHORIZED');
      }
      const userCheck = await query('SELECT id FROM user WHERE id = ?', [
        user.id,
      ]);
      if (userCheck.length === 0) {
        throw new Error('UNAUTHORIZED');
      }
      if (
        !body.stock_id ||
        (!body.jumlah_masuk && body.jumlah_masuk !== 0) ||
        (!body.jumlah_keluar && body.jumlah_keluar !== 0)
      ) {
        return { success: false, message: 'Ada isian yang kosong' };
      }
      const insertMovement = await query(
        'INSERT INTO movement_stock (id, stock_id, jumlah_masuk, jumlah_keluar, user_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, NOW(), NOW())',
        [
          generateUUID(),
          body.stock_id,
          body.jumlah_masuk,
          body.jumlah_keluar,
          userCheck[0].id,
        ]
      );
      return {
        success: true,
        message: 'Movement stock berhasil ditambahkan',
        data: [
          userCheck[0].id,
          body.stock_id,
          body.jumlah_masuk,
          body.jumlah_keluar,
        ],
        timestamp: new Date(),
      };
    },
    {
      headers: t.Object({
        authorization: t.String(),
      }),
      body: t.Object({
        stock_id: t.String(),
        jumlah_masuk: t.Number(),
        jumlah_keluar: t.Number(),
      }),
    }
  );
