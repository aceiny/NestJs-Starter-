# Security & Middleware

Everything security-related is configured in `CreateServer` (`src/cmd/create.server.ts`) and applied globally. Here's what's set up and how it works.

---

## Server Bootstrap Flow

When the app starts, `CreateServer` configures middleware in this order:

1. **Swagger** — API documentation (disabled in production)
2. **Body parser** — JSON with 100 MB limit and raw body retention
3. **Trust proxy** — for apps behind Nginx, load balancers, etc.
4. **Cookie parser** — reads cookies from incoming requests
5. **CORS** — cross-origin request policy
6. **Validation pipe** — DTO validation on all incoming requests
7. **Helmet** — security HTTP headers
8. **Global exception filter** — catches all errors
9. **Global interceptors** — timeout + response transformation

---

## CORS

Configured in `src/config/cors.config.ts`. Uses typed NestJS config — no raw `process.env`.

**In development:** allows `localhost:3000-3003` plus any platform URLs.  
**In production:** only platform URLs are allowed.

```typescript
// The CORS config is built from typed config values
const corsOptions = buildCorsConfig(appCfg, platformCfg);
server.enableCors(corsOptions);
```

Settings:
- `credentials: true` — cookies are sent cross-origin
- Methods: `GET`, `POST`, `PUT`, `PATCH`, `DELETE`

To add more dev origins, edit the `DEV_ORIGINS` array in `cors.config.ts`.

---

## Helmet

[Helmet](https://helmetjs.github.io/) sets security-related HTTP headers automatically:

- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: SAMEORIGIN`
- `Strict-Transport-Security` (HSTS)
- Removes `X-Powered-By`
- Content Security Policy defaults
- And more

No configuration needed — it's applied with sensible defaults.

---

## Validation Pipe

Configured in `src/config/validation-pipe.config.ts` and applied globally.

| Setting                    | Value   | What it does                                               |
| -------------------------- | ------- | ---------------------------------------------------------- |
| `whitelist`                | `true`  | Strips properties not in the DTO                           |
| `forbidNonWhitelisted`     | `true`  | Throws an error if unknown properties are sent             |
| `transform`                | `true`  | Automatically transforms payloads to DTO class instances   |
| `enableImplicitConversion` | `true`  | Converts query string values to their expected types       |

This means:
- If your DTO has `title` and `price`, and someone sends `title`, `price`, and `hackField`, the `hackField` is rejected with a 400 error.
- Query params like `?page=2` are automatically converted from string `"2"` to number `2`.

### Using with DTOs

```typescript
import { IsString, IsNumber, Min, IsOptional } from 'class-validator';

export class CreateProductDto {
  @IsString()
  title: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsOptional()
  @IsString()
  description?: string;
}
```

The validation pipe automatically validates incoming data against this class.

---

## Body Parser

JSON body parser is configured with:

- **100 MB limit** — handles large payloads (file metadata, bulk operations)
- **Raw body preservation** — the original buffer is stored as `req.rawBody`, useful for webhook signature verification

---

## Cookie Parser

Enabled globally. Parses `Cookie` headers and populates `req.cookies`.

```typescript
@Get('me')
getProfile(@Req() req: Request) {
  const sessionToken = req.cookies['session'];
}
```

---

## Trust Proxy

```typescript
server.set('trust proxy', true);
```

Required when running behind a reverse proxy (Nginx, AWS ALB, Cloudflare). Without this, `req.ip` and `req.protocol` would reflect the proxy's values instead of the real client's.

---

## Decorators

### `@Public()`

Marks a route as publicly accessible. Use this when you have a global auth guard and need to skip it for specific endpoints.

```typescript
import { Public } from 'src/common';

@Controller('auth')
export class AuthController {
  @Public()
  @Post('login')
  login(@Body() dto: LoginDto) {
    // No authentication required
  }
}
```

Internally sets `isPublic: true` metadata. Your auth guard should check for `IS_PUBLIC_KEY`:

```typescript
const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
  context.getHandler(),
  context.getClass(),
]);
if (isPublic) return true;
```

### `@Serialize()`

Applies `ClassSerializerInterceptor` to a controller or method. Entities with `@Exclude()` decorators will have those fields stripped from responses.

```typescript
import { Serialize } from 'src/common';
import { Exclude } from 'class-transformer';

class User {
  id: number;
  email: string;

  @Exclude()
  password: string;
}

@Serialize()
@Controller('users')
export class UserController {
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id); // password is excluded from response
  }
}
```

### `@Pagination()`

See the [Pagination docs](./PAGINATION.md).

---

## Pipes

### `ParseDatePipe`

Validates and parses a string parameter as a `Date`. Throws `400 Bad Request` if invalid.

```typescript
@Get('events')
findByDate(@Query('date', ParseDatePipe) date: Date) {
  // date is a valid Date object
}
```

### `ParseUUIDPipe`

Validates that a string is a valid UUID v4. Throws `400 Bad Request` if invalid.

```typescript
@Get(':id')
findOne(@Param('id', ParseUUIDPipe) id: string) {
  // id is guaranteed to be a valid UUID
}
```

---

## Swagger / API Documentation

Configured in `src/config/swagger.config.ts`. Automatically disabled in production.

Features:
- Bearer auth (JWT) configured with `session-auth` security scheme
- Persistent authorization (stays across page reloads)
- Search/filter endpoints
- Request duration display
- Multiple server entries for development

Access at: `http://localhost:<PORT>/docs`
