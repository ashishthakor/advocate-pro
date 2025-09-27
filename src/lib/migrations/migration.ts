import {pool} from '@/lib/database';

export interface Migration {
  id: string;
  name: string;
  up: (connection: any) => Promise<void>;
  down: (connection: any) => Promise<void>;
}

export class MigrationRunner {
  private static async createMigrationsTable(): Promise<void> {
    const connection = await pool.getConnection();
    try {
      await connection.execute(`
        CREATE TABLE IF NOT EXISTS migrations (
          id VARCHAR(255) PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
    } finally {
      connection.release();
    }
  }

  private static async getExecutedMigrations(): Promise<string[]> {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute('SELECT id FROM migrations ORDER BY executed_at');
      return (rows as any[]).map(row => row.id);
    } finally {
      connection.release();
    }
  }

  private static async markMigrationAsExecuted(id: string, name: string): Promise<void> {
    const connection = await pool.getConnection();
    try {
      await connection.execute(
        'INSERT INTO migrations (id, name) VALUES (?, ?)',
        [id, name]
      );
    } finally {
      connection.release();
    }
  }

  static async runMigrations(migrations: Migration[]): Promise<void> {
    await this.createMigrationsTable();
    const executedMigrations = await this.getExecutedMigrations();
    
    for (const migration of migrations) {
      if (!executedMigrations.includes(migration.id)) {
        console.log(`Running migration: ${migration.name}`);
        const connection = await pool.getConnection();
        try {
          await connection.beginTransaction();
          await migration.up(connection);
          await this.markMigrationAsExecuted(migration.id, migration.name);
          await connection.commit();
          console.log(`✅ Migration ${migration.name} completed successfully`);
        } catch (error) {
          await connection.rollback();
          console.error(`❌ Migration ${migration.name} failed:`, error);
          throw error;
        } finally {
          connection.release();
        }
      } else {
        console.log(`⏭️  Migration ${migration.name} already executed, skipping`);
      }
    }
  }

  static async rollbackMigration(migrationId: string, migrations: Migration[]): Promise<void> {
    const migration = migrations.find(m => m.id === migrationId);
    if (!migration) {
      throw new Error(`Migration ${migrationId} not found`);
    }

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      await migration.down(connection);
      await connection.execute('DELETE FROM migrations WHERE id = ?', [migrationId]);
      await connection.commit();
      console.log(`✅ Migration ${migration.name} rolled back successfully`);
    } catch (error) {
      await connection.rollback();
      console.error(`❌ Rollback of migration ${migration.name} failed:`, error);
      throw error;
    } finally {
      connection.release();
    }
  }
}
