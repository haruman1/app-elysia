import {
  Collection,
  Entity,
  ManyToOne,
  PrimaryKey,
  Property,
} from '@mikro-orm/core';
import { v4 } from 'uuid';
import { Stock } from './Stock';

@Entity()
export class MovementStock {
  @PrimaryKey({ type: 'uuid' })
  id: string = v4();

  @ManyToOne(() => Stock)
  stocks = new Collection<Stock>(this);
  @Property()
  movementType!: string; // e.g., 'in' or 'out'

  @Property()
  quantity!: number;

  @Property({ type: 'date' })
  createdAt: Date = new Date();

  @Property({ type: 'date', onUpdate: () => new Date() })
  updatedAt: Date = new Date();

  @Property({ type: 'date', nullable: true })
  deletedAt?: Date;
}
