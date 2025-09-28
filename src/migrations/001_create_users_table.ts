import { Migration } from '../lib/migrations/migration';

export const createUsersTable: Migration = {
  id: '001_create_users_table',
  name: 'Create users table',
  up: async (connection) => {
    await connection.execute(`
      CREATE TABLE users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role ENUM('user', 'advocate', 'admin') DEFAULT 'user',
        is_approved TINYINT(1) DEFAULT 0, -- 0 = pending, 1 = approved
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
  },
  down: async (connection) => {
    await connection.execute('DROP TABLE IF EXISTS users');
  }
};
