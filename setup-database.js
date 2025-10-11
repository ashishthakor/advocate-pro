const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up Legal Case Management Database...\n');

// Check if .env.local exists
if (!fs.existsSync('.env.local')) {
  console.log('❌ .env.local file not found!');
  console.log('📝 Please copy env.example to .env.local and configure your database settings.');
  console.log('   cp env.example .env.local');
  process.exit(1);
}

// Load environment variables
require('dotenv').config({ path: '.env.local' });

// Check required environment variables
const requiredEnvVars = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.log('❌ Missing required environment variables:');
  missingVars.forEach(varName => console.log(`   - ${varName}`));
  console.log('\n📝 Please update your .env.local file with the required database configuration.');
  process.exit(1);
}

console.log('✅ Environment variables loaded successfully');

try {
  // Run database migrations
  console.log('\n🔄 Running database migrations...');
  execSync('npm run db:migrate', { stdio: 'inherit' });
  console.log('✅ Database migrations completed');

  // Run seeders
  console.log('\n🌱 Running database seeders...');
  execSync('npm run db:seed:all', { stdio: 'inherit' });
  console.log('✅ Database seeders completed');

  console.log('\n🎉 Database setup completed successfully!');
  console.log('\n📋 Default accounts created:');
  console.log('   Admin: admin@legal.com / Admin@123');
  console.log('   Advocate: sarah.smith@legal.com / Advocate@123');
  console.log('   User: john.doe@email.com / User@123');
  
  console.log('\n🚀 You can now start the development server:');
  console.log('   npm run dev');

} catch (error) {
  console.error('\n❌ Database setup failed:');
  console.error(error.message);
  process.exit(1);
}