# Pagination

The template includes a **callback-based pagination system** that works with any data source — TypeORM, raw SQL, an external API, or an in-memory array. It's completely decoupled from your ORM.

---

## Quick Example

```typescript
import { Controller, Get } from '@nestjs/common';
import { Pagination, paginate } from 'src/common';
import type { PaginationOptions, PaginatedResponse } from 'src/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Controller('users')
export class UserController {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  @Get()
  async findAll(
    @Pagination() pagination: Required<PaginationOptions>,
  ): Promise<PaginatedResponse<User>> {
    return paginate(pagination, (skip, take) =>
      this.userRepo.findAndCount({ skip, take }),
    );
  }
}
```

That's it. The `@Pagination()` decorator reads `?page=` and `?limit=` from the query string, and `paginate()` handles the rest.

---

## How It Works

### 1. The `@Pagination()` Decorator

A parameter decorator that extracts `page` and `limit` from the query string and normalizes them.

```typescript
@Get()
findAll(@Pagination() pagination: Required<PaginationOptions>) {}
```

- `page` defaults to `1` if missing or invalid
- `limit` defaults to `10` if missing or invalid
- `limit` is capped at `100` (configurable via `MAX_PAGE_SIZE`)
- `page` is at least `1`

### 2. The `paginate()` Function

```typescript
async function paginate<T>(
  options: PaginateOptions<T>,
  callback: (skip: number, take: number) => Promise<[T[], number]>,
): Promise<PaginatedResponse<T>>
```

It:
1. Normalizes page/limit values
2. Calculates `skip = (page - 1) * limit`
3. Calls your callback with `(skip, limit)`
4. Your callback returns `[items, totalCount]`
5. Builds rich pagination metadata
6. Returns `{ data, meta }`

### 3. The Callback Pattern

Your callback receives `(skip, take)` and must return a tuple of `[items[], totalCount]`. This maps directly to TypeORM's `findAndCount()`, but you can use anything:

```typescript
// TypeORM repository
(skip, take) => this.repo.findAndCount({ skip, take, where: { active: true } })

// TypeORM query builder
(skip, take) => this.repo.createQueryBuilder('u')
  .where('u.active = :active', { active: true })
  .skip(skip)
  .take(take)
  .getManyAndCount()

// Raw SQL
(skip, take) => {
  const items = await db.query('SELECT * FROM users LIMIT $1 OFFSET $2', [take, skip]);
  const [{ count }] = await db.query('SELECT COUNT(*) FROM users');
  return [items, parseInt(count)];
}

// In-memory array
(skip, take) => {
  const slice = allItems.slice(skip, skip + take);
  return Promise.resolve([slice, allItems.length]);
}
```

---

## With a Transform

You can map each item before it's returned:

```typescript
const result = await paginate(
  {
    page: 1,
    limit: 20,
    transform: (user) => ({
      id: user.id,
      fullName: `${user.firstName} ${user.lastName}`,
    }),
  },
  (skip, take) => this.userRepo.findAndCount({ skip, take }),
);
```

---

## Response Shape

Every paginated response follows this structure:

```json
{
  "data": [
    { "id": 1, "name": "Alice" },
    { "id": 2, "name": "Bob" }
  ],
  "meta": {
    "total": 50,
    "count": 2,
    "page": 1,
    "limit": 2,
    "totalPages": 25,
    "firstItem": 1,
    "lastItem": 2,
    "nextPage": 2,
    "previousPage": null,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

### Meta Fields Explained

| Field             | Type              | Description                                        |
| ----------------- | ----------------- | -------------------------------------------------- |
| `total`           | `number`          | Total items across all pages                       |
| `count`           | `number`          | Items returned in this page                        |
| `page`            | `number`          | Current page number                                |
| `limit`           | `number`          | Items per page                                     |
| `totalPages`      | `number`          | Total number of pages                              |
| `firstItem`       | `number`          | 1-based index of first item on this page (0 if empty) |
| `lastItem`        | `number`          | 1-based index of last item on this page (0 if empty)  |
| `nextPage`        | `number \| null`  | Next page number, or `null` if on last page        |
| `previousPage`    | `number \| null`  | Previous page number, or `null` if on first page   |
| `hasNextPage`     | `boolean`         | Whether a next page exists                         |
| `hasPreviousPage` | `boolean`         | Whether a previous page exists                     |

---

## Standalone Helpers

If you need finer control, use the individual functions directly:

### `normalizePaginationOptions(options)`

Sanitizes and clamps page/limit values:

```typescript
normalizePaginationOptions({ page: -1, limit: 500 });
// { page: 1, limit: 100 }
```

### `buildPaginationMeta(total, count, skip, options)`

Builds the metadata object manually — useful if you already have the data and just need the meta.

---

## Defaults

| Constant        | Value | Meaning                     |
| --------------- | ----- | --------------------------- |
| `DEFAULT_PAGE`  | `1`   | Default page if not provided |
| `DEFAULT_LIMIT` | `10`  | Default items per page      |
| `MIN_PAGE`      | `1`   | Minimum allowed page        |
| `MAX_PAGE_SIZE` | `100` | Maximum items per page      |

All configurable in `src/common/constants/app.constant.ts`.
