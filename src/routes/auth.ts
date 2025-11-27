import { Elysia, t } from 'elysia';
import { User } from '../entities/User';
import { hashPassword, comparePassword } from '../utils/password';
import { query } from '../../mysql.config';

export const authRoutes = new Elysia({ prefix: '/auth' })
  .get('/users', async () => {
    const users = await query('SELECT * FROM user');
    return {
      success: true,
      data: users,
    };
  })
  .post(
    '/register',
    async ({ body }) => {
      const { name, email, password, role } = body;
      const existingUser = await query('SELECT * FROM user WHERE email = ?', [
        email,
      ]);
      if (existingUser.length > 0) {
        return { success: false, message: 'Email sudah terdaftar' };
      }

      const hashed = await hashPassword(password);
      const user = await query(
        'INSERT INTO user (name, email, password, role) VALUES (?, ?, ?, ?)',
        [name, email, hashed, role]
      );
      return {
        success: true,
        message: 'Registrasi berhasil, silakan login',
        data: user,
      };
    },
    {
      body: t.Object({
        name: t.String(),
        email: t.String(),
        password: t.String(),
        role: t.Optional(t.String()),
      }),
    }
  )
  .post(
    '/sign-in',
    async ({ body, jwt }) => {
      const { email, password } = body;
      const users = await query('SELECT * FROM user WHERE email = ?', [email]);
      const user = users[0];
      if (!user) {
        return { success: false, message: 'Email tidak ditemukan' };
      }

      const match = await comparePassword(password, user.password);
      if (!match) {
        return { success: false, message: 'Password salah' };
      }
      const token = await jwt.sign({
        id: user.id,
        email: user.email,
        role: user.role,
      });
      return {
        success: true,
        message: 'Login berhasil',
        token,
      };
    },
    {
      body: t.Object({
        email: t.String(),
        password: t.String(),
      }),
    }
  );
// // REGISTER
// .post(
//   '/register',
//   async ({ orm, body }) => {
//     const em = orm.em.fork();

//     const exist = await em.findOne(User, { email: body.email });
//     if (exist) {
//       return { success: false, message: 'Email sudah terdaftar' };
//     }

//     const hashed = await hashPassword(body.password);

//     const user = em.create(User, {
//       name: body.name,
//       email: body.email,
//       password: hashed,
//       role: body.role ?? 'user',
//     });

//     await em.persistAndFlush(user);

//     return {
//       success: true,
//       message: 'Registrasi berhasil',
//       data: {
//         id: user.id,
//         name: user.name,
//         email: user.email,
//       },
//     };
//   },
//   {
//     body: t.Object({
//       name: t.String(),
//       email: t.String(),
//       password: t.String(),
//       role: t.Optional(t.String()),
//     }),
//   }
// )

// // SIGN-IN → Generate JWT berdasarkan data database
// .post(
//   '/sign-in',
//   async ({ orm, body, jwt }) => {
//     const em = orm.em.fork();
//     const user = await em.findOne(User, { email: body.email });

//     if (!user) {
//       return { success: false, message: 'Email tidak ditemukan' };
//     }

//     const match = await comparePassword(body.password, user.password);
//     if (!match) {
//       return { success: false, message: 'Password salah' };
//     }

//     const token = await jwt.sign({
//       id: user.id,
//       email: user.email,
//       role: user.role,
//     });
//     console.log('Payload:', token);
//     return {
//       success: true,
//       message: 'Login berhasil',
//       token,
//     };
//   },
//   {
//     body: t.Object({
//       email: t.String(),
//       password: t.String(),
//     }),
//   }
// );
