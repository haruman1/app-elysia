import { EntityManager } from '@mikro-orm/core';
import { UserSeeder } from './UserSeeder';
import { StockSeeder } from './StockSeeder';

export class DatabaseSeeder {
  async run(em: EntityManager): Promise<void> {
    const userSeeder = new UserSeeder();
    const stockSeeder = new StockSeeder();

    await userSeeder.run(em);
    await stockSeeder.run(em);
  }
}
