import { Elysia } from 'elysia';
import { authMiddleware } from '../middlewares/authMiddleware';
import { User } from '../entities/User';
import { hashPassword, comparePassword } from '../utils/password';

export const userRoutes = new Elysia({ prefix: '/users' })
  .use(authMiddleware)
  .get('/', ({ user }) => {
    return {
      success: true,
      message: 'Akses berhasil',
      user,
    };
  })
  .get('/:id', async ({ orm, user, params }) => {
    const em = orm.em.fork();
    const existingUser = await em.findOne(User, { id: params.id }); // Menggunakan params.id
    if (user.id !== params.id && user.role !== 'admin') {
      return {
        success: false,
        message: 'Anda tidak memiliki izin untuk mengakses data pengguna ini',
      };
    }
    if (!existingUser) {
      return {
        success: false,
        message: 'Pengguna tidak ditemukan',
      };
    }
    return {
      success: true,
      message: 'Pengguna ditemukan',
      data: existingUser,
    };
  })
  .get('/profile', ({ user }) => {
    return {
      success: true,
      message: 'Data profil pengguna',
      data: {
        id: user.id,

        email: user.email,
        role: user.role,
      },
    };
  })
  .patch('/update-profile', async ({ orm, user, body }) => {
    const em = orm.em.fork();
    const existingUser = await em.findOne(User, { id: user.id });

    if (!existingUser) {
      return {
        success: false,
        message: 'Pengguna tidak ditemukan',
      };
    }
    existingUser.email = body.email ?? existingUser.email;
    await em.persistAndFlush(existingUser);
    return {
      success: true,
      message: 'Profil berhasil diperbarui',
      data: {
        id: existingUser.id,
        email: existingUser.email,
        role: existingUser.role,
      },
    };
  })
  .patch('/change-role', async ({ orm, user, body }) => {
    const em = orm.em.fork();
    const existingUser = await em.findOne(User, { id: body.userId });

    // Hanya admin yang bisa mengubah role
    if (user.role !== 'admin') {
      return {
        success: false,
        message: 'Anda tidak memiliki izin untuk mengubah role pengguna',
      };
    }

    if (!existingUser) {
      return {
        success: false,
        message: 'Pengguna tidak ditemukan',
      };
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
  })
  .patch('/change-password', async ({ orm, user, body }) => {
    const em = orm.em.fork();
    const existingUser = await em.findOne(User, { id: user.id });

    if (!existingUser) {
      return {
        success: false,
        message: 'Pengguna tidak ditemukan',
      };
    }

    const match = await comparePassword(
      body.oldPassword,
      existingUser.password
    );
    if (!match) {
      return {
        success: false,
        message: 'Password lama salah',
      };
    }

    existingUser.password = await hashPassword(body.newPassword);
    await em.persistAndFlush(existingUser);
    return {
      success: true,
      message: 'Password berhasil diperbarui',
    };
  })
  .delete('/delete-account/:id', async ({ orm, user, params }) => {
    const em = orm.em.fork();
    const targetId = String(params.id);

    // Jika bukan admin, tolak
    if (user.role !== 'admin') {
      return {
        success: false,
        message: 'Anda tidak memiliki izin untuk menghapus akun',
      };
    }

    // Admin tidak boleh menghapus dirinya sendiri
    if (user.id === targetId) {
      return {
        success: false,
        message: 'Anda tidak dapat menghapus akun Anda sendiri',
      };
    }

    const existingUser = await em.findOne(User, { id: targetId });

    if (!existingUser) {
      return {
        success: false,
        message: 'Pengguna tidak ditemukan',
      };
    }

    await em.removeAndFlush(existingUser);

    return {
      success: true,
      message: 'Akun berhasil dihapus',
    };
  });
