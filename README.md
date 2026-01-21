# Legal Case Management System

A comprehensive legal case management system built with Next.js 15, React 18, TypeScript, Material-UI, and AWS S3. Features role-based access control for Admin, Advocate, and User roles with real-time chat and file management.

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- MySQL (v8.0 or higher)
- AWS Account (for S3 file storage)

### Installation

1. **Clone and Install**
```bash
git clone <repository-url>
cd advo-project-v1
npm install
```

2. **Environment Setup**
```bash
cp env.example .env.local
# Edit .env.local with your configuration
```

3. **Database Setup**
```bash
npm run db:setup
```

4. **Start Development**
```bash
npm run dev
```

## 🔧 Database Commands

Following the textile-solution-backend pattern:

```bash
# Run migrations
npm run db:migrate

# Undo last migration
npm run db:migrate:undo

# Undo all migrations
npm run db:migrate:undo:all

# Run seeders
npm run db:seed:all

# Undo all seeders
npm run db:seed:undo:all

# Reset database (undo all + migrate + seed)
npm run db:reset
```

## 👥 Default Accounts

After running seeders, you can log in with:

- **Admin:** admin@legal.com / admin123
- **Advocate:** sarah.smith@legal.com / advocate123
- **User:** john.doe@email.com / user123

## 🏗️ Project Structure

```
advo-project-v1/
├── app/                          # Next.js App Router
│   ├── (admin)/                  # Admin-only routes
│   ├── (advocate)/               # Advocate-only routes
│   ├── (user)/                   # User-only routes
│   ├── (auth)/                   # Authentication routes
│   └── api/                      # API endpoints
├── models/                       # Sequelize models
├── migrations/                   # Database migrations
├── seeders/                      # Database seeders
├── config/                       # Configuration files
├── lib/                          # Utilities and configurations
└── assets/                       # Theme and static assets
```

## 🎯 Key Features

### ✅ Completed
- **Role-based Authentication** (Admin, Advocate, User)
- **Database Setup** with Sequelize migrations and seeders
- **AWS S3 Integration** for secure file uploads
- **Material-UI Theme** integration
- **Responsive Layouts** for all roles
- **JWT Authentication** with middleware protection

### 🚧 In Progress
- **Real-time Chat System** with Socket.io
- **Case Management** CRUD operations
- **File Upload/Download** with S3
- **User Management** interfaces

## 🔐 Authentication

The system uses JWT tokens with role-based access control:

- **Admin:** Full system access
- **Advocate:** Case management and user access
- **User:** Personal case management

## 📁 File Management

Files are stored securely in AWS S3 with:
- File type validation (images, documents)
- Size limits (10MB max)
- Organized folder structure
- Presigned URLs for secure downloads

## 🗄️ Database Schema

### Core Tables
- **users** - User accounts with role-based fields
- **cases** - Legal cases with status tracking
- **chat_messages** - Real-time chat messages
- **documents** - File management with S3 integration

## 🛠️ Development

### Available Scripts
   ```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run db:migrate   # Run database migrations
npm run db:seed:all  # Run database seeders
```

### Environment Variables
See `env.example` for required configuration:
- Database credentials
- JWT secrets
- AWS S3 configuration
- Email settings

## 🔒 Security Features

- JWT token authentication
- Role-based route protection
- File upload validation
- SQL injection prevention
- XSS protection
- Secure S3 access

## 📱 Responsive Design

Built with Material-UI components and responsive design:
- Mobile-first approach
- Tablet and desktop optimized
- Accessible UI components
- Dark/light theme support

## 🚀 Deployment

1. Configure production environment variables
2. Set up production MySQL database
3. Configure AWS S3 bucket
4. Run migrations and seeders
5. Build and deploy

## 📞 Support

For issues and questions:
1. Check the troubleshooting section
2. Review the API documentation
3. Check console logs
4. Contact the development team

## 📄 License

This project is proprietary software. All rights reserved.