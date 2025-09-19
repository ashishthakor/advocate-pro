import { Migration } from '../lib/migrations/migration';

export const seedInitialData: Migration = {
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
