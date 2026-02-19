# TypeORM Database Migrations Guide

## Overview

Database migrations are a version control system for your database schema. This guide covers implementing and managing TypeORM migrations in NestJS applications, providing a reliable approach to evolving your database structure across different environments.

Migrations allow you to:
- Track database schema changes over time
- Apply and revert changes in a controlled manner
- Maintain consistency across development, staging, and production environments
- Collaborate effectively with team members on database changes

## Prerequisites

- NestJS application with TypeORM configured
- TypeScript and ts-node installed
- Database connection established
- Entities defined using TypeORM decorators

## Available Commands

The following npm scripts provide full control over your migration lifecycle:

```bash
# Generate a migration automatically from entity changes
npm run migration:generate -- src/database/migrations/MigrationName

# Create an empty migration file for manual editing
npm run migration:create -- src/database/migrations/MigrationName

# Execute all pending migrations
npm run migration:run

# Revert the most recently executed migration
npm run migration:revert

# Display the status of all migrations
npm run migration:show
```

## Development Workflow

### Step 1: Define or Modify Entities

Begin by creating or updating your TypeORM entity classes. Entities represent your database tables and define the schema structure:

```typescript
// Example: src/modules/user/entities/user.entity.ts
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 255 })
  email: string;

  @Column({ length: 100 })
  name: string;

  @CreateDateColumn()
  createdAt: Date;
}
```

### Step 2: Generate Migration from Changes

After modifying your entities, generate a migration that captures the differences between your entity definitions and the current database schema:

```bash
npm run migration:generate -- src/database/migrations/CreateUsersTable
```

**What happens:**
- TypeORM compares your entity schemas with the actual database structure
- Automatically generates SQL statements for the changes
- Creates a timestamped migration file with both `up()` and `down()` methods
- Places the file in your migrations directory

**Naming conventions:** Use descriptive, action-oriented names:
- `CreateUsersTable`
- `AddEmailIndexToUsers`
- `AddRoleColumnToUsers`
- `CreateOrdersTableWithRelations`

### Step 3: Review Generated Migration

**Critical:** Always inspect generated migrations before execution. Automated generation may not always produce optimal results for complex schema changes.

```typescript
// Example: src/database/migrations/1234567890123-CreateUsersTable.ts
import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUsersTable1234567890123 implements MigrationInterface {
  name = 'CreateUsersTable1234567890123';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "email" character varying(255) NOT NULL,
        "name" character varying(100) NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_users_email" UNIQUE ("email"),
        CONSTRAINT "PK_users" PRIMARY KEY ("id")
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "users"`);
  }
}
```

**Review checklist:**
- ✓ SQL syntax is correct for your database type
- ✓ Constraints and indexes are properly defined
- ✓ The `down()` method properly reverses the `up()` operation
- ✓ Data migrations preserve existing data
- ✓ Performance impact is acceptable for large tables

### Step 4: Execute Migrations

Apply all pending migrations to update your database schema:

```bash
npm run migration:run
```

**Output example:**
```
query: SELECT * FROM "migrations_history" "migrations_history"
query: BEGIN TRANSACTION
query: CREATE TABLE "users" (...)
query: INSERT INTO "migrations_history"("timestamp", "name") VALUES (...)
query: COMMIT
Migration CreateUsersTable1234567890123 has been executed successfully.
```

### Step 5: Rollback When Needed

If issues arise after applying a migration, revert to the previous state:

```bash
npm run migration:revert
```

This executes the `down()` method of the most recent migration, undoing its changes.

## Best Practices

### Recommended Approaches ✅

| Practice | Rationale |
|----------|-----------|
| **Always review generated migrations** | Automated generation may produce suboptimal or incorrect SQL |
| **Test migrations thoroughly in development** | Catch issues before they impact production |
| **Keep migrations atomic and focused** | Each migration should handle one logical change |
| **Write descriptive migration names** | Names should clearly indicate the purpose |
| **Commit migrations to version control** | Treat migrations as code—they should be versioned |
| **Execute migrations manually in production** | Avoid automatic execution for better control |
| **Backup databases before migrations** | Ensure you can recover from failures |
| **Document complex migrations** | Add comments explaining non-obvious logic |
| **Test rollback procedures** | Verify `down()` methods work correctly |

### Anti-Patterns to Avoid ❌

| Anti-Pattern | Consequence | Solution |
|--------------|-------------|----------|
| **Modifying executed migrations** | Breaks consistency across environments | Create a new migration instead |
| **Deleting migration files** | Lost history, potential data issues | Keep all migrations in version control |
| **Using `synchronize: true` with migrations** | Unpredictable schema changes | Always disable synchronize when using migrations |
| **Auto-running migrations in production** | Risk of data loss without review | Use manual execution with proper safeguards |
| **Skipping migrations** | Schema inconsistencies | Always run migrations sequentially |
| **Large, monolithic migrations** | Difficult to debug and revert | Break into smaller, logical units |
| **Missing `down()` implementations** | Cannot rollback if issues arise | Always implement proper rollback logic |

## Advanced Migration Techniques

### Manual Migration Creation

For complex schema changes, custom data transformations, or when you need precise control over the SQL, create an empty migration file:

```bash
npm run migration:create -- src/database/migrations/AddCustomIndexesAndContraints
```

Then implement your custom logic:

```typescript
import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCustomIndexesAndConstraints1234567890123 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create indexes for better query performance
    await queryRunner.query(`
      CREATE INDEX "IDX_users_email" ON "users" ("email");
    `);
    
    await queryRunner.query(`
      CREATE INDEX "IDX_users_created_at" ON "users" ("createdAt");
    `);
    
    // Add a check constraint
    await queryRunner.query(`
      ALTER TABLE "users" 
      ADD CONSTRAINT "CHK_users_email_format" 
      CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$');
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove in reverse order
    await queryRunner.query(`
      ALTER TABLE "users" DROP CONSTRAINT "CHK_users_email_format";
    `);
    
    await queryRunner.query(`DROP INDEX "IDX_users_created_at"`);
    await queryRunner.query(`DROP INDEX "IDX_users_email"`);
  }
}
```

### Data Migrations

When migrations involve data transformations, use transactions and handle errors appropriately:

```typescript
import { MigrationInterface, QueryRunner } from 'typeorm';

export class MigrateUserEmailsToLowercase1234567890123 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Update existing data
    await queryRunner.query(`
      UPDATE "users" 
      SET "email" = LOWER("email") 
      WHERE "email" != LOWER("email");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Note: This is a lossy operation, original casing cannot be restored
    // Document this limitation in production deployment notes
    console.warn('Warning: Original email casing cannot be restored');
  }
}
```

## Configuration

### Environment Variables

Configure your application's database connection and migration behavior through environment variables:

```env
# Database connection
DB_TYPE=postgres                    # Database type: postgres, mysql, mariadb
DB_HOST=localhost                   # Database host
DB_PORT=5432                        # Database port
DB_USERNAME=your_username           # Database user
DB_PASSWORD=your_password           # Database password
DB_NAME=your_database               # Database name

# Migration settings
DB_SYNCHRONIZE=false                # CRITICAL: Must be false when using migrations
DB_LOGGING=true                     # Enable query logging (helpful for debugging)
DB_MIGRATIONS_RUN=false             # Auto-run migrations on startup (false recommended)
DB_MIGRATIONS_TABLE_NAME=migrations_history  # Table to track executed migrations
```

**Important configuration notes:**
- **`DB_SYNCHRONIZE`**: Must always be `false` in production and when using migrations
- **`DB_MIGRATIONS_RUN`**: Set to `false` for production; manual execution is safer
- **`DB_LOGGING`**: Enable in development for visibility, consider disabling in production

### Data Source Configuration

The TypeORM CLI requires a data source configuration file that defines how to connect to your database:

**Location:** `src/database/data-source.ts`

```typescript
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
  synchronize: false,                // Always false for migrations
  logging: dbConfig.logging,
  entities: [join(__dirname, '..', '**', '*.entity{.ts,.js}')],
  migrations: [join(__dirname, 'migrations', '*{.ts,.js}')],
  migrationsTableName: dbConfig.migrationsTableName,
  migrationsRun: false,              // Managed manually
};

const dataSource = new DataSource(dataSourceOptions);

export default dataSource;
```

### Migration Storage

By default, migrations are stored in: `src/database/migrations/`

This location can be customized in your data source configuration by modifying the `migrations` array.

## Troubleshooting

### Common Issues and Solutions

#### Issue: Migration Already Executed

**Symptom:** Error indicating migration has already been run

**Solution:**
```bash
# Check migration status
npm run migration:show

# If migration appears as executed but shouldn't be, check the migrations table directly
```

#### Issue: Cannot Connect to Database

**Symptoms:**
- Connection timeout errors
- Authentication failures
- Network-related errors

**Solutions:**
1. Verify environment variables are correctly set
2. Ensure database server is running
3. Check firewall rules and network connectivity
4. Validate database credentials
5. Confirm database exists

```bash
# Test database connection independently
psql -h localhost -U your_username -d your_database

# Or for MySQL
mysql -h localhost -u your_username -p your_database
```

#### Issue: Generated Migration is Empty

**Symptom:** Migration file contains no changes

**Possible causes:**
1. **Entities match database:** Schema is already up-to-date
2. **Entities not being loaded:** Check entity paths in data source configuration
3. **Database synchronize recently run:** Database was already updated

**Solutions:**
```bash
# Verify entity paths in data-source.ts
# Ensure entities array includes: [__dirname + '/../**/*.entity{.ts,.js}']

# Check that entities are properly decorated with @Entity()
```

#### Issue: Need to Modify an Executed Migration

**Scenario:** A migration has been run, but needs changes

**Development environment solution:**
```bash
# 1. Revert the migration
npm run migration:revert

# 2. Modify the migration file
# 3. Re-run the migration
npm run migration:run
```

**Production environment solution:**
- **Never modify executed migrations in production**
- Create a new migration to adjust the schema
- Document the reason for the additional migration

#### Issue: Migration Fails Partially

**Symptom:** Migration throws an error mid-execution

**Immediate actions:**
1. Check if your database supports transactions (most do)
2. Review the error message carefully
3. Check database state to understand what was applied

**Recovery:**
```bash
# If transaction was rolled back automatically, fix and retry
npm run migration:run

# If changes were partially applied, manual intervention may be needed
# Connect to database and inspect schema state
# May need to manually revert partial changes before re-running
```

#### Issue: TypeScript Compilation Errors

**Symptom:** Migration files won't compile

**Common causes:**
- Missing TypeScript types
- Incorrect imports
- Syntax errors in migration files

**Solutions:**
```bash
# Ensure TypeScript dependencies are installed
npm install --save-dev typescript ts-node @types/node

# Check tsconfig.json configuration
# Verify paths are correctly configured
```

## Production Deployment Strategy

### Pre-Deployment Checklist

Before deploying migrations to production:

- [ ] **Code review:** All migrations reviewed and approved
- [ ] **Testing:** Migrations tested in staging environment
- [ ] **Backup:** Database backup created and verified
- [ ] **Rollback plan:** Procedure documented for reverting changes
- [ ] **Downtime assessment:** Determined if application should be stopped
- [ ] **Communication:** Stakeholders notified of maintenance window
- [ ] **Monitoring:** Logging and monitoring in place

### Deployment Process

#### Standard Deployment

```bash
# 1. Create database backup
pg_dump -U username -d database_name > backup_$(date +%Y%m%d_%H%M%S).sql

# 2. Check current migration status
npm run migration:show

# 3. Execute pending migrations
npm run migration:run

# 4. Verify migrations completed successfully
npm run migration:show

# 5. Start/restart application
pm2 restart app_name

# 6. Monitor application logs and database performance
pm2 logs app_name
```

#### Zero-Downtime Deployment

For critical applications that cannot afford downtime:

1. **Backward-compatible migrations first:**
   - Add new columns as nullable
   - Add new tables without foreign keys
   - Create indexes concurrently (if database supports it)

2. **Deploy application update:**
   - New code works with both old and new schema
   - Gradual rollout with canary deployment

3. **Cleanup migrations later:**
   - Make columns non-nullable
   - Add constraints
   - Remove deprecated columns

### Post-Deployment Verification

```bash
# Verify application health
curl https://your-api.com/health

# Check database connections
# Monitor error rates and performance metrics
# Validate critical business flows
```

### Rollback Procedure

If issues are detected after migration:

```bash
# 1. Stop the application to prevent data inconsistency
pm2 stop app_name

# 2. Revert the migration
npm run migration:revert

# 3. Restore from backup if necessary (last resort)
psql -U username -d database_name < backup_20260218_120000.sql

# 4. Deploy previous application version
git checkout previous-tag
npm install
npm run build

# 5. Restart application
pm2 start app_name
```

### Automated Deployment Integration

#### CI/CD Pipeline Example

```yaml
# Example: GitHub Actions workflow
name: Deploy with Migrations

on:
  push:
    branches: [production]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run migrations
        env:
          DB_TYPE: ${{ secrets.DB_TYPE }}
          DB_HOST: ${{ secrets.DB_HOST }}
          DB_PORT: ${{ secrets.DB_PORT }}
          DB_USERNAME: ${{ secrets.DB_USERNAME }}
          DB_PASSWORD: ${{ secrets.DB_PASSWORD }}
          DB_NAME: ${{ secrets.DB_NAME }}
        run: npm run migration:run
      
      - name: Build application
        run: npm run build
      
      - name: Deploy
        run: ./deploy.sh
```

```

## Migration Patterns and Examples

### Adding a Column

```typescript
// Entity change
@Column({ nullable: true })
phoneNumber: string;
```

```bash
npm run migration:generate -- src/database/migrations/AddPhoneNumberToUsers
```

### Creating a Relation

```typescript
// Order entity
@ManyToOne(() => User, (user) => user.orders)
@JoinColumn({ name: 'userId' })
user: User;

@Column()
userId: string;
```

```bash
npm run migration:generate -- src/database/migrations/AddUserRelationToOrders
```

### Adding an Index

```typescript
@Entity('users')
@Index(['email', 'createdAt'])
export class User {
  // ...
}
```

Or manually:

```typescript
export class AddCompositeIndexToUsers implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE INDEX "IDX_users_email_created" 
      ON "users" ("email", "createdAt");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_users_email_created"`);
  }
}
```

## Performance Considerations

### Large Table Migrations

When working with tables containing millions of rows:

```typescript
export class AddIndexToBigTable implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create index concurrently (PostgreSQL)
    await queryRunner.query(`
      CREATE INDEX CONCURRENTLY "IDX_large_table_column" 
      ON "large_table" ("column");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP INDEX CONCURRENTLY "IDX_large_table_column";
    `);
  }
}
```

### Batched Data Migrations

For data transformations on large datasets:

```typescript
export class MigrateLargeDataset implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const batchSize = 1000;
    let offset = 0;
    let hasMore = true;

    while (hasMore) {
      const result = await queryRunner.query(`
        UPDATE "users" 
        SET "status" = 'active'
        WHERE "id" IN (
          SELECT "id" FROM "users" 
          WHERE "status" IS NULL 
          LIMIT ${batchSize}
        )
      `);

      hasMore = result.affectedRows === batchSize;
      offset += batchSize;
      
      // Log progress
      console.log(`Processed ${offset} records`);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Implement appropriate rollback
  }
}
```

## Team Collaboration Guidelines

### Merge Conflict Resolution

When multiple developers create migrations simultaneously:

1. **Rename newer migration:** Update filename with a newer timestamp
2. **Update class name:** Change the exported class name to match new timestamp
3. **Test both migrations:** Ensure they work together sequentially

### Code Review Focus Areas

When reviewing migration PRs:

- [ ] SQL syntax is correct for target database
- [ ] `down()` method properly reverses `up()`
- [ ] No data loss in reversible migrations
- [ ] Indexes added for foreign keys
- [ ] Large table operations use appropriate strategies
- [ ] Column defaults are sensible
- [ ] Naming conventions followed

### Documentation Requirements

Document in PR or commit message:

- **Purpose:** What does this migration accomplish?
- **Impact:** Will there be downtime? Performance impact?
- **Rollback:** Can it be safely reverted?
- **Testing:** How was it tested?
- **Dependencies:** Does application code need to deploy simultaneously?

## Additional Resources

### Official Documentation

- [TypeORM Migrations](https://typeorm.io/migrations) - Official TypeORM migration documentation
- [NestJS Database](https://docs.nestjs.com/techniques/database) - NestJS TypeORM integration
- [PostgreSQL DDL](https://www.postgresql.org/docs/current/ddl.html) - PostgreSQL schema documentation
- [MySQL DDL](https://dev.mysql.com/doc/refman/8.0/en/sql-data-definition-statements.html) - MySQL schema documentation

### Best Practices Articles

- [Database Migration Best Practices](https://www.liquibase.com/resources/guides/database-migration-best-practices)
- [Zero-Downtime Database Migrations](https://spring.io/blog/2016/05/31/zero-downtime-deployment-with-a-database)

### Tools and Utilities

- **Database Backup Tools:**
  - PostgreSQL: `pg_dump`, `pg_restore`
  - MySQL: `mysqldump`, `mysql`
  - Automated: [pgBackRest](https://pgbackrest.org/), [Percona XtraBackup](https://www.percona.com/software/mysql-database/percona-xtrabackup)

- **Migration Monitoring:**
  - Application logging
  - Database query performance monitoring
  - Infrastructure monitoring (CPU, memory, I/O)

## Summary

Database migrations are a critical component of application lifecycle management. By following the practices outlined in this guide:

- **Maintain schema versioning** across all environments
- **Collaborate effectively** with team members
- **Deploy confidently** with proper testing and rollback procedures
- **Scale reliably** as your application grows

Remember: migrations are code. Treat them with the same rigor as your application logic—review thoroughly, test comprehensively, and deploy carefully.

---

**Document Version:** 1.0  
**Last Updated:** February 2026  
**Compatibility:** TypeORM 0.3.x, NestJS 10.x+

For questions, issues, or contributions, please refer to your project's contribution guidelines or contact the development team.

---

For more information, visit the [TypeORM Migrations Documentation](https://typeorm.io/migrations).
