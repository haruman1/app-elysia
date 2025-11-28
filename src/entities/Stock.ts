import {
  Collection,
  Entity,
  FloatType,
  ManyToOne,
  OneToMany,
  PrimaryKey,
  Property,
} from '@mikro-orm/core';
import { v4 } from 'uuid';
import { User } from './User';
import { MovementStock } from './MovementStock';
@Entity()
export class Stock {
  // Define properties and methods for the Stock entity here
  @PrimaryKey({ type: 'uuid' })
  id: string = v4();

  @Property()
  namaProduk!: string;

  @Property({ type: FloatType })
  jumlahProduk!: number;

  @Property({ type: FloatType })
  hargaProduk!: number;

  @ManyToOne(() => User)
  user!: User;

  @Property({ type: 'date' })
  createdAt: Date = new Date();

  @Property({ type: 'date', onUpdate: () => new Date() })
  updatedAt: Date = new Date();

  @Property({ type: 'date', nullable: true })
  deletedAt?: Date;

  @OneToMany(() => MovementStock, (movementStock) => movementStock.stocks)
  movementStocks = new Collection<MovementStock>(this);
}
