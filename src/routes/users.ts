import { Elysia, t } from 'elysia';
import { authMiddleware } from '../middlewares/authMiddleware';
import { User } from '../entities/User';
import { hashPassword, comparePassword } from '../utils/password';
import { query } from '../../mysql.config';

export const userRoutes = new Elysia({ prefix: '/users' })
  .use(authMiddleware)
  .get(
    '/:id',
    async ({ user, params }) => {
      const id = String(params.id).trim();

      if (user.id !== params.id && user.role !== 'admin') {
        return { success: false, message: 'Anda bukan admin' };
      }
      const terdaftar = await query(
        'SELECT id, name, email FROM user WHERE id = ?',
        [id]
      );
      const daftar = terdaftar[0];
      if (!daftar) {
        return { success: false, message: 'Unauthorized access' };
      }
      return {
        success: true,
        message: 'Ini adalah user yang anda cari',
        data: daftar,
      };
    },
    {
      headers: t.Object({
        authorization: t.String(),
      }),
      body: t.Object({
        userId: t.String(),
      }),
    }
  )
  .get(
    '/profile/:id',
    ({ user, params }) => {
      const id = String(params.id).trim();
      if (!user) {
        return { success: false, message: 'Unauthorized access' };
      }
      if (user.id !== id) {
        return { success: false, message: 'Unauthorized access' };
      }

      return {
        success: true,
        message: 'Data profil pengguna',
        data: {
          id: user.id,
          email: user.email,
          role: user.role,
        },
      };
    },
    {
      headers: t.Object({
        authorization: t.String(),
      }),
    }
  )
  .patch(
    'profile/:id',
    async ({ user, params, body }) => {
      const id = String(params.id).trim();
      const email = body.email?.trim();
      if (!user) {
        return { success: false, message: 'Unauthorized access' };
      }
      if (user.id !== id) {
        return { success: false, message: 'Unauthorized access' };
      }
      // Cek email sudah dipakai
      if (email && email !== user.email) {
        const emailTaken = await query('SELECT id FROM user WHERE email = ?', [
          email,
        ]);
        if (emailTaken.length > 0) {
          return {
            success: false,
            message: 'Email sudah digunakan, gunakan email lain',
          };
        }
      }
      // Only allowed fields
      const allowedUpdates = ['email', 'name'];
      const updates: any = {};
      for (const field of allowedUpdates) {
        if (body[field as keyof typeof body] !== undefined) {
          updates[field] = body[field as keyof typeof body];
        }
      }

      const setClause = Object.keys(updates)
        .map((key) => `${key} = ?`)
        .join(', ');
      const values = Object.values(updates);

      await query(`UPDATE user SET ${setClause} WHERE id = ?`, [...values, id]);
      return { success: true, message: 'Profile berhasil diupdate' };
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
  .patch(
    '/change-password/:id',
    async ({ user, params, body }) => {
      const id = String(params.id).trim();
      const passwordOld = String(body.oldPassword).trim();
      const passwordNew = String(body.newPassword).trim();
      const regextPassword =
        /^(?=.{8,20}$)(?=.*\p{L})(?=.*\p{N})(?!.*\p{Emoji}).+$/u;

      if (!regextPassword.test(passwordNew)) {
        return {
          success: false,
          message:
            'Password harus minimal 8 karakter, mengandung huruf dan angka',
        };
      }
      if (!user) {
        return { success: false, message: 'Unauthorized access' };
      }
      if (user.id !== id) {
        return { success: false, message: 'Unauthorized access' };
      }
      const existingUserResult = await query(
        'SELECT password FROM user WHERE id = ?',
        [id]
      );
      if (existingUserResult.length === 0) {
        return { success: false, message: 'Pengguna tidak ditemukan' };
      }
      const existingUser = existingUserResult[0];

      const match = await comparePassword(passwordOld, existingUser.password);
      if (!match) {
        return { success: false, message: 'Password lama salah' };
      }

      const hashed = await hashPassword(passwordNew);
      await query('UPDATE user SET password = ? WHERE id = ?', [hashed, id]);
      return { success: true, message: 'Password berhasil diubah' };
    },
    {
      headers: t.Object({
        authorization: t.String(),
      }),
      body: t.Object({
        oldPassword: t.String(),
        newPassword: t.String(),
      }),
    }
  )
  .patch(
    '/change-role',
    async ({ user, body }) => {
      if (user.role !== 'admin') {
        return { success: false, message: 'Anda bukan admin' };
      }
      const userId = String(body.userId).trim();
      const role = String(body.role).trim();
      const existingUserResult = await query(
        'SELECT role FROM user WHERE id = ?',
        [userId]
      );
      if (existingUserResult.length === 0) {
        return { success: false, message: 'Pengguna tidak ditemukan' };
      }
      const existingUser = existingUserResult[0];
      if (existingUser.role === 'admin') {
        return { success: false, message: 'Tidak bisa merubah role admin' };
      }
      await query('UPDATE user SET role = ? WHERE id = ?', [role, userId]);
      return { success: true, message: 'Role berhasil diubah' };
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
  .delete(
    '/delete-account/:id',
    async ({ user, params }) => {
      const targetId = String(params.id).trim();
      if (user.role !== 'admin') {
        return { success: false, message: 'Anda bukan admin' };
      }
      const existingUserResult = await query(
        'SELECT name, email, role FROM user WHERE id = ?',
        [targetId]
      );
      if (existingUserResult.length === 0) {
        return { success: false, message: 'Pengguna tidak ditemukan' };
      }
      if (user.id === targetId) {
        return {
          success: false,
          message: 'Admin tidak boleh menghapus dirinya sendiri',
        };
      }
      const existingUser = existingUserResult[0];
      if (existingUser.role === 'admin') {
        return { success: false, message: 'Tidak bisa menghapus admin' };
      }
      await query('DELETE FROM user WHERE id = ?', [targetId]);
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
// // GET ALL (check auth)
// .get('/', ({ user }) => ({
//   success: true,
//   message: 'Akses berhasil',
//   user,
// }))

// // GET USER BY ID (admin atau diri sendiri)
// .get('/:id', async ({ orm, user, params }) => {
//   const em = orm.em.fork();

//   if (user.id !== params.id && user.role !== 'admin') {
//     return { success: false, message: 'Unauthorized access' };
//   }

//   const existingUser = await em.findOne(User, { id: params.id });
//   if (!existingUser) {
//     return { success: false, message: 'Pengguna tidak ditemukan' };
//   }

//   return {
//     success: true,
//     message: 'Pengguna ditemukan',
//     data: existingUser,
//   };
// })

// // GET PROFILE
// .get(
//   '/profile',
//   ({ user }) => ({
//     success: true,
//     message: 'Data profil pengguna',
//     data: {
//       id: user.id,
//       email: user.email,
//       role: user.role,
//     },
//   }),
//   {
//     headers: t.Object({
//       authorization: t.String(),
//     }),
//   }
// )

// // UPDATE PROFILE
// .patch(
//   '/update-profile',
//   async ({ orm, user, body }) => {
//     const em = orm.em.fork();
//     const email = body.email?.trim();

//     const existingUser = await em.findOne(User, { id: user.id });
//     if (!existingUser) {
//       return { success: false, message: 'Pengguna tidak ditemukan' };
//     }

//     // Cek email sudah dipakai
//     if (email && email !== user.email) {
//       const emailTaken = await em.findOne(User, { email });
//       if (emailTaken && emailTaken.id !== user.id) {
//         return { success: false, message: 'Email sudah digunakan' };
//       }
//     }

//     // Only allowed fields
//     const allowedUpdates = ['email', 'name'];

//     for (const field of allowedUpdates) {
//       if (body[field] !== undefined) {
//         existingUser[field] = body[field];
//       }
//     }

//     await em.persistAndFlush(existingUser);

//     return {
//       success: true,
//       message: 'Profil berhasil diperbarui',
//       data: {
//         email: existingUser.email,
//         name: existingUser.name,
//         role: existingUser.role,
//       },
//     };
//   },
//   {
//     headers: t.Object({
//       authorization: t.String(),
//     }),
//     body: t.Object({
//       email: t.Optional(t.String()),
//       name: t.Optional(t.String()),
//     }),
//   }
// )

// // ADMIN CHANGE ROLE
// .patch(
//   '/change-role',
//   async ({ orm, user, body }) => {
//     if (user.role !== 'admin') {
//       return { success: false, message: 'Unauthorized access' };
//     }

//     const em = orm.em.fork();
//     const existingUser = await em.findOne(User, { id: body.userId });

//     if (!existingUser) {
//       return { success: false, message: 'Pengguna tidak ditemukan' };
//     }

//     existingUser.role = body.role ?? existingUser.role;
//     await em.persistAndFlush(existingUser);

//     return {
//       success: true,
//       message: 'Role berhasil diperbarui',
//       data: {
//         id: existingUser.id,
//         email: existingUser.email,
//         role: existingUser.role,
//       },
//     };
//   },
//   {
//     headers: t.Object({
//       authorization: t.String(),
//     }),
//     body: t.Object({
//       userId: t.String(),
//       role: t.String(),
//     }),
//   }
// )

// // CHANGE PASSWORD
// .patch(
//   '/change-password',
//   async ({ orm, user, body }) => {
//     const em = orm.em.fork();
//     const existingUser = await em.findOne(User, { id: user.id });

//     if (!existingUser) {
//       return { success: false, message: 'Pengguna tidak ditemukan' };
//     }

//     const match = await comparePassword(
//       body.oldPassword,
//       existingUser.password
//     );
//     if (!match) {
//       return { success: false, message: 'Password lama salah' };
//     }

//     existingUser.password = await hashPassword(body.newPassword);
//     await em.persistAndFlush(existingUser);

//     return {
//       success: true,
//       message: 'Password berhasil diperbarui',
//     };
//   },
//   {
//     body: t.Object({
//       oldPassword: t.String(),
//       newPassword: t.String(),
//     }),
//     headers: t.Object({
//       authorization: t.String(),
//     }),
//   }
// )

// // DELETE ACCOUNT (admin only)
// .delete(
//   '/delete-account/:id',
//   async ({ orm, user, params }) => {
//     const em = orm.em.fork();
//     const targetId = String(params.id);

//     if (user.role !== 'admin') {
//       return { success: false, message: 'Unauthorized access' };
//     }

//     if (user.id === targetId) {
//       return {
//         success: false,
//         message: 'Admin tidak boleh hapus dirinya sendiri',
//       };
//     }

//     const existingUser = await em.findOne(User, { id: targetId });
//     if (!existingUser) {
//       return { success: false, message: 'Pengguna tidak ditemukan' };
//     }

//     await em.removeAndFlush(existingUser);

//     return { success: true, message: 'Akun berhasil dihapus' };
//   },
//   {
//     headers: t.Object({
//       authorization: t.String(),
//     }),
//     params: t.Object({
//       id: t.String(),
//     }),
//   }
// );
