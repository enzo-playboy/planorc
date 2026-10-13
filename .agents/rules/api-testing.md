# API Design & Testing Standards

## API Design Principles
- **RESTful Resource Hierarchy:** Design clean, resource-oriented URIs using plural nouns (e.g., `/api/v1/users/{id}/orders`).
- **HTTP Methods & Idempotency:**
  - `GET`: Safe and idempotent. Used for retrieving resources; never mutates state.
  - `POST`: Non-idempotent. Used for creating resources or triggering actions.
  - `PUT`: Idempotent full replacement of a resource.
  - `PATCH`: Partial resource updates.
  - `DELETE`: Idempotent removal of a resource.
- **Idempotency Keys:** Require `Idempotency-Key` headers for critical mutating endpoints (e.g., payments, orders, balance mutations).
- **Versioning:** Always prefix endpoints with major API version (e.g., `/api/v1/`). Never introduce breaking schema changes within a minor version.
- **Pagination & Filtering:** Standardize cursor or limit/offset pagination with metadata:
  ```json
  {
    "data": [...],
    "pagination": { "total": 100, "page": 1, "limit": 20, "has_more": true }
  }
  ```

## Automated Testing & QA
- **Unit & Integration Tests:** Use modern test runners (**Vitest** or **Jest** for JS/TS, **pytest** for Python).
- **Test Structure (AAA Pattern):**
  - **Arrange:** Set up test fixtures, mocks, and expected states.
  - **Act:** Execute the specific target function or endpoint.
  - **Assert:** Verify return values, side effects, and state mutations.
- **E2E & API Contract Testing:**
  - Use **Playwright** for browser and API integration tests.
  - Test happy paths, boundary limits, and explicit error cases (e.g., invalid auth, malformed payloads, rate limits).
  - Mock external third-party services using contract fixtures (MSW, pytest-mock, or WireMock).
- **Test Isolation:** Each test must be completely independent and idempotent. Clean up test databases and isolate state per run.
