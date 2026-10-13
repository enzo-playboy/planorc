# DevOps, Build Tools & Developer Standards

## Docker & Containerization
- **Pinned Versions:** Always pin base images (e.g., `FROM node:20.11-alpine3.19` or `FROM python:3.12-slim`), never use `:latest` in production.
- **Multi-Stage Builds:** Separate build dependencies from production runtime images to minimize attack surface and size.
- **Non-Root Execution:** Explicitly declare a non-root user (`USER appuser`) before the `CMD`/`ENTRYPOINT`.
- **Layer Caching:** Order `Dockerfile` instructions from least frequently changed to most frequently changed (dependencies before source code).
- **.dockerignore:** Always exclude `node_modules`, `.git`, `.env*`, `dist`, `build`, and test artifacts.
- **Logging & Monitoring:** Output logs directly to `stdout`/`stderr`—never store logs internally in container filesystems.

## Git & Conventional Commits
Format all commit messages strictly using the Conventional Commits specification:
```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```
- **Types:**
  - `feat`: A new feature.
  - `fix`: A bug fix.
  - `refactor`: Code change that neither fixes a bug nor adds a feature.
  - `perf`: A code change that improves performance.
  - `test`: Adding or correcting tests.
  - `chore`: Maintenance, dependencies, or tooling updates.
  - `build` / `ci`: Changes to build systems, bundlers, or CI pipelines.
- **Breaking Changes:** Mark with `!` in the prefix or `BREAKING CHANGE:` in the footer.

## Build Tools & Performance
- **Package Management:** Enforce lockfile consistency (`pnpm-lock.yaml`, `package-lock.json`, `poetry.lock`, or `uv.lock`). Avoid mixing package managers.
- **Bundle Optimization:** Analyze bundle sizes during CI; implement tree-shaking, code-splitting, and minification.
- **DevSecOps:** Run automated security linting and vulnerability scans (`npm audit`, `trivy`, `bandit`). Never commit `.env` or sensitive credentials to repositories.
