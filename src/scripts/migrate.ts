import { MigrationRunner } from '../lib/migrations/migration';
import { migrations } from '../migrations';

async function runMigrations() {
  try {
    console.log('🚀 Starting database migrations...');
    await MigrationRunner.runMigrations(migrations);
    console.log('✅ All migrations completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

async function rollbackMigration(migrationId: string) {
  try {
    console.log(`🔄 Rolling back migration: ${migrationId}`);
    await MigrationRunner.rollbackMigration(migrationId, migrations);
    console.log('✅ Migration rolled back successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Rollback failed:', error);
    process.exit(1);
  }
}

// Parse command line arguments
const args = process.argv.slice(2);
const command = args[0];

if (command === 'rollback' && args[1]) {
  rollbackMigration(args[1]);
} else {
  runMigrations();
}
