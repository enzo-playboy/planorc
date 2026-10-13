# Workspace Agent Rules

This workspace is configured with standards adapted from `awesome-cursorrules` for **Antigravity**:

## Active Rule Sets
- **Next.js & React**: [.agents/rules/nextjs-react.md](file:///d:/reverse/.agents/rules/nextjs-react.md)
  - Focuses on Next.js App Router, React Server Components (RSC), `nuqs`, Shadcn UI, and clean folder structures.
- **TypeScript**: [.agents/rules/typescript.md](file:///d:/reverse/.agents/rules/typescript.md)
  - Strict type safety, interfaces over types, `unknown` over `any`, and discriminated unions.
- **Tailwind CSS**: [.agents/rules/tailwind.md](file:///d:/reverse/.agents/rules/tailwind.md)
  - Mobile-first styling, semantic color tokens, and layout guidelines.
- **Backend & APIs**: [.agents/rules/backend.md](file:///d:/reverse/.agents/rules/backend.md)
  - Strict 4-layer architecture (Routers -> Services -> Repositories -> DB), typed DTOs/schemas, domain exceptions, and security best practices.
- **Python**: [.agents/rules/python.md](file:///d:/reverse/.agents/rules/python.md)
  - PEP 8, Black formatting, full type annotations, and `src/` layout.
- **API Design & Testing**: [.agents/rules/api-testing.md](file:///d:/reverse/.agents/rules/api-testing.md)
  - RESTful API standards, idempotency, versioning, and automated testing (Vitest, Pytest, Playwright).
- **DevOps & Build Tools**: [.agents/rules/devops-build-tools.md](file:///d:/reverse/.agents/rules/devops-build-tools.md)
  - Production Docker standards (multi-stage, non-root, pinned tags), Conventional Commits, lockfiles, and DevSecOps.

All code generated in this workspace follows these principles automatically.

## OpenTakeoff Brasil - Arquitetura de Módulos (Core)
O núcleo do produto que envelopa o MCP OpenTakeoff e adapta para engenharia civil brasileira está implementado em `src/`:
- **Tipos de Domínio:** [`src/core/types/takeoff.ts`](file:///d:/reverse/src/core/types/takeoff.ts) e [`src/core/types/orcamento.ts`](file:///d:/reverse/src/core/types/orcamento.ts)
- **Base de Custos SINAPI:** [`src/core/pricing/sinapi-database.ts`](file:///d:/reverse/src/core/pricing/sinapi-database.ts)
- **Calculadora BDI (Acórdão TCU 2622/2013):** [`src/core/pricing/bdi-calculator.ts`](file:///d:/reverse/src/core/pricing/bdi-calculator.ts)
- **Motor de Regras Paramétricas:** [`src/core/pricing/rule-engine.ts`](file:///d:/reverse/src/core/pricing/rule-engine.ts)
- **Normalizador Geométrico (Shoelace):** [`src/core/mcp/geometry-normalizer.ts`](file:///d:/reverse/src/core/mcp/geometry-normalizer.ts)
- **Abstração do MCP OpenTakeoff:** [`src/core/mcp/opentakeoff-client.ts`](file:///d:/reverse/src/core/mcp/opentakeoff-client.ts)
- **Gerador Excel ABNT/Caixa (2 Abas):** [`src/core/exporter/excel-caixa-generator.ts`](file:///d:/reverse/src/core/exporter/excel-caixa-generator.ts)
- **Serviço de Orquestração:** [`src/core/services/orcamento-service.ts`](file:///d:/reverse/src/core/services/orcamento-service.ts)
- **Route Handlers Next.js:** [`src/app/api/takeoff/process/route.ts`](file:///d:/reverse/src/app/api/takeoff/process/route.ts) e [`src/app/api/takeoff/export-excel/route.ts`](file:///d:/reverse/src/app/api/takeoff/export-excel/route.ts)
