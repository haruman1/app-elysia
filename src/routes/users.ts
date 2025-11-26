import { Elysia } from 'elysia';
import { authMiddleware } from '../middlewares/auth';

export const userRoutes = new Elysia({ prefix: '/users' })
  .use(authMiddleware)
  .get('/', ({ user }) => {
    return {
      success: true,
      message: 'Akses berhasil',
      user,
    };
  });
