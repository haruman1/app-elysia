import { Migration } from '@mikro-orm/migrations';

export class Migration20251126042611 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table \`user\` (\`id\` varchar(36) not null, \`name\` varchar(255) not null, \`email\` varchar(255) not null, \`password\` varchar(255) not null, \`role\` varchar(255) not null, \`created_at\` date not null, \`updated_at\` date not null, \`deleted_at\` date null, primary key (\`id\`)) default character set utf8mb4 engine = InnoDB;`);

    this.addSql(`create table \`stock\` (\`id\` varchar(36) not null, \`nama_produk\` varchar(255) not null, \`jumlah_produk\` float not null, \`harga_produk\` float not null, \`user_id\` varchar(36) not null, \`created_at\` date not null, \`updated_at\` date not null, \`deleted_at\` date null, primary key (\`id\`)) default character set utf8mb4 engine = InnoDB;`);
    this.addSql(`alter table \`stock\` add index \`stock_user_id_index\`(\`user_id\`);`);

    this.addSql(`create table \`movement_stock\` (\`id\` varchar(36) not null, \`stocks_id\` varchar(36) not null, \`movement_type\` varchar(255) not null, \`quantity\` int not null, \`created_at\` date not null, \`updated_at\` date not null, \`deleted_at\` date null, primary key (\`id\`)) default character set utf8mb4 engine = InnoDB;`);
    this.addSql(`alter table \`movement_stock\` add index \`movement_stock_stocks_id_index\`(\`stocks_id\`);`);

    this.addSql(`alter table \`stock\` add constraint \`stock_user_id_foreign\` foreign key (\`user_id\`) references \`user\` (\`id\`) on update cascade;`);

    this.addSql(`alter table \`movement_stock\` add constraint \`movement_stock_stocks_id_foreign\` foreign key (\`stocks_id\`) references \`stock\` (\`id\`) on update cascade;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table \`stock\` drop foreign key \`stock_user_id_foreign\`;`);

    this.addSql(`alter table \`movement_stock\` drop foreign key \`movement_stock_stocks_id_foreign\`;`);

    this.addSql(`drop table if exists \`user\`;`);

    this.addSql(`drop table if exists \`stock\`;`);

    this.addSql(`drop table if exists \`movement_stock\`;`);
  }

}
