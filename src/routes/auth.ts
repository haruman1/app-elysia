import { Elysia, t } from 'elysia';
import { User } from '../entities/User';

export const AuthRoutes = new Elysia({ prefix: '/auth' }).post(
  '/sign-in',
  async ({ orm, body }) => {
    const em = orm.em.fork();
    const user = await em.findOne(User, { email: body.email });

    if (!user || user.password !== body.password) {
      return {
        success: false,
        message: 'Email atau password salah',
      };
    }

    return {
      success: true,
      message: 'Login berhasil',
      data: user,
    };
  },
  {
    body: t.Object({
      email: t.String(),
      password: t.String(),
    }),
  }
);
