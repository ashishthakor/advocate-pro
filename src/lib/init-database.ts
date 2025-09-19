import { MigrationRunner } from './migrations/migration';
import { migrations } from '../migrations';

export async function initializeDatabase(): Promise<void> {
  try {
    console.log('🚀 Initializing database...');
    await MigrationRunner.runMigrations(migrations);
    console.log('✅ Database initialized successfully!');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
}
