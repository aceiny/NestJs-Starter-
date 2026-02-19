# Error Handling

The template comes with a **global exception filter** that catches every error and returns a consistent JSON response. You never need to worry about uncaught exceptions leaking stack traces to clients.

---

## Response Format

Every error response follows this shape:

```json
{
  "success": false,
  "error": {
    "statusCode": 400,
    "message": "Validation failed",
    "errors": [
      "title should not be empty",
      "email must be a valid email"
    ],
    "timestamp": "2024-01-15T10:30:00.000Z",
    "path": "/api/v1/users"
  }
}
```

And every successful response follows:

```json
{
  "success": true,
  "data": { ... },
  "meta": { ... }
}
```

This makes it easy for frontend consumers to check `response.success` and handle accordingly.

---

## Global Exception Filter

Located at `src/common/filters/global-exception.filter.ts`, this filter is registered globally in `CreateServer` and handles three categories of errors:

### 1. HTTP Exceptions

Any `HttpException` (or subclass like `NotFoundException`, `BadRequestException`, etc.) is caught and formatted.

When `class-validator` returns validation errors, NestJS throws a `BadRequestException` with `message` as a `string[]`. The filter detects this and returns:

```json
{
  "success": false,
  "error": {
    "statusCode": 400,
    "message": "Validation failed",
    "errors": ["title should not be empty", "price must be a positive number"]
  }
}
```

### 2. Database Errors (TypeORM)

`QueryFailedError` is caught and translated:

| Scenario                        | Status | Message                     |
| ------------------------------- | ------ | --------------------------- |
| Foreign key constraint violation | `404`  | "Referenced record not found" |
| Other query failures            | `400`  | "Database query failed"      |

This prevents raw SQL errors from leaking to clients.

### 3. Unknown Errors

Anything else returns a generic `500 Internal Server Error`. The actual error details are logged server-side but never sent to the client.

---

## Logging

The filter logs every error with contextual information:

- **HTTP method and URL** — `[POST] /api/v1/users → HTTP 400: Bad Request`
- **Stack trace** — for debugging
- **Sanitized request body** — sensitive fields like `password`, `token`, `secret`, `authorization` are replaced with `[REDACTED]` before logging

This means you can debug issues from logs without worrying about passwords showing up in log files.

---

## BusinessException

For domain/business logic errors that don't fit standard HTTP exceptions, use `BusinessException`:

```typescript
import { BusinessException } from 'src/common';
import { HttpStatus } from '@nestjs/common';

// Default: 422 Unprocessable Entity
throw new BusinessException('Insufficient account balance');

// Custom status code
throw new BusinessException('Trial period has expired', HttpStatus.PAYMENT_REQUIRED);
```

Output:

```json
{
  "success": false,
  "error": {
    "statusCode": 422,
    "message": "Insufficient account balance",
    "timestamp": "...",
    "path": "/api/v1/transactions"
  }
}
```

---

## Standard NestJS Exceptions Still Work

You can still throw any built-in NestJS exception and the filter handles it:

```typescript
import { NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';

throw new NotFoundException('User not found');
throw new ConflictException('Email already exists');
throw new ForbiddenException('You do not have access to this resource');
```

---

## Transform Response Interceptor

The `TransformResponseInterceptor` (registered globally) wraps all successful responses in the standard envelope:

```typescript
// Your controller returns:
return { id: 1, name: 'Alice' };

// Client receives:
{ "success": true, "data": { "id": 1, "name": "Alice" } }
```

If your response already has a `success` field, it's returned as-is (no double-wrapping).

If your response contains a `meta` field (like paginated responses), it's extracted and placed at the top level of the envelope.

---

## Timeout Interceptor

The `TimeoutInterceptor` (also registered globally) enforces a request timeout. If a handler takes too long to respond, it throws a `408 Request Timeout`:

```json
{
  "success": false,
  "error": {
    "statusCode": 408,
    "message": "Request timed out",
    "timestamp": "...",
    "path": "/api/v1/reports/generate"
  }
}
```

Default timeout: **30 seconds** (configurable via `DEFAULT_TIMEOUT_MS`).
