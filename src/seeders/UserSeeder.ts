import type { EntityManager } from '@mikro-orm/core';
import { Seeder } from '@mikro-orm/seeder';
import { User } from '../entities/User';

export class UserSeeder extends Seeder {
  async run(em: EntityManager) {
    const user = em.create(User, {
      name: 'Admin',
      email: 'admin@example.com',
      password: '123456',
      role: 'admin',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await em.persistAndFlush(user);

    console.log('✔ User seeding completed.');
  }
}
