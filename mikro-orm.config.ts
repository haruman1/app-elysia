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
