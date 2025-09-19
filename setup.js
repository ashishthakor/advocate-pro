const fs = require('fs');
const path = require('path');

// Create .env.local file from template
const envTemplate = `# Database Configuration
DATABASE_HOST=localhost
DATABASE_PORT=3306
DATABASE_NAME=advo_competition
DATABASE_USER=root
DATABASE_PASSWORD=your_password_here

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret_here

# JWT Secret
JWT_SECRET=your_jwt_secret_here

# App Configuration
NODE_ENV=development`;

const envPath = path.join(__dirname, '.env.local');

if (!fs.existsSync(envPath)) {
  fs.writeFileSync(envPath, envTemplate);
  console.log('✅ Created .env.local file');
  console.log('📝 Please update the database credentials in .env.local');
} else {
  console.log('⚠️  .env.local already exists');
}

console.log('\n🚀 Setup complete! Next steps:');
console.log('1. Update database credentials in .env.local');
console.log('2. Create MySQL database: advo_competition');
console.log('3. Run the SQL script: src/lib/init-db.sql');
console.log('4. Start the development server: npm run dev');
