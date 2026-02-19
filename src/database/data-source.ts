import { DataSource, DataSourceOptions } from 'typeorm';
import { config } from 'dotenv';
import { join } from 'path';
import { databaseConfig } from '../config/database.config';

// Load environment variables
config();

// Get database configuration
const dbConfig = databaseConfig();

export const dataSourceOptions: DataSourceOptions = {
  type: dbConfig.type as any,
  host: dbConfig.host,
  port: dbConfig.port,
  username: dbConfig.username,
  password: dbConfig.password,
  database: dbConfig.name,
  synchronize: false, // Always false for migrations
  logging: dbConfig.logging,
  entities: [join(__dirname, '..', '**', '*.entity{.ts,.js}')],
  migrations: [join(__dirname, 'migrations', '*{.ts,.js}')],
  migrationsTableName: dbConfig.migrationsTableName,
  migrationsRun: dbConfig.migrationsRun,
};

const dataSource = new DataSource(dataSourceOptions);

export default dataSource;
