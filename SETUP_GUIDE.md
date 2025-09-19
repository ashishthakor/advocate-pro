# 🚀 Complete Setup Guide - TechCompete

This guide will walk you through setting up the TechCompete project from scratch, including database setup, migration system, and all functionality.

## 📋 Prerequisites Checklist

Before starting, ensure you have:

- [ ] **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- [ ] **MySQL** (v8.0 or higher) - [Download here](https://dev.mysql.com/downloads/mysql/)
- [ ] **Git** - [Download here](https://git-scm.com/)
- [ ] **Code Editor** (VS Code recommended) - [Download here](https://code.visualstudio.com/)

## 🎯 Step-by-Step Setup

### Step 1: Clone and Install

```bash
# Clone the repository
git clone <your-repository-url>
cd advo-project-v1

# Install all dependencies
npm install
```

### Step 2: Environment Configuration

```bash
# Create environment file with default values
npm run setup
```

This creates `.env.local` with default values. **Update the database credentials:**

```env
# Database Configuration
DATABASE_HOST=localhost
DATABASE_PORT=3306
DATABASE_NAME=advo_competition
DATABASE_USER=root
DATABASE_PASSWORD=your_mysql_password

# Application Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret_here
JWT_SECRET=your_jwt_secret_here
NODE_ENV=development
```

### Step 3: Database Setup

#### Option A: Simple Setup (Recommended for Beginners)

```bash
# This creates all tables and sample data
npm run db:setup
```

#### Option B: Migration System (Advanced Users)

```bash
# Run all pending migrations
npm run migrate
```

### Step 4: Start Development Server

```bash
# Start the development server
npm run dev
```

### Step 5: Access Application

- **URL**: [http://localhost:3000](http://localhost:3000)
- **Demo Login**: admin@techcompete.com / admin123

## 🏗️ Database Management

### Understanding the Migration System

The project uses a professional migration system for database management:

#### Available Commands

```bash
# Simple database setup (creates all tables and sample data)
npm run db:setup

# Run all pending migrations
npm run migrate

# Rollback a specific migration
npm run migrate:rollback <migration_id>

# Check migration status
npm run migrate
```

#### Migration Files Structure

```
src/migrations/
├── 001_create_users_table.ts          # Creates users table
├── 002_create_profiles_table.ts       # Creates profiles table
├── 003_create_competitions_table.ts   # Creates competitions table
├── 004_create_participants_table.ts   # Creates participants table
├── 005_seed_initial_data.ts           # Seeds sample data
└── index.ts                           # Exports all migrations
```

### Adding New Tables

1. **Create Migration File**:
   ```bash
   # Create new file: src/migrations/006_add_notifications_table.ts
   ```

2. **Implement Migration**:
   ```typescript
   import { Migration } from '../lib/migrations/migration';

   export const addNotificationsTable: Migration = {
     id: '006_add_notifications_table',
     name: 'Add notifications table',
     up: async (connection) => {
       await connection.execute(`
         CREATE TABLE notifications (
           id INT AUTO_INCREMENT PRIMARY KEY,
           user_id INT NOT NULL,
           title VARCHAR(255) NOT NULL,
           message TEXT,
           is_read BOOLEAN DEFAULT FALSE,
           created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
           FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
         )
       `);
     },
     down: async (connection) => {
       await connection.execute('DROP TABLE IF EXISTS notifications');
     }
   };
   ```

3. **Add to Index**:
   ```typescript
   // Add to src/migrations/index.ts
   import { addNotificationsTable } from './006_add_notifications_table';
   
   export const migrations: Migration[] = [
     // ... existing migrations
     addNotificationsTable,
   ];
   ```

4. **Run Migration**:
   ```bash
   npm run migrate
   ```

### Adding Columns to Existing Tables

1. **Create Migration File**:
   ```bash
   # Create new file: src/migrations/007_add_phone_to_users.ts
   ```

2. **Implement Migration**:
   ```typescript
   import { Migration } from '../lib/migrations/migration';

   export const addPhoneToUsers: Migration = {
     id: '007_add_phone_to_users',
     name: 'Add phone column to users table',
     up: async (connection) => {
       await connection.execute(`
         ALTER TABLE users 
         ADD COLUMN phone VARCHAR(20) AFTER email
       `);
     },
     down: async (connection) => {
       await connection.execute(`
         ALTER TABLE users 
         DROP COLUMN phone
       `);
     }
   };
   ```

3. **Add to Index and Run**:
   ```bash
   # Add to src/migrations/index.ts
   npm run migrate
   ```

### Seeding Data

1. **Create Seed Migration**:
   ```bash
   # Create new file: src/migrations/008_seed_competition_categories.ts
   ```

2. **Implement Migration**:
   ```typescript
   import { Migration } from '../lib/migrations/migration';

   export const seedCompetitionCategories: Migration = {
     id: '008_seed_competition_categories',
     name: 'Seed competition categories',
     up: async (connection) => {
       await connection.execute(`
         INSERT INTO competition_categories (name, description) VALUES 
         ('AI/ML', 'Artificial Intelligence and Machine Learning'),
         ('Web Development', 'Frontend and Backend Development'),
         ('Mobile', 'iOS and Android Development'),
         ('Data Science', 'Data Analysis and Visualization')
       `);
     },
     down: async (connection) => {
       await connection.execute('DELETE FROM competition_categories');
     }
   };
   ```

3. **Add to Index and Run**:
   ```bash
   # Add to src/migrations/index.ts
   npm run migrate
   ```

## 🔧 Development Workflow

### Adding New Features

1. **Database Changes** (if needed):
   ```bash
   # Create migration file
   # Edit src/migrations/XXX_new_feature.ts
   # Add to src/migrations/index.ts
   npm run migrate
   ```

2. **API Routes**:
   ```typescript
   // src/app/api/new-feature/route.ts
   export async function GET() { /* ... */ }
   export async function POST() { /* ... */ }
   ```

3. **Components**:
   ```typescript
   // src/components/NewFeature.tsx
   export function NewFeature() { /* ... */ }
   ```

4. **Pages**:
   ```typescript
   // src/app/new-feature/page.tsx
   export default function NewFeaturePage() { /* ... */ }
   ```

### Project Structure Explained

```
advo-project-v1/
├── 📁 src/
│   ├── 📁 app/                          # Next.js App Router
│   │   ├── 📁 api/                      # API Routes
│   │   │   ├── 📁 auth/                 # Authentication endpoints
│   │   │   ├── 📁 competitions/         # Competition endpoints
│   │   │   └── 📁 profile/              # Profile endpoints
│   │   ├── 📁 login/                    # Login page
│   │   ├── 📁 register/                 # Registration page
│   │   ├── 📁 profile/                  # User profile page
│   │   ├── 📁 dashboard/                # User dashboard
│   │   ├── 📁 competitions/             # Competitions listing
│   │   ├── layout.tsx                   # Root layout
│   │   ├── page.tsx                     # Homepage
│   │   └── globals.css                  # Global styles
│   ├── 📁 components/                   # React Components
│   │   ├── AuthProvider.tsx             # Authentication context
│   │   ├── ThemeContext.tsx             # Theme management
│   │   ├── ThemeToggle.tsx              # Theme switcher
│   │   ├── Navbar.tsx                   # Navigation component
│   │   ├── Hero.tsx                     # Homepage hero section
│   │   ├── FeaturedCompetitions.tsx     # Featured competitions
│   │   ├── Features.tsx                 # Features section
│   │   ├── Footer.tsx                   # Footer component
│   │   └── Loading.tsx                  # Loading spinner
│   ├── 📁 lib/                          # Utility Libraries
│   │   ├── database.ts                  # Database connection
│   │   ├── auth.ts                      # Authentication utilities
│   │   └── 📁 migrations/               # Migration system
│   │       └── migration.ts             # Migration runner
│   ├── 📁 migrations/                   # Database Migrations
│   │   ├── 001_create_users_table.ts
│   │   ├── 002_create_profiles_table.ts
│   │   ├── 003_create_competitions_table.ts
│   │   ├── 004_create_participants_table.ts
│   │   ├── 005_seed_initial_data.ts
│   │   └── index.ts
│   ├── 📁 scripts/                      # Utility Scripts
│   │   └── migrate.js                   # Migration CLI
│   ├── 📁 types/                        # TypeScript Types
│   │   └── index.ts                     # Type definitions
│   └── 📁 middleware/                   # Middleware
│       ├── auth.ts                      # Authentication middleware
│       └── index.ts                     # Main middleware
├── 📁 public/                           # Static Assets
├── 📄 package.json                      # Dependencies & Scripts
├── 📄 next.config.js                    # Next.js Configuration
├── 📄 tailwind.config.js                # Tailwind Configuration
├── 📄 tsconfig.json                     # TypeScript Configuration
├── 📄 setup.js                          # Environment setup script
├── 📄 setup-database.js                 # Database setup script
├── 📄 .env.local                        # Environment variables
├── 📄 .env.example                      # Environment template
└── 📄 README.md                         # Main documentation
```

## 🚨 Troubleshooting

### Common Issues and Solutions

#### 1. Database Connection Failed
```bash
# Check MySQL is running
# Verify credentials in .env.local
# Ensure database exists
npm run db:setup
```

#### 2. Migration Failed
```bash
# Check error message
# Fix migration file
# Run again
npm run migrate
```

#### 3. Port Already in Use
```bash
# Kill process using port 3000
# Or use different port
npm run dev -- -p 3001
```

#### 4. Module Not Found
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

#### 5. TypeScript Errors
```bash
# Check TypeScript configuration
# Ensure all types are properly imported
# Run type checking
npx tsc --noEmit
```

## 🎯 Key Features Explained

### Authentication System
- **JWT Tokens**: Secure authentication with JSON Web Tokens
- **Password Hashing**: bcryptjs for secure password storage
- **Protected Routes**: Middleware for route protection
- **Context API**: React Context for state management

### Theme System
- **Dark/Light Mode**: Automatic theme switching
- **System Preference**: Respects user's OS theme preference
- **Persistent**: Theme choice saved in localStorage
- **Smooth Transitions**: CSS transitions for theme changes

### Database System
- **Migration System**: Version-controlled database changes
- **Transaction Safety**: Each migration runs in a transaction
- **Rollback Support**: Can undo migrations if needed
- **Team Collaboration**: Share database changes via Git

### API System
- **RESTful APIs**: Standard HTTP methods and status codes
- **Error Handling**: Comprehensive error handling and responses
- **Type Safety**: TypeScript for API request/response types
- **Validation**: Input validation and sanitization

## 🚀 Deployment

### Production Setup

1. **Environment Variables**:
   ```env
   DATABASE_HOST=your_production_host
   DATABASE_PORT=3306
   DATABASE_NAME=advo_competition_prod
   DATABASE_USER=your_prod_user
   DATABASE_PASSWORD=your_prod_password
   NEXTAUTH_URL=https://yourdomain.com
   NEXTAUTH_SECRET=your_production_secret
   JWT_SECRET=your_production_jwt_secret
   NODE_ENV=production
   ```

2. **Database Setup**:
   ```bash
   # Run migrations in production
   npm run migrate
   ```

3. **Build and Start**:
   ```bash
   npm run build
   npm start
   ```

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [MySQL Documentation](https://dev.mysql.com/doc/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [React Context API](https://reactjs.org/docs/context.html)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add migrations if needed
5. Test thoroughly
6. Submit a pull request

## 📞 Support

If you encounter any issues:

1. Check the troubleshooting section above
2. Review the error messages carefully
3. Check the console logs
4. Create an issue in the repository
5. Contact the development team

---

**Happy Coding! 🎉**
