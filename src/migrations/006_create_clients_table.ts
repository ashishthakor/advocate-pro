import { Migration } from '../lib/migrations/migration';

export const createClientsTable: Migration = {
  id: '006_create_clients_table',
  name: 'Create clients table',
  up: async (connection) => {
    await connection.execute(`
      CREATE TABLE clients (
        id INT AUTO_INCREMENT PRIMARY KEY,
        advocate_id INT NOT NULL,
        first_name VARCHAR(255) NOT NULL,
        last_name VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        phone VARCHAR(20),
        address TEXT,
        date_of_birth DATE,
        occupation VARCHAR(255),
        emergency_contact_name VARCHAR(255),
        emergency_contact_phone VARCHAR(20),
        notes TEXT,
        status ENUM('active', 'inactive', 'potential') DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (advocate_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
  },
  down: async (connection) => {
    await connection.execute('DROP TABLE IF EXISTS clients');
  }
};
