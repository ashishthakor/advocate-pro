import { Migration } from '../lib/migrations/migration';

export const createDocumentsTable: Migration = {
  id: '008_create_documents_table',
  name: 'Create documents table',
  up: async (connection) => {
    await connection.execute(`
      CREATE TABLE documents (
        id INT AUTO_INCREMENT PRIMARY KEY,
        case_id INT,
        advocate_id INT NOT NULL,
        client_id INT,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        file_path VARCHAR(500) NOT NULL,
        file_type VARCHAR(50),
        file_size INT,
        document_type ENUM('contract', 'evidence', 'correspondence', 'court_document', 'other') DEFAULT 'other',
        is_public BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE,
        FOREIGN KEY (advocate_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
      )
    `);
  },
  down: async (connection) => {
    await connection.execute('DROP TABLE IF EXISTS documents');
  }
};
