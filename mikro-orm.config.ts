// mikro-orm.config.ts
import 'dotenv/config';
import { defineConfig } from '@mikro-orm/mysql';
export default defineConfig({
  dbName: process.env.DB_DATABASE,
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT ?? '3306', 10),
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  entities: ['./src/entities/**/*.ts'],
  entitiesTs: ['./src/entities/**/*.ts'],
  migrations: {
    path: './src/migrations',
  },
  seeder: {
    path: './src/seeders',
    defaultSeeder: 'DatabaseSeeder',
  },
  debug: true,
});
//   port: parseInt(process.env.DB_PORT ?? '3306', 10),
//   user: process.env.DB_USERNAME, // 👀 use a dedicated user in prod
//   password: process.env.DB_PASSWORD, // prefer using env variables for sensitive info
//   dbName: process.env.DB_DATABASE,

//   // ---------- Entities ----------
//   entities: ['./src/entities/**/*.ts'], // or use glob: ['./src/entities/**/*.ts']
//   entitiesTs: ['./src/entities/**/*.ts'], // needed only for TS‑only projects
//   // entitiesTs: ['./src/entities/**/*.ts'], // needed only for TS‑only projects

//   // ---------- Migrations ----------
//   migrations: {
//     path: './src/migrations', // folder where migration files live
//   },

//   // ---------- Seeder ----------
//   seeder: {
//     path: './src/seeders',
//     defaultSeeder: 'DatabaseSeeder',
//   },

//   // ---------- Misc ----------
//   debug: true, // nice console logs while developing
// } as Options;

// export default config;
