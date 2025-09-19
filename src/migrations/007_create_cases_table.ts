import { Migration } from '../lib/migrations/migration';

export const createCasesTable: Migration = {
  id: '007_create_cases_table',
  name: 'Create cases table',
  up: async (connection) => {
    await connection.execute(`
      CREATE TABLE cases (
        id INT AUTO_INCREMENT PRIMARY KEY,
        advocate_id INT NOT NULL,
        client_id INT NOT NULL,
        case_number VARCHAR(100) UNIQUE NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        case_type ENUM('criminal', 'civil', 'family', 'corporate', 'property', 'other') NOT NULL,
        status ENUM('open', 'in_progress', 'closed', 'on_hold') DEFAULT 'open',
        priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
        start_date DATE,
        end_date DATE,
        court_name VARCHAR(255),
        judge_name VARCHAR(255),
        next_hearing_date DATETIME,
        fees DECIMAL(10,2) DEFAULT 0,
        fees_paid DECIMAL(10,2) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (advocate_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
      )
    `);
  },
  down: async (connection) => {
    await connection.execute('DROP TABLE IF EXISTS cases');
  }
};
