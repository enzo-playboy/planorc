# Next.js & React Guidelines

## Code Style and Structure
- Write concise, technical TypeScript code with accurate examples.
- Use functional and declarative programming patterns; avoid classes.
- Prefer iteration and modularization over code duplication.
- Use descriptive variable names with auxiliary verbs (e.g., `isLoading`, `hasError`).
- Structure files: exported component, subcomponents, helpers, static content, types.

## Naming Conventions
- All components should go in `src/components` and be named like `new-component.tsx`.
- Use lowercase with dashes for directories (e.g., `components/auth-wizard`).
- Favor named exports for components.

## React & Server Components
- Use React Server Components (RSC) by default.
- Minimize `'use client'`, `useEffect`, and `useState`.
- Use `'use client'` only when accessing Web APIs, browser state, or client-side interactivity.
- Wrap client components in `<Suspense>` with fallback.
- Use dynamic imports for heavy non-critical components.
- Optimize images using `next/image` with WebP format, explicit dimensions, and lazy loading.

## Component Organization
```
src/components/
├── ui/         # Generic UI (Button, Modal, Card, Shadcn)
├── forms/      # Form controls & inputs
└── layout/     # Navbars, Sidebars, Footers
```
- For route-private components, use `_components` inside `/src/app/<route>/`.
