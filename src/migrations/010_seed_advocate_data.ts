import { Migration } from '../lib/migrations/migration';

export const seedAdvocateData: Migration = {
  id: '010_seed_advocate_data',
  name: 'Seed advocate sample data',
  up: async (connection) => {
    // Update admin user to be an advocate
    await connection.execute(`
      UPDATE users SET role = 'advocate', name = 'John Advocate' WHERE email = 'admin@techcompete.com'
    `);

    // Insert sample clients
    await connection.execute(`
      INSERT IGNORE INTO clients (advocate_id, first_name, last_name, email, phone, address, occupation, status) VALUES 
      (1, 'Alice', 'Johnson', 'alice.johnson@email.com', '+1-555-0101', '123 Main St, City, State', 'Business Owner', 'active'),
      (1, 'Bob', 'Smith', 'bob.smith@email.com', '+1-555-0102', '456 Oak Ave, City, State', 'Engineer', 'active'),
      (1, 'Carol', 'Davis', 'carol.davis@email.com', '+1-555-0103', '789 Pine Rd, City, State', 'Teacher', 'potential'),
      (1, 'David', 'Wilson', 'david.wilson@email.com', '+1-555-0104', '321 Elm St, City, State', 'Doctor', 'active')
    `);

    // Insert sample cases
    await connection.execute(`
      INSERT IGNORE INTO cases (advocate_id, client_id, case_number, title, description, case_type, status, priority, start_date, fees) VALUES 
      (1, 1, 'CASE-2024-001', 'Business Contract Dispute', 'Dispute over breach of contract between two companies', 'civil', 'in_progress', 'high', '2024-01-15', 5000.00),
      (1, 2, 'CASE-2024-002', 'Property Rights Case', 'Property boundary dispute with neighbor', 'property', 'open', 'medium', '2024-02-01', 3000.00),
      (1, 3, 'CASE-2024-003', 'Family Law Matter', 'Divorce proceedings and child custody', 'family', 'open', 'high', '2024-02-15', 7500.00),
      (1, 4, 'CASE-2024-004', 'Criminal Defense', 'DUI case defense representation', 'criminal', 'in_progress', 'urgent', '2024-03-01', 4000.00)
    `);

    // Insert sample appointments
    await connection.execute(`
      INSERT IGNORE INTO appointments (advocate_id, client_id, case_id, title, description, appointment_date, appointment_type, status) VALUES 
      (1, 1, 1, 'Client Consultation', 'Initial consultation for contract dispute', '2024-01-20 10:00:00', 'consultation', 'completed'),
      (1, 2, 2, 'Court Hearing', 'Property rights hearing at District Court', '2024-02-15 14:30:00', 'court_hearing', 'scheduled'),
      (1, 3, 3, 'Client Meeting', 'Discuss divorce proceedings and strategy', '2024-02-20 11:00:00', 'meeting', 'scheduled'),
      (1, 4, 4, 'Court Appearance', 'DUI case court appearance', '2024-03-05 09:00:00', 'court_hearing', 'scheduled')
    `);
  },
  down: async (connection) => {
    await connection.execute('DELETE FROM appointments');
    await connection.execute('DELETE FROM cases');
    await connection.execute('DELETE FROM clients');
    await connection.execute('UPDATE users SET role = "advocate" WHERE email = "advocate@techcompete.com"');
  }
};
