# Backend Architecture & API Standards

## Layered Architecture
Maintain strict boundaries between layers. Dependencies must flow downward only:
```
Routes / Controllers  ->  Services (Business Logic)  ->  Repositories (Data Access)  ->  Database / External APIs
```

### 1. Controllers / Routers
- **Keep handlers thin:** Handlers should only parse inputs, call a service method, and serialize outputs.
- **No direct database queries:** Never import ORMs (SQLAlchemy, Prisma, TypeORM) directly into route handlers.
- **Typed schemas:** Always declare explicit request and response models (Pydantic models in Python, Zod schemas in TypeScript).
- **HTTP status codes:** Return idiomatic status codes (`200 OK`, `201 Created`, `204 No Content`, `400 Bad Request`, `401 Unauthorized`, `403 Forbidden`, `404 Not Found`, `422 Unprocessable`).

### 2. Services (Domain & Business Logic)
- Encapsulate all business rules, orchestration, and domain calculations here.
- Accept and return domain entities or plain data structures, not raw HTTP requests or responses.
- Raise **domain-specific exceptions** (e.g., `UserNotFoundError`, `InsufficientFundsError`) instead of framework HTTP exceptions.
- Inject repository dependencies via interfaces or protocols to enable unit testing and decoupling.

### 3. Repositories & Database Access
- The only layer allowed to communicate directly with ORMs, query builders, or database drivers.
- **Connection pooling & migrations:** Always use migration tools (Alembic for Python, Prisma/TypeORM/Drizzle migrations for TS/Node) and maintain connection pool limits.
- **Transactions:** Group multi-table state changes in atomic transactions.
- **Indexing & Queries:** Always add indexes for fields used in `WHERE`, `JOIN`, and `ORDER BY` clauses. Prevent N+1 queries by using eager loading / joins.

## Security & Auth
- **Authentication:** Use stateless JWTs with short expiration times and secure refresh tokens, or HTTP-only secure cookies.
- **Passwords:** Hash passwords using modern algorithms (`bcrypt`, `argon2id`). Never store plain text.
- **Input Sanitization & Validation:** Validate and parse every input parameter before processing.
- **Security Headers & CORS:** Enforce strict CORS origins, rate limiting, and security headers (Helmet / CORS middleware).

## Error Handling & Observability
- Use centralized error handling middleware to translate domain exceptions into sanitized JSON error responses.
- Never leak database errors, stack traces, or internal server details in production responses.
- Implement structured logging (JSON format) containing request IDs for traceability.
