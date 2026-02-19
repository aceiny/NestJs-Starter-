import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigType } from '@nestjs/config';
import { databaseConfig } from '../config';
import { dataSourceOptions } from './data-source';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [databaseConfig.KEY],
      useFactory: (config: ConfigType<typeof databaseConfig>) => ({
        type: config.type as any,
        host: config.host,
        port: config.port,
        username: config.username,
        password: config.password,
        database: config.name,
        synchronize: config.synchronize,
        logging: config.logging,
        entities: [__dirname + '/../**/*.entity{.ts,.js}'],
        migrations: dataSourceOptions.migrations,
        migrationsTableName: config.migrationsTableName,
        migrationsRun: config.migrationsRun,
      }),
    }),
  ],
})
export class DatabaseModule {}