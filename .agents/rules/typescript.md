# TypeScript Coding Standards

## Type System
- Prefer interfaces over types for object definitions.
- Use `type` for unions, intersections, and mapped types.
- Avoid using `any`; prefer `unknown` when types are not yet determined.
- Use strict TypeScript settings (`strict: true`).
- Leverage built-in utility types (`Partial`, `Pick`, `Omit`, `Record`).
- Avoid enums; use `const` maps or string unions instead.

## Naming Conventions
- Use `PascalCase` for type names and interfaces.
- Use `camelCase` for variables and functions.
- Use `UPPER_CASE` for constants.
- Use descriptive names with auxiliary verbs (`isLoading`, `hasError`, `canSubmit`).
- Suffix React component prop interfaces with `Props` (e.g., `ButtonProps`).

## Functions & Organization
- Use explicit return types for public functions and exported APIs.
- Prefer async/await over raw Promises.
- Keep type definitions close to where they are used; place shared domain types in `src/types/`.
- Use discriminated unions for type-safe state machines and branching.
