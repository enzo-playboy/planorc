## 🏗️ Resumo das Alterações (Summary)

<!-- Descreva de forma concisa o que foi adicionado, alterado ou corrigido no PlanOrc. -->

## 📦 Tipo de Contribuição (Type of Change)

- [ ] 🚀 Nova Funcionalidade (Feature)
- [ ] 🐛 Correção de Bug (Bug Fix)
- [ ] 📐 Geometria & Extração (Shoelace / MCP Takeoff)
- [ ] 🧱 Base de Custos SINAPI / BDI TCU
- [ ] 📑 Exportador Excel CAIXA / Relatórios
- [ ] ⚡ Performance & Otimização
- [ ] 📚 Documentação & Infraestrutura de CI/CD

## 🔍 Módulos Impactados

- [ ] `src/core/mcp/` (Normalização Geométrica / MCP OpenTakeoff)
- [ ] `src/core/pricing/` (SINAPI / BDI 2622/2013 / Regras Paramétricas)
- [ ] `src/core/exporter/` (Planilhas Excel CAIXA de 2 Abas)
- [ ] `src/core/services/` (Orquestração de Orçamento)
- [ ] `src/app/api/` (Route Handlers Next.js)

## ✅ Checklist de Qualidade e Produção (Production Readiness)

- [ ] O código segue a tipagem TypeScript estrita sem o uso de `any`.
- [ ] Os cálculos matemáticos (m², perímetro linear, dedução de vãos e BDI) foram validados com precisão.
- [ ] A compatibilidade das composições SINAPI (Material vs. Mão de Obra) foi preservada.
- [ ] A integridade da planilha Excel oficial da CAIXA (2 abas com fórmulas) foi testada.
- [ ] Nenhum token de API, segredo ou credencial foi comitado.
- [ ] Todos os testes automatizados passaram no CI (`npm run test:orcamento`).
