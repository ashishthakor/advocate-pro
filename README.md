# AdvocatePro - Professional Legal Management System

A comprehensive Next.js application built with TypeScript, designed specifically for advocates and legal professionals. Features client management, case tracking, document management, and streamlined legal practice management with modern technology.

## 🚀 Features

- 🔐 **User Authentication** - Secure login/register with JWT tokens
- 👥 **Client Management** - Comprehensive client database with contact information and case history
- 📋 **Case Tracking** - Track case progress, deadlines, court dates, and important milestones
- 📁 **Document Management** - Secure document storage, version control, and easy sharing
- 📅 **Calendar & Scheduling** - Integrated calendar system for court dates and client meetings
- 💰 **Billing & Invoicing** - Generate invoices, track payments, and manage billing cycles
- 📊 **Analytics & Reports** - Detailed insights into practice performance and case outcomes
- 👤 **User Profiles** - Manage personal information and settings
- 🌙 **Dark/Light Theme** - Beautiful theme switching with system preference detection
- 📱 **Responsive Design** - Mobile-first approach with Tailwind CSS
- 🗄️ **MySQL Database** - Robust data storage with proper relationships
- 🔒 **Protected Routes** - Secure access to user-specific pages
- 🎨 **Modern UI** - Clean, intuitive interface with glass effects and animations
- 🎯 **Context API** - Simple state management with React Context
- ⚡ **Performance** - Optimized for speed and user experience
- 🏗️ **Migration System** - Professional database management with version control

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 18, TypeScript
- **Styling**: Tailwind CSS with custom design system
- **State Management**: React Context API
- **Database**: MySQL with custom migration system
- **Authentication**: JWT tokens with bcryptjs
- **API**: Next.js API routes
- **Theme**: Dark/Light mode with system preference detection
- **Database Management**: Custom migration system with rollback support

## 📋 Prerequisites

Before running this application, make sure you have:

- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **MySQL** (v8.0 or higher) - [Download here](https://dev.mysql.com/downloads/mysql/)
- **npm** or **yarn** package manager
- **Git** for version control

## 🚀 Quick Start (Complete Setup)

### Step 1: Clone and Install
```bash
# Clone the repository
git clone <repository-url>
cd advo-project-v1

# Install all dependencies
npm install
```

### Step 2: Environment Setup
```bash
# Create environment file with default values
npm run setup
```

This creates `.env.local` with default values. **Update with your database credentials:**
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
```bash
# Option 1: Simple setup (recommended for beginners)
npm run db:setup

# Option 2: Use migration system (for advanced users)
npm run migrate
```

### Step 4: Start Development
```bash
# Start the development server
npm run dev
```

### Step 5: Access Application
- **URL**: [http://localhost:3000](http://localhost:3000)
- **Demo Login**: admin@techcompete.com / admin123
- **Features**: Access client management, case tracking, and dashboard after login

## 🏗️ Database Management System

This project uses a professional migration system for database management.

### 📊 Available Commands

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

### 🔄 Migration Workflow

#### For New Tables/Columns:
1. **Create Migration File**:
   ```bash
   # Create new migration file in src/migrations/
   # Follow naming: XXX_description.ts (e.g., 006_add_notifications_table.ts)
   ```

2. **Implement Migration**:
   ```typescript
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

#### For Data Seeding:
1. **Create Seed Migration**:
   ```typescript
   export const seedNotifications: Migration = {
     id: '007_seed_notifications',
     name: 'Seed notifications data',
     up: async (connection) => {
       await connection.execute(`
         INSERT INTO notifications (user_id, title, message) VALUES 
         (1, 'Welcome!', 'Welcome to TechCompete platform'),
         (1, 'New Competition', 'AI Innovation Challenge is now open')
       `);
     },
     down: async (connection) => {
       await connection.execute('DELETE FROM notifications');
     }
   };
   ```

2. **Run Migration**:
   ```bash
   npm run migrate
   ```

### 🗂️ Migration Files Structure

```
src/migrations/
├── 001_create_users_table.ts
├── 002_create_profiles_table.ts
├── 003_create_competitions_table.ts
├── 004_create_participants_table.ts
├── 005_seed_initial_data.ts
├── 006_add_notifications_table.ts  # Example new migration
└── index.ts
```

### 🔧 Migration Features

- ✅ **Version Control** - Track which migrations have been run
- ✅ **Rollback Support** - Undo migrations if needed
- ✅ **Transaction Safety** - Each migration runs in a transaction
- ✅ **Error Handling** - Graceful failure and rollback
- ✅ **Idempotent** - Safe to run multiple times
- ✅ **Team Collaboration** - Share database changes via Git

### 🚨 Troubleshooting Migrations

```bash
# If migration fails, check the error and fix the migration file
# Then run again
npm run migrate

# If you need to rollback a specific migration
npm run migrate:rollback 006_add_notifications_table

# If you need to reset everything (DANGER: deletes all data)
# Drop database manually and run:
npm run db:setup
```

## 📁 Project Structure

```
advo-project-v1/
├── 📁 src/
│   ├── 📁 app/                          # Next.js App Router
│   │   ├── 📁 api/                      # API Routes
│   │   │   ├── 📁 auth/                 # Authentication endpoints
│   │   │   │   ├── login/route.ts       # Login API
│   │   │   │   ├── register/route.ts    # Register API
│   │   │   │   └── me/route.ts          # Current user API
│   │   │   ├── 📁 clients/              # Client management endpoints
│   │   │   │   └── route.ts             # Client CRUD operations
│   │   │   ├── 📁 cases/                # Case management endpoints
│   │   │   │   └── route.ts             # Case CRUD operations
│   │   │   ├── 📁 competitions/         # Competition endpoints (legacy)
│   │   │   │   ├── route.ts             # List competitions
│   │   │   │   └── [id]/route.ts        # Single competition
│   │   │   └── 📁 profile/              # Profile endpoints
│   │   │       └── route.ts             # Profile management
│   │   ├── 📁 login/                    # Login page
│   │   │   └── page.tsx
│   │   ├── 📁 register/                 # Registration page
│   │   │   └── page.tsx
│   │   ├── 📁 profile/                  # User profile page
│   │   │   └── page.tsx
│   │   ├── 📁 dashboard/                # Advocate dashboard
│   │   │   └── page.tsx
│   │   ├── 📁 clients/                  # Client management page
│   │   │   └── page.tsx
│   │   ├── 📁 cases/                    # Case management page
│   │   │   └── page.tsx
│   │   ├── 📁 services/                 # Services page
│   │   │   └── page.tsx
│   │   ├── 📁 about/                    # About page
│   │   │   └── page.tsx
│   │   ├── 📁 contact/                  # Contact page
│   │   │   └── page.tsx
│   │   ├── 📁 competitions/             # Competitions listing (legacy)
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx            # Single competition page
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
│   │   ├── 006_create_clients_table.ts
│   │   ├── 007_create_cases_table.ts
│   │   ├── 008_create_documents_table.ts
│   │   ├── 009_create_appointments_table.ts
│   │   ├── 010_seed_advocate_data.ts
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
└── 📄 README.md                         # This file
```

## 🔧 Development Workflow

### Adding New Features

1. **Create Database Changes** (if needed):
   ```bash
   # Create new migration
   # Edit src/migrations/XXX_new_feature.ts
   # Add to src/migrations/index.ts
   npm run migrate
   ```

2. **Create API Routes**:
   ```typescript
   // src/app/api/new-feature/route.ts
   export async function GET() { /* ... */ }
   export async function POST() { /* ... */ }
   ```

3. **Create Components**:
   ```typescript
   // src/components/NewFeature.tsx
   export function NewFeature() { /* ... */ }
   ```

4. **Create Pages**:
   ```typescript
   // src/app/new-feature/page.tsx
   export default function NewFeaturePage() { /* ... */ }
   ```

### Database Schema Changes

#### Adding a New Table:
```typescript
// 1. Create migration file: src/migrations/006_add_orders_table.ts
export const addOrdersTable: Migration = {
  id: '006_add_orders_table',
  name: 'Add orders table',
  up: async (connection) => {
    await connection.execute(`
      CREATE TABLE orders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        competition_id INT NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        status ENUM('pending', 'completed', 'cancelled') DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (competition_id) REFERENCES competitions(id) ON DELETE CASCADE
      )
    `);
  },
  down: async (connection) => {
    await connection.execute('DROP TABLE IF EXISTS orders');
  }
};
```

#### Adding a Column:
```typescript
// 1. Create migration file: src/migrations/007_add_phone_to_users.ts
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

#### Seeding Data:
```typescript
// 1. Create migration file: src/migrations/008_seed_competition_categories.ts
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

## 🔑 Demo Credentials

- **Email**: admin@techcompete.com
- **Password**: admin123

## 🏛️ Advocate Management Features

### Client Management
- **Add Clients**: Register new clients with contact information
- **Client Database**: Comprehensive client profiles with case history
- **Status Tracking**: Track client status (active, inactive, potential)
- **Search & Filter**: Find clients quickly with advanced search

### Case Management
- **Case Creation**: Create new cases with detailed information
- **Case Types**: Support for various case types (Criminal, Civil, Family, Corporate, Property)
- **Priority Levels**: Set case priority (low, medium, high, urgent)
- **Status Tracking**: Monitor case progress (open, in_progress, closed, on_hold)
- **Fee Management**: Track case fees and payments

### Document Management
- **File Upload**: Secure document storage for case files
- **Version Control**: Track document versions and changes
- **File Types**: Support for PDF, DOCX, and other legal documents
- **Case Association**: Link documents to specific cases

### Calendar & Scheduling
- **Appointment Booking**: Schedule client meetings and court dates
- **Appointment Types**: Different types (Meeting, Court, Consultation, Other)
- **Date Management**: Track upcoming appointments and deadlines
- **Integration**: Seamless integration with case management

### Dashboard Analytics
- **Quick Stats**: Overview of active clients, open cases, and appointments
- **Recent Activity**: Track recent case updates and client interactions
- **Performance Metrics**: Monitor practice performance and outcomes

## 🆘 Troubleshooting

### Common Issues

1. **Database Connection Failed**:
   ```bash
   # Check MySQL is running
   # Verify credentials in .env.local
   # Ensure database exists
   npm run db:setup
   ```

2. **Migration Failed**:
   ```bash
   # Check error message
   # Fix migration file
   # Run again
   npm run migrate
   ```

3. **Port Already in Use**:
   ```bash
   # Kill process using port 3000
   # Or use different port
   npm run dev -- -p 3001
   ```

4. **Module Not Found**:
   ```bash
   # Reinstall dependencies
   rm -rf node_modules package-lock.json
   npm install
   ```

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [MySQL Documentation](https://dev.mysql.com/doc/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add migrations if needed
5. Test thoroughly
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License.
