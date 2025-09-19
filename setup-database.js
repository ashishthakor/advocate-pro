const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function setupDatabase() {
  console.log('🚀 Setting up database...');
  
  // First, create database if it doesn't exist
  const connection = await mysql.createConnection({
    host: process.env.DATABASE_HOST || 'localhost',
    port: process.env.DATABASE_PORT || 3306,
    user: process.env.DATABASE_USER || 'root',
    password: process.env.DATABASE_PASSWORD || '',
  });

  try {
    await connection.execute(`CREATE DATABASE IF NOT EXISTS ${process.env.DATABASE_NAME || 'advo_competition'}`);
    console.log('✅ Database created/verified');
  } catch (error) {
    console.error('❌ Database creation failed:', error.message);
    return;
  } finally {
    await connection.end();
  }

  // Now connect to the specific database
  const pool = mysql.createPool({
    host: process.env.DATABASE_HOST || 'localhost',
    port: process.env.DATABASE_PORT || 3306,
    user: process.env.DATABASE_USER || 'root',
    password: process.env.DATABASE_PASSWORD || '',
    database: process.env.DATABASE_NAME || 'advo_competition',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });

  try {
    // Create users table
    console.log('📝 Creating users table...');
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role ENUM('user', 'admin') DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Users table created');

    // Create profiles table
    console.log('📝 Creating profiles table...');
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS profiles (
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
    console.log('✅ Profiles table created');

    // Create competitions table
    console.log('📝 Creating competitions table...');
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS competitions (
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
    console.log('✅ Competitions table created');

    // Create participants table
    console.log('📝 Creating participants table...');
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS participants (
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
    console.log('✅ Participants table created');

    // Insert sample data
    console.log('🌱 Seeding sample data...');
    
    // Insert admin user (password: admin123)
    await pool.execute(`
      INSERT IGNORE INTO users (name, email, password, role) VALUES 
      ('Admin User', 'admin@techcompete.com', '$2a$12$5yqe8.FtxYnzswhxLROkLOIXP4S0KtnfR0zqJd0cM5AjBJA7yyZSK', 'admin')
    `);
    console.log('✅ Admin user created');

    // Insert sample competitions
    await pool.execute(`
      INSERT IGNORE INTO competitions (title, description, start_date, end_date, max_participants, status) VALUES 
      ('AI Innovation Challenge', 'Build innovative AI solutions for real-world problems. Showcase your machine learning skills and compete with the best minds in AI.', '2024-02-01 09:00:00', '2024-02-28 18:00:00', 100, 'upcoming'),
      ('Data Science Competition', 'Analyze datasets and build predictive models. Work with real-world data and create solutions that matter.', '2024-03-01 09:00:00', '2024-03-31 18:00:00', 50, 'upcoming'),
      ('Web Development Hackathon', 'Create full-stack web applications. Build modern, responsive applications using the latest technologies.', '2024-04-01 09:00:00', '2024-04-30 18:00:00', 75, 'upcoming'),
      ('Mobile App Development', 'Create innovative mobile applications for iOS and Android. Use the latest frameworks and technologies.', '2024-05-01 09:00:00', '2024-05-31 18:00:00', 60, 'upcoming'),
      ('Blockchain Innovation', 'Build decentralized applications and smart contracts. Explore the future of blockchain technology.', '2024-06-01 09:00:00', '2024-06-30 18:00:00', 40, 'upcoming'),
      ('Cybersecurity Challenge', 'Test your security skills and protect systems from threats. Learn about ethical hacking and defense strategies.', '2024-07-01 09:00:00', '2024-07-31 18:00:00', 80, 'upcoming')
    `);
    console.log('✅ Sample competitions created');

    console.log('🎉 Database setup completed successfully!');
    console.log('🔑 Demo credentials:');
    console.log('   Email: admin@techcompete.com');
    console.log('   Password: admin123');

  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
  } finally {
    await pool.end();
  }
}

setupDatabase();
