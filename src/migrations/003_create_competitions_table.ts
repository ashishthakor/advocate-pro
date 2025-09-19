import { Migration } from '../lib/migrations/migration';

export const createCompetitionsTable: Migration = {
  id: '003_create_competitions_table',
  name: 'Create competitions table',
  up: async (connection) => {
    await connection.execute(`
      CREATE TABLE competitions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        start_date DATETIME,
        end_date DATETIME,
        max_participants INT,
        current_participants INT DEFAULT 0,
        status ENUM('upcoming', 'active', 'completed', 'cancelled') DEFAULT 'upcoming',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
  },
  down: async (connection) => {
    await connection.execute('DROP TABLE IF EXISTS competitions');
  }
};
