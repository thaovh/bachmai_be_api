# BM Backend

A NestJS backend application with PostgreSQL, CQRS, JWT authentication, and Swagger documentation.

## Features

- NestJS framework
- PostgreSQL database with TypeORM
- CQRS pattern implementation
- JWT authentication with refresh tokens
- Soft delete functionality
- Swagger API documentation
- Rate limiting
- Request validation
- Standardized response format
- Error handling

## Prerequisites

- Node.js (v16 or later)
- PostgreSQL
- npm or yarn

## Installation

1. Clone the repository
```bash
git clone <repository-url>
cd bm_backend
```

2. Install dependencies
```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:
```env
# Database Configuration
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=bm_backend

# JWT Configuration
JWT_SECRET=your-secret-key
JWT_EXPIRATION=1h
REFRESH_TOKEN_SECRET=your-refresh-secret-key
REFRESH_TOKEN_EXPIRATION=7d

# Application Configuration
PORT=3000
NODE_ENV=development

# Rate Limiting
THROTTLE_TTL=60
THROTTLE_LIMIT=10
```

4. Run the application
```bash
# Development
npm run start:dev

# Production
npm run build
npm run start:prod
```

## API Documentation

Once the application is running, you can access the Swagger documentation at:
```
http://localhost:3000/api
```

## Project Structure

```
src/
├── auth/                 # Authentication module
├── users/               # Users module
├── common/              # Common utilities
│   ├── decorators/      # Custom decorators
│   ├── guards/          # Guards
│   ├── interceptors/    # Interceptors
│   ├── interfaces/      # Interfaces
│   └── utils/           # Utility functions
├── config/              # Configuration files
├── database/            # Database related files
│   ├── entities/        # TypeORM entities
│   └── migrations/      # Database migrations
└── shared/              # Shared components
    ├── commands/        # CQRS commands
    ├── queries/         # CQRS queries
    └── events/          # CQRS events
```

## License

This project is licensed under the MIT License.
