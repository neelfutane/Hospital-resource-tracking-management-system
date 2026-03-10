# Hospital Resource Tracking System - Backend

The backend API server for the Hospital Resource Tracking System, built with Node.js, Express, and PostgreSQL.

## 🚀 Features

- **RESTful API** - Comprehensive endpoints for all resources
- **Real-time Updates** - Socket.io integration for live updates
- **Authentication & Authorization** - JWT-based auth with role-based access
- **Database Management** - PostgreSQL with Prisma ORM
- **Audit Logging** - Complete audit trail for all operations
- **Alert System** - Intelligent threshold-based alerting
- **Scheduled Tasks** - Automated maintenance reminders and cleanup
- **Security** - Rate limiting, input sanitization, CORS protection

## 🛠 Technology Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **PostgreSQL** - Database
- **Prisma** - ORM and database toolkit
- **Socket.io** - Real-time communication
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **node-cron** - Scheduled tasks
- **Winston** - Logging
- **Joi** - Input validation

## 📁 Project Structure

```
hospital-backend/
├── src/
│   ├── config/          # Configuration files
│   │   ├── db.js        # Database connection
│   │   ├── env.js       # Environment variables
│   │   └── socket.js    # Socket.io setup
│   ├── modules/         # Feature modules
│   │   ├── auth/        # Authentication
│   │   ├── beds/        # Bed management
│   │   ├── rooms/       # Room management
│   │   ├── equipment/   # Equipment management
│   │   ├── alerts/      # Alert system
│   │   └── audit/       # Audit logging
│   ├── middleware/      # Express middleware
│   ├── sockets/         # Socket event handlers
│   ├── utils/           # Utility functions
│   └── app.js           # Express app setup
├── prisma/
│   ├── schema.prisma    # Database schema
│   └── migrations/      # Database migrations
├── tests/               # Test files
├── .env                 # Environment variables
├── .env.example         # Environment template
├── package.json         # Dependencies
└── server.js            # Server entry point
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18.0.0+
- PostgreSQL 12.0+
- Redis (optional)

### Installation

1. **Install dependencies**
```bash
npm install
```

2. **Environment setup**
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. **Database setup**
```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# (Optional) Seed database with sample data
npx prisma db seed
```

4. **Start the server**
```bash
# Development mode
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:5000`

## 📊 Database Schema

### Core Entities

- **Users** - Hospital staff with roles and permissions
- **Beds** - Hospital beds with status and patient info
- **Rooms** - Hospital rooms with capacity tracking
- **Equipment** - Medical equipment with maintenance schedules
- **Alerts** - System alerts and notifications
- **Audit Logs** - Complete activity tracking
- **Notifications** - User-specific notifications

### Relationships

- Users can have multiple audit logs and notifications
- Resources (beds/rooms/equipment) have audit logs
- Alerts can have multiple notifications
- All resources belong to specific departments

## 🔐 Authentication

### JWT Token Structure
```json
{
  "userId": "uuid",
  "email": "user@example.com",
  "role": "DOCTOR",
  "iat": 1234567890,
  "exp": 1234567890
}
```

### Role Permissions
- **ADMIN** - Full CRUD access on all resources
- **DOCTOR** - View all, update patient-assigned resources
- **NURSE** - Update resources in their department
- **VIEWER** - Read-only access

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh JWT token
- `POST /api/auth/change-password` - Change password
- `GET /api/auth/profile` - Get user profile
- `POST /api/auth/logout` - User logout

### Beds
- `GET /api/beds` - List beds (with filtering)
- `POST /api/beds` - Create new bed
- `GET /api/beds/:id` - Get bed details
- `PUT /api/beds/:id` - Update bed
- `DELETE /api/beds/:id` - Delete bed
- `PATCH /api/beds/:id/status` - Update bed status
- `GET /api/beds/stats` - Get bed statistics

### Rooms
- `GET /api/rooms` - List rooms
- `POST /api/rooms` - Create new room
- `GET /api/rooms/:id` - Get room details
- `PUT /api/rooms/:id` - Update room
- `DELETE /api/rooms/:id` - Delete room
- `PATCH /api/rooms/:id/status` - Update room status
- `PATCH /api/rooms/:id/occupancy` - Update room occupancy
- `GET /api/rooms/stats` - Get room statistics

### Equipment
- `GET /api/equipment` - List equipment
- `POST /api/equipment` - Create new equipment
- `GET /api/equipment/:id` - Get equipment details
- `PUT /api/equipment/:id` - Update equipment
- `DELETE /api/equipment/:id` - Delete equipment
- `PATCH /api/equipment/:id/status` - Update equipment status
- `POST /api/equipment/:id/schedule-maintenance` - Schedule maintenance
- `POST /api/equipment/:id/complete-maintenance` - Complete maintenance
- `GET /api/equipment/due-for-maintenance` - Get equipment due for maintenance
- `GET /api/equipment/stats` - Get equipment statistics

### Alerts
- `GET /api/alerts` - List alerts
- `POST /api/alerts` - Create new alert
- `GET /api/alerts/:id` - Get alert details
- `POST /api/alerts/:id/acknowledge` - Acknowledge alert
- `POST /api/alerts/:id/resolve` - Resolve alert
- `POST /api/alerts/check-thresholds` - Run threshold checks
- `GET /api/alerts/stats` - Get alert statistics

### Audit
- `GET /api/audit` - List audit logs
- `GET /api/audit/:id` - Get audit log details
- `GET /api/audit/export` - Export audit logs (CSV/PDF)
- `GET /api/audit/recent` - Get recent activity
- `GET /api/audit/stats` - Get audit statistics

## 📡 Real-time Events

### Socket Events

#### Client to Server
- `join-department` - Join department room
- `leave-department` - Leave department room
- `join-role` - Join role room

#### Server to Client
- `resource-update` - Resource updated
- `resource-create` - Resource created
- `resource-delete` - Resource deleted
- `status-change` - Status changed
- `stats-update` - Statistics updated
- `new-alert` - New alert created
- `alert-acknowledged` - Alert acknowledged
- `alert-resolved` - Alert resolved
- `threshold-alert` - Threshold alert
- `emergency-alert` - Emergency alert
- `maintenance-reminder` - Maintenance reminder
- `notification` - User notification
- `system-alert` - System alert

## ⚙️ Configuration

### Environment Variables

```env
# Database
DATABASE_URL="postgresql://user:pass@localhost:5432/hospital_db"

# JWT
JWT_SECRET="your-secret-key"
JWT_EXPIRES_IN="7d"

# Server
PORT=5000
NODE_ENV="development"

# Redis (optional)
REDIS_URL="redis://localhost:6379"

# Email
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"

# Alert Thresholds
ICU_BED_THRESHOLD=3
VENTILATOR_THRESHOLD=2
GENERAL_BED_THRESHOLD=10

# CORS
FRONTEND_URL="http://localhost:3000"
```

## 🔧 Development

### Running Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

### Database Management
```bash
# Generate Prisma client
npx prisma generate

# Create new migration
npx prisma migrate dev --name migration_name

# Reset database
npx prisma migrate reset

# View database
npx prisma studio
```

### Code Quality
```bash
# Lint code
npm run lint

# Format code
npm run format

# Type check
npm run type-check
```

## 🚨 Error Handling

### Global Error Handler
The app includes a comprehensive error handler that:
- Logs all errors with Winston
- Handles validation errors gracefully
- Provides appropriate HTTP status codes
- Returns structured error responses
- Includes stack traces in development

### Common Error Types
- **Validation Errors** - 400 Bad Request
- **Authentication Errors** - 401 Unauthorized
- **Authorization Errors** - 403 Forbidden
- **Not Found Errors** - 404 Not Found
- **Conflict Errors** - 409 Conflict
- **Rate Limit Errors** - 429 Too Many Requests
- **Server Errors** - 500 Internal Server Error

## 📝 Logging

### Log Levels
- **Error** - Error messages and exceptions
- **Warn** - Warning messages
- **Info** - General information
- **Debug** - Debug information (development only)

### Log Files
- `logs/error.log` - Error logs
- `logs/combined.log` - All logs

## 🔄 Scheduled Tasks

### Cron Jobs
- **Threshold Checks** - Every 5 minutes
- **Maintenance Reminders** - Every hour
- **Cleanup Tasks** - Daily at midnight

### Alert Thresholds
- ICU beds below threshold
- Ventilators below threshold
- General beds below threshold
- Equipment maintenance due

## 🛡️ Security

### Security Features
- **JWT Authentication** - Secure token-based auth
- **Password Hashing** - bcrypt with salt rounds
- **Rate Limiting** - Prevent API abuse
- **Input Sanitization** - Prevent injection attacks
- **CORS Protection** - Cross-origin security
- **Helmet.js** - HTTP security headers
- **Request Validation** - Joi schema validation

### Security Best Practices
- Environment variables for sensitive data
- SQL injection prevention with Prisma
- XSS protection with input sanitization
- Secure password policies
- Token expiration and refresh

## 📊 Monitoring

### Health Check
- `GET /health` - Basic health status
- Returns server status, timestamp, and environment

### Performance Metrics
- Request logging with Morgan
- Response time tracking
- Error rate monitoring
- Database query performance

## 🚀 Deployment

### Production Setup
1. **Environment Configuration**
```bash
export NODE_ENV=production
export DATABASE_URL="postgresql://user:pass@host:5432/hospital_prod"
```

2. **Database Migration**
```bash
npx prisma migrate deploy
npx prisma generate
```

3. **Start Server**
```bash
npm start
```

### Docker Deployment
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npx prisma generate
EXPOSE 5000
CMD ["npm", "start"]
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new features
5. Ensure all tests pass
6. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details
