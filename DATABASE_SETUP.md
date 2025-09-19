# Database Setup Guide

## 🚀 Quick Setup (Recommended)

### 1. Install MySQL
- Download and install MySQL from [mysql.com](https://dev.mysql.com/downloads/mysql/)
- Or use XAMPP/WAMP for easier setup

### 2. Create Database
```sql
CREATE DATABASE advo_competition;
```

### 3. Update Environment Variables
Edit `.env.local` file:
```env
DATABASE_HOST=localhost
DATABASE_PORT=3306
DATABASE_NAME=advo_competition
DATABASE_USER=root
DATABASE_PASSWORD=your_mysql_password
```

### 4. Run Migrations
```bash
# Install dependencies
npm install

# Run database migrations
npm run migrate
```

## 🏗️ Migration System

This project uses a proper migration system instead of raw SQL files:

### Available Commands
```bash
# Run all pending migrations
npm run migrate

# Rollback a specific migration
npm run migrate:rollback <migration_id>
```

### Migration Files
- `001_create_users_table.ts` - Creates users table
- `002_create_profiles_table.ts` - Creates profiles table  
- `003_create_competitions_table.ts` - Creates competitions table
- `004_create_participants_table.ts` - Creates participants table
- `005_seed_initial_data.ts` - Seeds sample data

### Migration Features
- ✅ **Version Control** - Track which migrations have been run
- ✅ **Rollback Support** - Undo migrations if needed
- ✅ **Transaction Safety** - Each migration runs in a transaction
- ✅ **Error Handling** - Graceful failure and rollback
- ✅ **Idempotent** - Safe to run multiple times

## 🔄 Alternative: Use Without Database

The application includes fallback data and works without a database:

1. **Test the UI** - All pages show sample data
2. **Set up database later** - When ready, follow the steps above
3. **Use demo mode** - Login with demo credentials

## 🔑 Demo Credentials

- **Email**: admin@techcompete.com
- **Password**: admin123

## 🛠️ Troubleshooting

### Database Connection Issues
- Check if MySQL is running
- Verify credentials in `.env.local`
- Ensure database `advo_competition` exists
- Check firewall settings

### Migration Issues
```bash
# Check migration status
npm run migrate

# If migrations fail, check database connection
# Then try running migrations again
```

### Application Still Works
Even with database issues, the application will:
- Show sample competitions
- Display beautiful UI
- Allow theme switching
- Work on all pages

## 📋 Next Steps

1. **Start the app**: `npm run dev`
2. **Visit**: http://localhost:3000
3. **Test features**:
   - Theme toggle (sun/moon icon)
   - Login/Register pages
   - Competition browsing
   - Responsive design

## 🏗️ Development Workflow

### Adding New Migrations
1. Create new migration file in `src/migrations/`
2. Follow naming convention: `XXX_description.ts`
3. Implement `up` and `down` functions
4. Add to `src/migrations/index.ts`
5. Run `npm run migrate`

### Example Migration
```typescript
export const addNewTable: Migration = {
  id: '006_add_new_table',
  name: 'Add new table',
  up: async (connection) => {
    await connection.execute(`
      CREATE TABLE new_table (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL
      )
    `);
  },
  down: async (connection) => {
    await connection.execute('DROP TABLE IF EXISTS new_table');
  }
};
```

## 🎯 Benefits of Migration System

- **Version Control** - Track database changes
- **Team Collaboration** - Share database changes
- **Production Safety** - Controlled deployments
- **Rollback Support** - Undo problematic changes
- **Consistency** - Same schema across environments
