# Python Development Standards

## Code Style & Formatting
- Adhere to PEP 8 conventions.
- Format code according to Black style (max line length 88 characters).
- Naming:
  - `snake_case` for functions, methods, and variables.
  - `PascalCase` for classes and exception names.
  - `UPPER_CASE` for constants.
- Prefer absolute imports over relative imports.

## Type Hints
- Use explicit type annotations for all function parameters and return types.
- Leverage modern type hints (`int | None`, `list[str]`, `dict[str, Any]`).
- Use `Protocol` or `ABC` for structural typing and interfaces.
- Define domain models with `Pydantic` or dataclasses.

## Project Structure & Architecture
- Follow the `src/` layout: `src/<package_name>/`.
- Keep tests in a dedicated `tests/` directory with `pytest`.
- Separate concerns: models, schemas, repositories/services, and entrypoints (CLI or API).
- Write custom domain exceptions and avoid generic `except Exception: pass`.
