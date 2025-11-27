import { EntityManager } from '@mikro-orm/core';
import { Stock } from '../entities/Stock';
import { User } from '../entities/User';

export class StockSeeder {
  async run(em: EntityManager) {
    // Ambil admin pertama
    const admin = await em.findOne(User, { email: 'admin@example.com' });

    if (!admin) {
      console.log('User admin tidak ditemukan! Jalankan UserSeeder dulu.');
      return;
    }

    const stock1 = em.create(Stock, {
      namaProduk: 'Teh Pucuk',
      jumlahProduk: 20,
      hargaProduk: 5000,
      user: admin,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const stock2 = em.create(Stock, {
      namaProduk: 'Aqua Botol',
      jumlahProduk: 30,
      hargaProduk: 4000,
      user: admin,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await em.persistAndFlush([stock1, stock2]);

    console.log('✔ Stock seeder selesai.');
  }
}
