# Kraft Forms

A type-safe backend API enabling authenticated users to create, manage, and share dynamic forms, while allowing public users to fill and submit these forms securely.

### Live API link: https://kraft-forms-production.up.railway.app/api

## Tech Stack

- **Language:** TypeScript
- **Runtime:** Node.js
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Validation:** Zod
- **Authentication:** JWT
- **Documentation:** OpenAPI/Swagger

## Features

- User authentication (register, login, logout)
- Create, manage, and delete forms
- Dynamic form field configuration
- Form submissions with validation
- Secure access controls
- Pagination for form submissions
- Type-safety throughout the codebase
- Interactive API documentation

## Project Structure

```
kraft-forms/
├── prisma/                     # Prisma ORM configuration
│   └── schema.prisma           # Database schema
├── src/
│   ├── controllers/            # Request handlers
│   ├── middlewares/            # Express middlewares
│   ├── models/                 # Domain models
│   ├── repositories/           # Data access layer
│   ├── routes/                 # API routes
│   ├── services/               # Business logic
│   ├── utils/                  # Utility functions
│   ├── validations/            # Input validation schemas
│   └── index.ts                # Application entry point
├── .env                        # Environment variables (not in version control)
├── .env.example                # Example environment variables
├── package.json                # Dependencies and scripts
└── tsconfig.json               # TypeScript configuration
```

## Getting Started

### Prerequisites

- Node.js 16+
- PostgreSQL 12+

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/shadan-asad/kraft-forms.git
   cd kraft-forms
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file based on `.env.example` and update with your database credentials.

4. Push the database schema:
   ```
   npm run prisma:push
   ```

5. Generate Prisma client:
   ```
   npm run prisma:generate
   ```

6. Build the application:
   ```
   npm run build
   ```

7. Start the server:
   ```
   npm start
   ```

For development, use:
```
npm run dev
```

## API Endpoints

### Authentication Routes

- **POST /api/auth/register** - Register a new user
- **POST /api/auth/login** - Login a user
- **POST /api/auth/logout** - Logout a user (requires authentication)

### Form Management Routes

- **POST /api/forms/create** - Create a new form (requires authentication)
- **DELETE /api/forms/delete/:form_id** - Delete a form (requires authentication and ownership)
- **GET /api/forms** - Get all forms for the authenticated user (requires authentication)
- **GET /api/forms/:form_id** - Get a single form by ID (public)
- **POST /api/forms/submit/:form_id** - Submit a form (public)
- **GET /api/forms/submissions/:form_id** - Get form submissions (requires authentication and ownership)

## API Documentation

The API is fully documented using OpenAPI/Swagger. In development mode, you can access the interactive API documentation at:

```
http://localhost:3000/api-docs
```

This documentation provides:
- Detailed information about all endpoints
- Request and response schemas
- Authentication requirements
- Example requests and responses
- Interactive API testing capability

The raw OpenAPI specification is available at:
```
http://localhost:3000/api-docs.json
```

## Security

- Password hashing using bcrypt
- JWT token-based authentication
- Rate limiting to prevent abuse
- Input validation and sanitization
- CORS configuration
- Form ownership verification

## Testing

Run tests with:
```
npm test
```
