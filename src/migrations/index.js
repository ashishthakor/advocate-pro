// JavaScript version of migrations index for Node.js compatibility

const createUsersTable = {
  id: '001_create_users_table',
  name: 'Create users table',
  up: async (connection) => {
    await connection.execute(`
      CREATE TABLE users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role ENUM('user', 'admin', 'advocate') DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
  },
  down: async (connection) => {
    await connection.execute('DROP TABLE IF EXISTS users');
  }
};

const createProfilesTable = {
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

const createCompetitionsTable = {
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

const createParticipantsTable = {
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

const seedInitialData = {
  id: '005_seed_initial_data',
  name: 'Seed initial data',
  up: async (connection) => {
    // Insert sample admin user (password: admin123)
    await connection.execute(`
      INSERT IGNORE INTO users (name, email, password, role) VALUES 
      ('Admin User', 'admin@techcompete.com', '$2a$12$5yqe8.FtxYnzswhxLROkLOIXP4S0KtnfR0zqJd0cM5AjBJA7yyZSK', 'admin')
    `);

    // Insert sample competitions
    await connection.execute(`
      INSERT IGNORE INTO competitions (title, description, start_date, end_date, max_participants, status) VALUES 
      ('AI Innovation Challenge', 'Build innovative AI solutions for real-world problems. Showcase your machine learning skills and compete with the best minds in AI.', '2024-02-01 09:00:00', '2024-02-28 18:00:00', 100, 'upcoming'),
      ('Data Science Competition', 'Analyze datasets and build predictive models. Work with real-world data and create solutions that matter.', '2024-03-01 09:00:00', '2024-03-31 18:00:00', 50, 'upcoming'),
      ('Web Development Hackathon', 'Create full-stack web applications. Build modern, responsive applications using the latest technologies.', '2024-04-01 09:00:00', '2024-04-30 18:00:00', 75, 'upcoming'),
      ('Mobile App Development', 'Create innovative mobile applications for iOS and Android. Use the latest frameworks and technologies.', '2024-05-01 09:00:00', '2024-05-31 18:00:00', 60, 'upcoming'),
      ('Blockchain Innovation', 'Build decentralized applications and smart contracts. Explore the future of blockchain technology.', '2024-06-01 09:00:00', '2024-06-30 18:00:00', 40, 'upcoming'),
      ('Cybersecurity Challenge', 'Test your security skills and protect systems from threats. Learn about ethical hacking and defense strategies.', '2024-07-01 09:00:00', '2024-07-31 18:00:00', 80, 'upcoming')
    `);
  },
  down: async (connection) => {
    await connection.execute('DELETE FROM competitions');
    await connection.execute('DELETE FROM users WHERE email = ?', ['admin@techcompete.com']);
  }
};

const createClientsTable = {
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

const createCasesTable = {
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

const createDocumentsTable = {
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

const createAppointmentsTable = {
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

const seedAdvocateData = {
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
    await connection.execute('UPDATE users SET role = "admin" WHERE email = "admin@techcompete.com"');
  }
};

const migrations = [
  createUsersTable,
  createProfilesTable,
  createCompetitionsTable,
  createParticipantsTable,
  seedInitialData,
  createClientsTable,
  createCasesTable,
  createDocumentsTable,
  createAppointmentsTable,
  seedAdvocateData,
];

module.exports = { migrations };
