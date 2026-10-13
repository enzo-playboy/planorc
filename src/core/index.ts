/**
 * Ponto de entrada do Núcleo do OpenTakeoff Brasil.
 * Exporta tipos, regras de precificação, MCP bridge e gerador de planilha.
 */

export * from './types/takeoff';
export * from './types/orcamento';
export * from './pricing/sinapi-database';
export * from './pricing/bdi-calculator';
export * from './pricing/rule-engine';
export * from './mcp/geometry-normalizer';
export * from './mcp/opentakeoff-client';
export * from './exporter/excel-caixa-generator';
export * from './services/orcamento-service';
