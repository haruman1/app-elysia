import type { EntityManager } from '@mikro-orm/core';
import { Seeder } from '@mikro-orm/seeder';
import { User } from '../entities/User';

export class UserSeeder extends Seeder {
  async run(em: EntityManager) {
    const user = em.create(User, {
      name: 'Admin',
      email: 'admin@example.com',
      password: '123456',
      role: 'user',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    const checkUser = await em.findOne(user, { email: user.email });
    if (!checkUser) {
      console.log(
        'Sudah ada yang sama dengan nama nya, jangan lakukan seeder kembali'
      );
    }

    await em.persistAndFlush(user);

    console.log('✔ User seeding completed.');
  }
}
