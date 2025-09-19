import { Migration } from '../lib/migrations/migration';

export const createParticipantsTable: Migration = {
  id: '004_create_participants_table',
  name: 'Create participants table',
  up: async (connection) => {
    await connection.execute(`
      CREATE TABLE participants (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        competition_id INT NOT NULL,
        registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        status ENUM('registered', 'active', 'completed', 'disqualified') DEFAULT 'registered',
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (competition_id) REFERENCES competitions(id) ON DELETE CASCADE,
        UNIQUE KEY unique_participation (user_id, competition_id)
      )
    `);
  },
  down: async (connection) => {
    await connection.execute('DROP TABLE IF EXISTS participants');
  }
};
