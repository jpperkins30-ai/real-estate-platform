# Authentication API Documentation

## Overview
The Authentication API provides endpoints for user registration, login, and password reset functionality. It uses JWT (JSON Web Tokens) for secure authentication and bcrypt for password hashing.

## Endpoints

### Register User
```
POST /api/auth/register
```

#### Request Body
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

#### Validation Rules
- Email must be a valid email address
- Password must:
  - Be at least 6 characters long
  - Contain at least one number

#### Response
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "user_id",
    "email": "user@example.com",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### Example Request
```bash
curl -X POST 'http://your-api/api/auth/register' \
  -H 'Content-Type: application/json' \
  -d '{
    "email": "user@example.com",
    "password": "securePassword123"
  }'
```

### Login User
```
POST /api/auth/login
```

#### Request Body
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

#### Validation Rules
- Email must be a valid email address
- Password is required

#### Response
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "user_id",
    "email": "user@example.com",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### Example Request
```bash
curl -X POST 'http://your-api/api/auth/login' \
  -H 'Content-Type: application/json' \
  -d '{
    "email": "user@example.com",
    "password": "securePassword123"
  }'
```

### Request Password Reset
```
POST /api/auth/forgot-password
```

#### Request Body
```json
{
  "email": "user@example.com"
}
```

#### Validation Rules
- Email must be a valid email address

#### Response
```json
{
  "message": "If an account exists with this email, a password reset link has been sent"
}
```

#### Example Request
```bash
curl -X POST 'http://your-api/api/auth/forgot-password' \
  -H 'Content-Type: application/json' \
  -d '{
    "email": "user@example.com"
  }'
```

### Reset Password
```
POST /api/auth/reset-password
```

#### Request Body
```json
{
  "token": "reset_token_from_email",
  "password": "newSecurePassword123"
}
```

#### Validation Rules
- Token is required
- Password must:
  - Be at least 6 characters long
  - Contain at least one number

#### Response
```json
{
  "message": "Password has been successfully reset"
}
```

#### Example Request
```bash
curl -X POST 'http://your-api/api/auth/reset-password' \
  -H 'Content-Type: application/json' \
  -d '{
    "token": "reset_token_from_email",
    "password": "newSecurePassword123"
  }'
```

## Error Responses

### 400 Bad Request
Returned when request validation fails.

```json
{
  "errors": [
    {
      "msg": "Password must be at least 6 characters long",
      "param": "password",
      "location": "body"
    }
  ]
}
```

### 401 Unauthorized
Returned when login credentials are invalid.

```json
{
  "error": "Invalid email or password"
}
```

### 404 Not Found
Returned when a user is not found.

```json
{
  "error": "User not found"
}
```

### 500 Internal Server Error
Returned when an unexpected error occurs.

```json
{
  "error": "Internal server error"
}
```

## Security Considerations

### Password Storage
- Passwords are hashed using bcrypt before storage
- Salt rounds are automatically managed by bcrypt
- Original passwords are never stored

### JWT Token
- Tokens expire after 24 hours
- Contains user ID and email in payload
- Signed with a secure secret key
- Should be stored securely on the client side

### Password Reset
- Reset tokens expire after 1 hour
- One-time use only
- Sent via secure email
- Previous tokens are invalidated when:
  - Password is successfully reset
  - New reset token is requested
  - Token expires

## Rate Limiting
- Maximum 5 login attempts per minute per IP
- Maximum 3 password reset requests per hour per email
- Maximum 100 registration attempts per day per IP

## Best Practices

### Client Implementation
1. Store JWT token securely (e.g., HttpOnly cookies)
2. Implement token refresh mechanism
3. Clear tokens on logout
4. Handle expired tokens gracefully

### Security
1. Use HTTPS in production
2. Implement CORS properly
3. Validate input on client side
4. Handle errors gracefully
5. Log security events

### Password Reset Flow
1. Request reset token
2. Check email for reset link
3. Click link to open reset page
4. Submit new password with reset token
5. Redirect to login after success

## Email Templates

### Password Reset Email
```html
<div style="max-width: 600px; margin: 0 auto; padding: 20px;">
  <h2>Password Reset Request</h2>
  <p>Hello,</p>
  <p>We received a request to reset your password. Click the button below to reset it:</p>
  <a href="{resetLink}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">
    Reset Password
  </a>
  <p>This link will expire in 1 hour.</p>
  <p>If you didn't request this, please ignore this email.</p>
</div>
``` 