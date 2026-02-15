# Standard Error Response Format

All API endpoints follow a consistent error response format for better client-side error handling.

## Format

```typescript
{
  error: {
    message: string,        // Human-readable error message
    code?: string,          // Optional error code for programmatic handling
    details?: any           // Optional additional context (e.g., validation errors)
  }
}
```

## Common HTTP Status Codes

| Status | Meaning | Example Use Case |
|--------|---------|------------------|
| 400 | Bad Request | Invalid input, validation failed |
| 401 | Unauthorized | Missing or invalid authentication token |
| 403 | Forbidden | Authenticated but lacking required permissions |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Resource already exists (e.g., duplicate email) |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Unexpected server error |

## Examples

### Simple Error
```json
{
  "error": {
    "message": "User not found"
  }
}
```

### Error with Code
```json
{
  "error": {
    "message": "Insufficient permissions to access this resource",
    "code": "FORBIDDEN"
  }
}
```

### Validation Error with Details
```json
{
  "error": {
    "message": "Validation failed",
    "code": "VALIDATION_ERROR",
    "details": {
      "email": "Invalid email format",
      "password": "Password must be at least 8 characters"
    }
  }
}
```

### Rate Limit Error
```json
{
  "error": {
    "message": "Too many authentication attempts. Please try again in a minute.",
    "code": "RATE_LIMIT_EXCEEDED"
  }
}
```

## Implementation

### Next.js API Routes

```typescript
import { NextResponse } from 'next/server'

// Simple error
return NextResponse.json(
  { error: { message: 'User not found' } },
  { status: 404 }
)

// Error with code
return NextResponse.json(
  { error: { message: 'Unauthorized', code: 'AUTH_REQUIRED' } },
  { status: 401 }
)

// Validation error
return NextResponse.json(
  {
    error: {
      message: 'Validation failed',
      code: 'VALIDATION_ERROR',
      details: validation.error.format()
    }
  },
  { status: 400 }
)
```

### Error Code Constants

```typescript
export const ERROR_CODES = {
  // Authentication & Authorization
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  EMAIL_NOT_VERIFIED: 'EMAIL_NOT_VERIFIED',

  // Validation
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_INPUT: 'INVALID_INPUT',

  // Resources
  NOT_FOUND: 'NOT_FOUND',
  ALREADY_EXISTS: 'ALREADY_EXISTS',

  // Rate Limiting
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',

  // Server
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
} as const
```

## Client-Side Handling

```typescript
try {
  const response = await fetch('/api/endpoint')
  const data = await response.json()

  if (!response.ok) {
    // All errors have the same format
    const errorMessage = data.error?.message || 'An error occurred'
    const errorCode = data.error?.code

    if (errorCode === 'VALIDATION_ERROR') {
      // Handle validation errors with details
      console.error('Validation errors:', data.error.details)
    }

    throw new Error(errorMessage)
  }

  return data
} catch (error) {
  // Handle error
}
```
