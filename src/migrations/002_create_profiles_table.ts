import { Migration } from '../lib/migrations/migration';

export const createProfilesTable: Migration = {
  id: '002_create_profiles_table',
  name: 'Create profiles table',
  up: async (connection) => {
    await connection.execute(`
      CREATE TABLE profiles (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        bio TEXT,
        avatar_url VARCHAR(500),
        phone VARCHAR(20),
        address TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
  },
  down: async (connection) => {
    await connection.execute('DROP TABLE IF EXISTS profiles');
  }
};
