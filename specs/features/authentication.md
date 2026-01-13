# User Authentication and Registration

## Overview
This specification defines the user authentication and registration workflows for the GitHub CI/CD Demo application.

## User Stories

### US-001: User Registration
**As a** new user  
**I want to** create an account  
**So that** I can access the application features

#### Acceptance Criteria
- User can access registration form at `/register`
- Form requires: First Name, Last Name, Email, Password (min 8 chars)
- Email must be unique in the system
- Password must be hashed before storage
- Upon successful registration, user is automatically logged in
- User is redirected to products page
- Session is created with user details

#### Validation Rules
- Email format must be valid
- Password minimum 8 characters
- All fields are required
- Email uniqueness check before account creation

### US-002: User Login
**As a** registered user  
**I want to** log in to my account  
**So that** I can access my personalized features

#### Acceptance Criteria
- User can access login form at `/login`
- Form requires: Email and Password
- Valid credentials create a session
- Invalid credentials show error message
- Successful login redirects to products page
- Last login timestamp is updated

#### Security Requirements
- Passwords compared using bcrypt
- Failed login attempts logged
- Session expires after 24 hours
- HTTPS required in production

### US-003: User Logout
**As a** logged-in user  
**I want to** log out of my account  
**So that** I can protect my privacy

#### Acceptance Criteria
- Logout link visible in navigation when logged in
- Clicking logout destroys session
- User redirected to home page
- Cart data persists in database

## API Endpoints

### POST /api/auth/register
**Request:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "password": "SecurePass123!"
}
```

**Response (201):**
```json
{
  "message": "User registered successfully",
  "user": {
    "userId": 1,
    "email": "john.doe@example.com",
    "firstName": "John",
    "lastName": "Doe"
  }
}
```

### POST /api/auth/login
**Request:**
```json
{
  "email": "john.doe@example.com",
  "password": "SecurePass123!"
}
```

**Response (200):**
```json
{
  "message": "Login successful",
  "user": {
    "userId": 1,
    "email": "john.doe@example.com",
    "firstName": "John",
    "lastName": "Doe"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### POST /api/auth/logout
**Response (200):**
```json
{
  "message": "Logout successful"
}
```

## Database Schema

### Users Table
```sql
CREATE TABLE Users (
  UserId INT IDENTITY(1,1) PRIMARY KEY,
  Email NVARCHAR(255) NOT NULL UNIQUE,
  PasswordHash NVARCHAR(255) NOT NULL,
  FirstName NVARCHAR(100) NOT NULL,
  LastName NVARCHAR(100) NOT NULL,
  CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
  LastLoginAt DATETIME2 NULL,
  IsActive BIT NOT NULL DEFAULT 1
)
```

## Testing Requirements

### Unit Tests
- Password hashing function
- Email validation
- Session creation

### Integration Tests
- Registration endpoint with valid data
- Registration with duplicate email
- Login with valid credentials
- Login with invalid credentials
- Logout functionality

### E2E Tests
- Complete registration workflow
- Complete login workflow
- Logout workflow
- Form validation

## Security Considerations
- Passwords never stored in plain text
- Sessions use secure cookies in production
- Rate limiting on auth endpoints
- CSRF protection enabled
- SQL injection prevention through parameterized queries
