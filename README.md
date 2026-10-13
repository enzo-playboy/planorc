# PlanOrc 🏗️📐
> **Automação Inteligente de Medição de Plantas & Orçamento de Obras para a Construção Civil Brasileira**
> *Envelopando o motor OpenTakeoff MCP para padrões SINAPI, Caixa Econômica Federal e Acórdão TCU 2622/2013.*

[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14+-black.svg)](https://nextjs.org/)
[![SINAPI](https://img.shields.io/badge/Base-SINAPI%20%2F%20CEF-green.svg)](https://www.caixa.gov.br/)
[![BDI](https://img.shields.io/badge/BDI-Ac%C3%B3rd%C3%A3o%20TCU%202622%2F2013-orange.svg)](https://portal.tcu.gov.br/)
[![CI](https://img.shields.io/badge/CI%2FCD-Multi--OS%20Matrix-blueviolet.svg)](.github/workflows/ci.yml)
[![License](https://img.shields.io/badge/License-MIT-purple.svg)](LICENSE)

---

## 📌 Visão Geral

O **PlanOrc** é uma plataforma desenvolvida para engenheiros civis, orçamentistas e construtoras. Ele abstrai a complexidade matemática e de inteligência artificial de motores de extração de plantas (como o **OpenTakeoff MCP**), transformando pranchas de arquitetura em PDF ou DWG diretamente em **orçamentos executivos formatados e planilhas prontas no padrão Caixa / ABNT**.

Todo o jargão técnico de IA e chamadas brutas a ferramentas é isolado na camada de serviços do backend, garantindo uma interface simples, amigável e em português.

---

## ✨ Principais Funcionalidades

- 📐 **Extração Geométrica Automatizada:**
  - Calibração de escala métrica e conversão de coordenadas pixel-para-metro.
  - Cálculo de áreas de ambientes por polígonos fechados via **Fórmula de Shoelace (Gauss)**.
  - Cálculo de perímetros lineares de paredes e dedução automática de vãos (portas e janelas).
  - Reconhecimento semântico de ambientes em português (*Sala*, *Cozinha*, *Dormitório*, *Banheiro*, etc.).

- 🧱 **Regras de Negócio e Precificação Brasileira (SINAPI):**
  - Associação paramétrica de serviços por $m^2$, metro linear e unidade.
  - Tratamento inteligente de áreas secas vs. áreas molhadas (inserção automática de impermeabilização e azulejos até o teto).
  - Desmembramento analítico em **Custo de Material** e **Custo de Mão de Obra**.

- 📈 **Calculadora de BDI (Acórdão TCU 2622/2013):**
  - Fórmula oficial para obras públicas e estimativas da Caixa:
    $$BDI = \left[\frac{(1 + AC + S + R + G) \times (1 + DF) \times (1 + L)}{1 - T}\right] - 1$$
  - Suporte tanto à parametrização detalhada (Administração Central, Seguros, Riscos, Lucro, Impostos) quanto à taxa percentual direta (ex: 25.0%).

- 📑 **Exportação de Planilha Excel (.xlsx) de 2 Abas:**
  - **Aba 1 (Resumo de Quantitativos):** Área de piso ($m^2$), perímetro ($m$), pé-direito, área líquida de paredes descontando vãos, quantitativo de portas/janelas e subtotais.
  - **Aba 2 (Planilha Orçamentária CAIXA):** Itens com código SINAPI, discriminação de serviços, quantitativos, custo unitário de material/mão de obra, BDI rateado e preço final de venda.

---

## 🏛️ Arquitetura do Sistema

O projeto segue uma arquitetura limpa em **4 camadas** no Next.js com TypeScript estrito:

```
src/
├── app/
│   └── api/
│       ├── takeoff/
│       │   ├── process/route.ts        # POST: Processa planta e gera o orçamento
│       │   └── export-excel/route.ts   # POST: Devolve o arquivo .xlsx formatado
│       └── sinapi/
│           └── search/route.ts         # GET: Consulta e busca itens SINAPI
│
├── core/
│   ├── types/
│   │   ├── takeoff.ts                  # Contratos de geometria e saída do MCP
│   │   └── orcamento.ts                # Modelos de dados de orçamento e BDI
│   ├── pricing/
│   │   ├── sinapi-database.ts          # Banco local com composições SINAPI
│   │   ├── bdi-calculator.ts           # Cálculo de BDI (TCU 2622/2013)
│   │   └── rule-engine.ts              # Motor de regras de associação de insumos
│   ├── mcp/
│   │   ├── geometry-normalizer.ts      # Fórmula de Shoelace e classificação semântica
│   │   └── opentakeoff-client.ts       # Abstração de alto nível do OpenTakeoff MCP
│   ├── exporter/
│   │   └── excel-caixa-generator.ts    # Gerador da planilha técnica de 2 abas
│   └── services/
│       └── orcamento-service.ts        # Fachada orquestradora da aplicação
```

---

## 🔄 Fluxo de Processamento

```mermaid
flowchart LR
    A[Upload Prancha PDF] --> B[OpenTakeoff MCP]
    B --> C[Normalizador Geométrico]
    C --> D[Motor de Regras SINAPI]
    D --> E[Calculadora de BDI]
    E --> F[Planilha Excel CAIXA .xlsx]
```

---

## 🛡️ Infraestrutura de Produção e CI/CD (Padrão AgentScope)

Para garantir que o sistema não quebre em ambiente de produção, adotamos a arquitetura de validação contínua e governança inspirada no **AgentScope**:

- **Pipeline Multi-OS Matrix (`.github/workflows/ci.yml`):**
  - Validação cruzada em **Ubuntu Latest** e **Windows Latest**.
  - Testes com matriz de versões do Node.js (18.x e 20.x).
  - Verificação de tipagem estrita TypeScript (`tsc --noEmit`).
  - Execução obrigatória dos testes de regras de engenharia civil, deduções de vãos e fórmulas de Shoelace.
- **Portão de Segurança e Segredos (`.github/workflows/main.yml`):**
  - Varredura automatizada contra vazamento acidental de chaves de API e credenciais em commits.
  - Auditoria contínua de vulnerabilidades em dependências (`npm audit`).
- **Governança & Atualizações Automáticas (`.github/dependabot.yml`):**
  - Varredura semanal automatizada de dependências e ações do GitHub.
- **Templates Estruturados de Colaboração (`.github/ISSUE_TEMPLATE/` e PR):**
  - Formulários de relato de bugs e solicitações de melhorias focados em quantitativos e orçamentos.
  - Checklist rigoroso de aceitação e integridade da planilha Caixa de 2 abas.

---

## 🚀 Como Executar

### 1. Clonar e Instalar Dependências

```bash
git clone https://github.com/enzo-playboy/planorc.git
cd planorc
pnpm install # ou npm install / yarn
```

### 2. Testar o Pipeline Orçamentário

Execute o script de demonstração técnica para validar os cálculos e regras do SINAPI:

```bash
node scripts/testar-orcamento.mjs
```

### 3. Iniciar o Servidor de Desenvolvimento

```bash
npm run dev
```

O backend estará ativo em `http://localhost:3000`.

---

## 📡 Endpoints da API

### `POST /api/takeoff/process`
Processa uma planta baixa enviada via `multipart/form-data` ou corpo `JSON`.

**Exemplo de Resposta:**
```json
{
  "sucesso": true,
  "projeto": {
    "tituloProjeto": "Orçamento Residencial",
    "resumoFinanceiro": {
      "areaTotalConstruidaM2": 49.62,
      "custoDiretoTotal": 14250.80,
      "taxaBdiEfetivaPercentual": 25.0,
      "valorTotalBdi": 3562.70,
      "precoFinalVenda": 17813.50,
      "custoMedioPorM2": 358.99
    },
    "ambientes": [...]
  }
}
```

### `POST /api/takeoff/export-excel`
Recebe o objeto `projeto` e gera o download direto de um arquivo `.xlsx` com formatação oficial da Caixa Econômica Federal.

### `GET /api/sinapi/search?q=porcelanato`
Pesquisa insumos e composições da base SINAPI.

---

## 📜 Licença

Distribuído sob licença MIT. Consulte `LICENSE` para mais informações.
