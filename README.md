# StarQuest Backend 🚀

[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-4.9+-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Express.js](https://img.shields.io/badge/Express.js-4.18+-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-5.0+-47A248?style=flat-square&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=flat-square&logo=docker&logoColor=white)](https://www.docker.com/)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg?style=flat-square)](LICENSE)

> **Production-ready RESTful API powering the StarQuest gamified learning platform**

StarQuest Backend is an enterprise-grade Node.js API that provides comprehensive user management, workspace collaboration, quest management, and progress tracking for a gamified learning ecosystem. Built with security-first principles, scalable architecture, and production deployment in mind.

**🌐 Live Demo**: [StarQuest Platform](https://starquest.app) | **⚡ API Health**: [Health Check](https://api.starquest.app/api/health)

---

## 📋 Table of Contents

- [🛠️ Tech Stack](#️-tech-stack)
- [🏗️ Architecture](#️-architecture)
- [🔐 Security Implementation](#-security-implementation)
- [🚀 Quick Start](#-quick-start)
- [🐳 Docker Deployment](#-docker-deployment)
- [📝 API Routes](#-api-routes)
- [📊 Logging & Monitoring](#-logging--monitoring)
- [🧪 Testing](#-testing)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)

---

## 🛠️ Tech Stack

| Category | Technology | Version | Purpose |
|----------|------------|---------|---------|
| **Runtime** | Node.js | 18+ | JavaScript runtime environment |
| **Framework** | Express.js | 4.18+ | Web application framework |
| **Language** | TypeScript | 4.9+ | Type-safe JavaScript development |
| **Database** | MongoDB | 5.0+ | Document database with Mongoose ODM |
| **Validation** | Zod | 3.22+ | TypeScript-first schema validation |
| **Authentication** | JWT + Sessions | - | Hybrid authentication strategy |
| **Security** | Helmet, CORS, CSRF | - | Comprehensive security middleware |
| **Logging** | Winston | 3.12+ | Structured logging with daily rotation |
| **Containerization** | Docker | - | Multi-stage production builds |
| **Email** | SendGrid | - | Transactional email service |
| **File Storage** | AWS S3 | - | Cloud file storage with presigned URLs |

---

## 🏗️ Architecture

### Layered MVC Design Pattern

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   HTTP Request  │ →  │   Middleware     │ →  │   Controllers   │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                              │                          │
                              ▼                          ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Database      │ ←  │     Models       │ ←  │    Services     │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

### Core Components

| Component | Location | Responsibility |
|-----------|----------|----------------|
| **Controllers** | `src/api/controllers/` | HTTP request handling, response formatting |
| **Services** | `src/api/services/` | Business logic, external integrations |
| **Models** | `src/api/models/` | Data schemas, validation, database operations |
| **Middleware** | `src/api/middleware/` | Security, authentication, validation, logging |
| **Routes** | `src/api/routes/` | API endpoint definitions and mounting |
| **Validations** | `src/api/validations/` | Zod schemas for request validation |
| **Types** | `src/api/types/` | TypeScript interfaces and type definitions |
| **Utils** | `src/api/utils/` | Helper functions, error handling, responses |

### Error Handling Strategy

- **AppError Class**: Distinguishes operational vs programming errors
- **catchAsync Wrapper**: Consistent async error handling across all controllers
- **Global Error Handler**: Environment-specific error responses (detailed in dev, user-friendly in prod)
- **Database Error Mapping**: Automatic Mongoose validation, cast, and duplicate error handling

---

## 🔐 Security Implementation

### Authentication & Authorization
- **Hybrid Authentication**: JWT tokens + Express sessions for maximum flexibility
- **Password Security**: bcrypt hashing with 12 salt rounds
- **Role-Based Access Control**: Admin/user role restrictions with middleware
- **Session Management**: MongoDB-backed sessions with secure cookie configuration

### Request Security
- **CORS**: Environment-based origin validation with credentials support
- **CSRF Protection**: Token-based validation for state-changing requests (POST, PUT, DELETE)
- **Rate Limiting**: 100 requests/minute per IP with health check exemptions
- **Input Sanitization**: MongoDB injection prevention and HTTP parameter pollution protection

### Security Headers & Cookies
- **Helmet.js**: Comprehensive security headers (CSP, XSS, HSTS, DNS prefetch control)
- **Content Security Policy**: Production-safe directives excluding `unsafe-eval`
- **Secure Cookies**: `httpOnly`, `secure`, and environment-specific `sameSite` configurations
- **Cross-Origin Support**: Proper CORS and cookie settings for production deployment

---

## 🚀 Quick Start

### Prerequisites
```bash
Node.js 18+
MongoDB 5.0+
npm/yarn
```

### Installation

1. **Clone and setup**
```bash
git clone <repository-url>
cd starquestDevServer
npm install
```

2. **Environment Configuration**

Create `.env` (development) or `.env.production` file:

```env
# Database
DATABASE=mongodb://localhost:27017/starquest
DATABASE_PASSWORD=your_db_password

# Authentication
JWT_SECRET=your_jwt_secret_32_chars_minimum
SESSION_SECRET=your_session_secret_32_chars_minimum
JWT_EXPIRES_IN=7d
JWT_COOKIE_EXPIRES_IN=7

# Server Configuration
NODE_ENV=development
PORT=6550

# CORS & Client URLs
CORS_ORIGIN=http://localhost:3000,http://localhost:5173
CLIENT_PROD_URL=https://starquest.app
CLIENT_DEV_URL=http://localhost:3000

# Email Service (SendGrid)
SENDGRID_API_KEY=your_sendgrid_api_key
EMAIL_FROM_ADDRESS=noreply@starquest.app
EMAIL_FROM_NAME=StarQuest Team

# AWS S3 (Optional)
BUCKET_NAME=your_bucket_name
BUCKET_REGION=your_region
ACCESS_KEY=your_access_key
SECRET_ACCESS_KEY=your_secret_key
```

3. **Development**
```bash
npm run dev          # Development with hot reload
npm run build        # TypeScript compilation
npm start            # Production server
```

---

## 🐳 Docker Deployment

### Production-Optimized Container

The application includes a **multi-stage Dockerfile** with enterprise-grade security:

- ✅ **Alpine Linux**: Minimal attack surface
- ✅ **Non-root User**: Security-focused container execution (`starquest:1001`)
- ✅ **dumb-init**: Proper signal handling for graceful shutdowns
- ✅ **Health Checks**: Application and container-level monitoring
- ✅ **Multi-stage Build**: Separate build and runtime environments

### Usage

```bash
# Build and run with Docker Compose
docker-compose up -d

# Health verification
docker-compose ps
curl http://localhost:6550/api/health

# View logs
docker-compose logs starquest-backend -f
```

### Container Features
- **Port**: 6550 (configurable via `PORT` environment variable)
- **Health Endpoint**: `/api/health` with 30s interval checks
- **Log Management**: JSON format with automatic rotation
- **Graceful Shutdown**: Proper SIGTERM handling

---

## 📝 API Routes

The API is accessible at `http://localhost:6550/api` with the following endpoints:

| Route Group | Base Path | Description |
|-------------|-----------|-------------|
| **Authentication** | `/api/auth/*` | User signup, login, email verification, password reset |
| **User Management** | `/api/users/*` | Profile management, user data operations |
| **Workspace Management** | `/api/workspace/*` | Workspace creation, collaboration, user invitations |
| **Quest System** | `/api/quest/*` | Quest creation, management, progress tracking |
| **Task Management** | `/api/workspace/tasks/*` | Task operations within workspaces |
| **Position Management** | `/api/workspace/positions/*` | User position and role management |
| **Daily Reports** | `/api/daily-reports/*` | Daily progress and activity reporting |
| **Weekly Reports** | `/api/weekly-reports/*` | Weekly summary and analytics |
| **General Reports** | `/api/reports/*` | Comprehensive reporting system |
| **Leaderboards** | `/api/leaderboard/*` | Performance rankings and statistics |
| **Dashboard Analytics** | `/api/dashboard/*` | Dashboard data and insights |
| **System Administration** | `/api/system/*` | Admin-only system management |
| **Health Monitoring** | `/api/health` | Application health and status checks |

### Development Email Testing (Non-Production Only)
- `POST /api/auth/test-sendgrid-connection` - Verify SendGrid configuration
- `POST /api/auth/send-test-email` - Send test emails
- `POST /api/auth/test-verification-email` - Test verification email templates

---

## 📊 Logging & Monitoring

### Winston Logger Configuration
- **Log Levels**: `error`, `warn`, `info`, `http`, `debug`
- **File Rotation**: Daily rotation with 14-day retention
- **Output Formats**: Colorized console (dev) + JSON files (prod)
- **Error Isolation**: Separate error logs for critical issue tracking

### Log File Structure
```
logs/
├── error-YYYY-MM-DD.log    # Error-level logs only
└── all-YYYY-MM-DD.log      # Complete application logs
```

### Production Monitoring Recommendations

| Service Type | Recommended Solutions |
|--------------|----------------------|
| **APM** | New Relic, DataDog, Elastic APM |
| **Error Tracking** | Sentry, Bugsnag, Rollbar |
| **Metrics & Dashboards** | Prometheus + Grafana |
| **Uptime Monitoring** | Pingdom, UptimeRobot |
| **Log Aggregation** | ELK Stack, Splunk |

---

## 🧪 Testing

> **Current Status**: Test suite implementation pending

### Recommended Testing Stack
- **Framework**: Jest with TypeScript support
- **API Testing**: Supertest for HTTP endpoint testing
- **Database**: MongoDB Memory Server for isolated test environments
- **Coverage**: Istanbul/nyc for comprehensive code coverage reporting

### Suggested Test Structure
```
tests/
├── unit/
│   ├── services/           # Business logic unit tests
│   ├── models/            # Database model tests
│   └── utils/             # Utility function tests
├── integration/
│   ├── auth.test.ts       # Authentication flow tests
│   ├── users.test.ts      # User management tests
│   └── workspaces.test.ts # Workspace functionality tests
└── fixtures/
    └── testData.ts        # Test data and mocks
```

---

## 🤝 Contributing

We welcome contributions from the community! Please follow these guidelines:

### Development Workflow
```bash
# Fork and clone the repository
git clone <your-fork-url>
cd starquestDevServer

# Install dependencies
npm install

# Create a feature branch
git checkout -b feature/your-feature-name

# Start development server
npm run dev

# Run linting and formatting
npm run lint
npm run format
```

### Code Standards
1. **TypeScript**: Ensure compilation passes (`npm run build`)
2. **Architecture**: Follow existing MVC patterns and service layer structure
3. **Validation**: Add Zod schemas for new API endpoints
4. **Error Handling**: Use `catchAsync` wrapper for consistent error management
5. **Documentation**: Update README and API documentation for significant changes
6. **Security**: Follow established security patterns for authentication and validation

---

## 📄 License

This project is licensed under the **ISC License**.

---

## 🔗 Related Repositories

- **Frontend Application**: [StarQuest Client](https://github.com/your-org/starquest-client) - React-based web application
- **Mobile Application**: [StarQuest Mobile](https://github.com/your-org/starquest-mobile) - React Native mobile app

---

<div align="center">
  <p><strong>Built with ❤️ for gamified learning experiences</strong></p>
  <p>
    <a href="https://starquest.app">🌐 Live Demo</a> •
    <a href="https://api.starquest.app/api/health">⚡ API Status</a> •
    <a href="https://api.starquest.app/docs">📚 API Docs</a>
  </p>
</div>
