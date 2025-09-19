const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

// Import migrations from the index file
const { migrations } = require('../migrations/index');

// Database connection
const pool = mysql.createPool({
  host: process.env.DATABASE_HOST || 'localhost',
  port: process.env.DATABASE_PORT || 3306,
  user: process.env.DATABASE_USER || 'root',
  password: process.env.DATABASE_PASSWORD || '',
  database: process.env.DATABASE_NAME || 'advo_competition',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Migration definitions (now imported from index)

class MigrationRunner {
  static async createMigrationsTable() {
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

  static async getExecutedMigrations() {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute('SELECT id FROM migrations ORDER BY executed_at');
      return rows.map(row => row.id);
    } finally {
      connection.release();
    }
  }

  static async markMigrationAsExecuted(id, name) {
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

  static async runMigrations() {
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
          // Check if it's a table already exists error
          if (error.message.includes('already exists') || error.code === 'ER_TABLE_EXISTS_ERROR') {
            console.log(`⚠️  Migration ${migration.name} skipped - table already exists`);
            await this.markMigrationAsExecuted(migration.id, migration.name);
          } else {
            console.error(`❌ Migration ${migration.name} failed:`, error.message);
            throw error;
          }
        } finally {
          connection.release();
        }
      } else {
        console.log(`⏭️  Migration ${migration.name} already executed, skipping`);
      }
    }
  }

  static async rollbackMigration(migrationId) {
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
      console.error(`❌ Rollback of migration ${migration.name} failed:`, error.message);
      throw error;
    } finally {
      connection.release();
    }
  }
}

// Parse command line arguments
const args = process.argv.slice(2);
const command = args[0];

async function main() {
  try {
    if (command === 'rollback' && args[1]) {
      console.log(`🔄 Rolling back migration: ${args[1]}`);
      await MigrationRunner.rollbackMigration(args[1]);
      console.log('✅ Migration rolled back successfully!');
    } else {
      console.log('🚀 Starting database migrations...');
      await MigrationRunner.runMigrations();
      console.log('✅ All migrations completed successfully!');
    }
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

main();
