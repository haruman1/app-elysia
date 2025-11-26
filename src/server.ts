// // src/server.ts
// import { Elysia, t } from 'elysia';
// import { MikroORM } from '@mikro-orm/core';
// import mikroConfig from '../mikro-orm.config';
// import { User } from './entities/User';
// import { DatabaseSeeder } from './seeders/DatabaseSeeder';
// import { errorHandler } from './middlewares/errorHandler';
// import openapi from '@elysiajs/openapi';

// async function bootstrap() {
//   // 1️⃣ Initialise Mikro‑ORM (creates connection pool)
//   const orm = await MikroORM.init(mikroConfig);

//   // 2️⃣ Run pending migrations (creates/updates tables)

//   if (process.env.NODE_ENV !== 'production') {
//     console.log('Running in development mode, seeding database...');
//   }
//   // 3️⃣ Seed initial data (optional)

//   // 4️⃣ Build the Elysia app
//   const app = new Elysia()
//     // expose the ORM instance to every handler via context
//     .decorate('orm', orm)

//     // ---------- Routes ----------
//     .get('/', () => '🦊 Elysia + Mikro‑ORM (MySQL) is up!')

//     // GET /users → returns all rows
//     .get('/users', async ({ orm }) => {
//       const em = orm.em.fork();
//       const users = await em.find(User, {}); // [] if none
//       return users;
//     })

//     // POST /users → create a new user (simple JSON body)
//     .post(
//       '/users',
//       async ({ orm, body }) => {
//         const em = orm.em.fork();

//         const user = em.create(User, {
//           ...body,
//           createdAt: new Date(),
//           updatedAt: new Date(),
//         });

//         await em.persistAndFlush(user);

//         return {
//           success: true,
//           data: user,
//           message: 'User berhasil dibuat',
//         };
//       },
//       {
//         body: t.Object({
//           email: t.String(),
//           password: t.String(),
//           name: t.String(),
//           role: t.Union([t.Literal('admin'), t.Literal('user')]),
//         }),
//       }
//     )

//     .use(openapi()) // ---------- Lifecycle ----------
//     // close DB connection on server shutdown (nice cleanup)
//     .onStop(async () => {
//       await orm.close(true);
//     })
//     // IMPORTANT!// ---------- Listen ----------
//     .listen(3000, () => {
//       console.log('🚀 Server listening at http://localhost:3000');
//     });
// }

// bootstrap().catch((e) => {
//   console.error('❌ Bootstrap error:', e);
//   process.exit(1);
// });
import { Elysia } from 'elysia';
import { MikroORM } from '@mikro-orm/core';
import mikroConfig from '../mikro-orm.config';
import { jwt } from '@elysiajs/jwt';

import { authRoutes } from './routes/auth';
import { userRoutes } from './routes/users';
import openapi from '@elysiajs/openapi';

async function bootstrap() {
  const orm = await MikroORM.init(mikroConfig);

  const app = new Elysia()
    .decorate('orm', orm)

    .use(
      jwt({
        name: 'jwt',
        secret: Bun.env.JWT_SECRET!,
        exp: '2h',
      })
    )
    .use(openapi())
    .use(authRoutes)
    .use(userRoutes)

    .listen(3000);

  console.log('🚀 Running at http://localhost:3000');
}

bootstrap();
