import { Migration } from '../lib/migrations/migration';

export const createAppointmentsTable: Migration = {
  id: '009_create_appointments_table',
  name: 'Create appointments table',
  up: async (connection) => {
    await connection.execute(`
      CREATE TABLE appointments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        advocate_id INT NOT NULL,
        client_id INT,
        case_id INT,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        appointment_date DATETIME NOT NULL,
        duration_minutes INT DEFAULT 60,
        location VARCHAR(255),
        appointment_type ENUM('consultation', 'court_hearing', 'meeting', 'phone_call', 'other') DEFAULT 'consultation',
        status ENUM('scheduled', 'completed', 'cancelled', 'rescheduled') DEFAULT 'scheduled',
        reminder_sent BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (advocate_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE SET NULL,
        FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE SET NULL
      )
    `);
  },
  down: async (connection) => {
    await connection.execute('DROP TABLE IF EXISTS appointments');
  }
};
