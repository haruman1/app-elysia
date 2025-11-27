import { Elysia, t } from 'elysia';
import { authMiddleware } from '../middlewares/authMiddleware';
import { User } from '../entities/User';
import { hashPassword, comparePassword } from '../utils/password';

export const userRoutes = new Elysia({ prefix: '/users' })
  .use(authMiddleware)

  // GET ALL (check auth)
  .get('/', ({ user }) => ({
    success: true,
    message: 'Akses berhasil',
    user,
  }))

  // GET USER BY ID (admin atau diri sendiri)
  .get('/:id', async ({ orm, user, params }) => {
    const em = orm.em.fork();

    if (user.id !== params.id && user.role !== 'admin') {
      return { success: false, message: 'Unauthorized access' };
    }

    const existingUser = await em.findOne(User, { id: params.id });
    if (!existingUser) {
      return { success: false, message: 'Pengguna tidak ditemukan' };
    }

    return {
      success: true,
      message: 'Pengguna ditemukan',
      data: existingUser,
    };
  })

  // GET PROFILE
  .get(
    '/profile',
    ({ user }) => ({
      success: true,
      message: 'Data profil pengguna',
      data: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    }),
    {
      headers: t.Object({
        authorization: t.String(),
      }),
    }
  )

  // UPDATE PROFILE
  .patch(
    '/update-profile',
    async ({ orm, user, body }) => {
      const em = orm.em.fork();
      const email = body.email?.trim();

      const existingUser = await em.findOne(User, { id: user.id });
      if (!existingUser) {
        return { success: false, message: 'Pengguna tidak ditemukan' };
      }

      // Cek email sudah dipakai
      if (email && email !== user.email) {
        const emailTaken = await em.findOne(User, { email });
        if (emailTaken && emailTaken.id !== user.id) {
          return { success: false, message: 'Email sudah digunakan' };
        }
      }

      // Only allowed fields
      const allowedUpdates = ['email', 'name'];

      for (const field of allowedUpdates) {
        if (body[field] !== undefined) {
          existingUser[field] = body[field];
        }
      }

      await em.persistAndFlush(existingUser);

      return {
        success: true,
        message: 'Profil berhasil diperbarui',
        data: {
          email: existingUser.email,
          name: existingUser.name,
          role: existingUser.role,
        },
      };
    },
    {
      headers: t.Object({
        authorization: t.String(),
      }),
      body: t.Object({
        email: t.Optional(t.String()),
        name: t.Optional(t.String()),
      }),
    }
  )

  // ADMIN CHANGE ROLE
  .patch(
    '/change-role',
    async ({ orm, user, body }) => {
      if (user.role !== 'admin') {
        return { success: false, message: 'Unauthorized access' };
      }

      const em = orm.em.fork();
      const existingUser = await em.findOne(User, { id: body.userId });

      if (!existingUser) {
        return { success: false, message: 'Pengguna tidak ditemukan' };
      }

      existingUser.role = body.role ?? existingUser.role;
      await em.persistAndFlush(existingUser);

      return {
        success: true,
        message: 'Role berhasil diperbarui',
        data: {
          id: existingUser.id,
          email: existingUser.email,
          role: existingUser.role,
        },
      };
    },
    {
      headers: t.Object({
        authorization: t.String(),
      }),
      body: t.Object({
        userId: t.String(),
        role: t.String(),
      }),
    }
  )

  // CHANGE PASSWORD
  .patch(
    '/change-password',
    async ({ orm, user, body }) => {
      const em = orm.em.fork();
      const existingUser = await em.findOne(User, { id: user.id });

      if (!existingUser) {
        return { success: false, message: 'Pengguna tidak ditemukan' };
      }

      const match = await comparePassword(
        body.oldPassword,
        existingUser.password
      );
      if (!match) {
        return { success: false, message: 'Password lama salah' };
      }

      existingUser.password = await hashPassword(body.newPassword);
      await em.persistAndFlush(existingUser);

      return {
        success: true,
        message: 'Password berhasil diperbarui',
      };
    },
    {
      body: t.Object({
        oldPassword: t.String(),
        newPassword: t.String(),
      }),
      headers: t.Object({
        authorization: t.String(),
      }),
    }
  )

  // DELETE ACCOUNT (admin only)
  .delete(
    '/delete-account/:id',
    async ({ orm, user, params }) => {
      const em = orm.em.fork();
      const targetId = String(params.id);

      if (user.role !== 'admin') {
        return { success: false, message: 'Unauthorized access' };
      }

      if (user.id === targetId) {
        return {
          success: false,
          message: 'Admin tidak boleh hapus dirinya sendiri',
        };
      }

      const existingUser = await em.findOne(User, { id: targetId });
      if (!existingUser) {
        return { success: false, message: 'Pengguna tidak ditemukan' };
      }

      await em.removeAndFlush(existingUser);

      return { success: true, message: 'Akun berhasil dihapus' };
    },
    {
      headers: t.Object({
        authorization: t.String(),
      }),
      params: t.Object({
        id: t.String(),
      }),
    }
  );
