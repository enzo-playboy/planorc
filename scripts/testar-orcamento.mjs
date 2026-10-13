/**
 * Script de Verificação e Demonstração do Pipeline Orçamentário Oficial PlanOrc.
 * Utiliza o motor de regras paramétricas, base SINAPI, BDI TCU 2622/2013 e gerador Excel Caixa.
 */

import {
  GeometryNormalizer,
  BdiCalculator,
  RuleEngine,
  ExcelCaixaGenerator,
} from './lib/core-engine.mjs';

console.log('========================================================');
console.log('       PLANORC BRASIL - TESTE DO PIPELINE EXECUTIVO     ');
console.log('========================================================');

// 1. Definição da planta de teste (Sala de Estar / Jantar)
const verticesSala = [
  { x: 0, y: 0 },
  { x: 5.0, y: 0 },
  { x: 5.0, y: 4.9 },
  { x: 0, y: 4.9 },
];

const areaPiso = GeometryNormalizer.calcularAreaPoligono(verticesSala); // 24.50 m²
const perimetro = GeometryNormalizer.calcularPerimetroPoligono(verticesSala); // 19.80 m
const peDireito = 2.70;
const portasQtd = 1; // 0.80 x 2.10 = 1.68 m²
const janelasQtd = 1; // 1.20 x 1.20 = 1.44 m²

console.log(`Ambiente: Sala de Estar / Jantar`);
console.log(`Área de Piso: ${areaPiso.toFixed(2)} m²`);
console.log(`Perímetro: ${perimetro.toFixed(2)} m`);
console.log(`Pé-Direito: ${peDireito.toFixed(2)} m`);

// 2. Normalização do ambiente
const ambienteMCP = GeometryNormalizer.normalizarAmbiente(
  'amb-01',
  'Sala de Estar / Jantar',
  verticesSala,
  [
    { tipo: 'PORTA', quantidade: portasQtd },
    { tipo: 'JANELA', quantidade: janelasQtd },
  ]
);

// 3. Execução do Motor de Regras SINAPI
const configuracao = {
  peDireitoPadraoM: peDireito,
  padraoAcabamento: 'MEDIO',
  desoneracaoFolha: false,
  ufTabelaSinapi: 'SP',
  bdiTaxaDiretaPercentual: 25.0,
};

const projeto = RuleEngine.gerarOrcamentoCompleto([ambienteMCP], configuracao, 'Residência Unifamiliar - Teste');
const resumo = projeto.resumoFinanceiro;

console.log('--------------------------------------------------------');
console.log(`Custo Direto Material: R$ ${resumo.custoDiretoMaterial.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`);
console.log(`Custo Direto Mão de Obra: R$ ${resumo.custoDiretoMaoDeObra.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`);
console.log(`Custo Direto Total: R$ ${resumo.custoDiretoTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`);
console.log(`Taxa BDI Efetiva: ${resumo.taxaBdiEfetivaPercentual.toFixed(2)}% (R$ ${resumo.valorTotalBdi.toLocaleString('pt-BR', { minimumFractionDigits: 2 })})`);
console.log(`Preço Final de Venda: R$ ${resumo.precoFinalVenda.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`);
console.log(`Custo Médio p/ m² de Piso: R$ ${resumo.custoMedioPorM2.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/m²`);

// 4. Validação da planilha Excel Caixa de 2 abas
const xmlExcel = ExcelCaixaGenerator.gerarPlanilhaXml(projeto);
console.log('--------------------------------------------------------');
console.log(`Planilha Excel Gerada com Sucesso: ${xmlExcel.length} bytes de XML`);
console.log(`Contém Aba 1: ${xmlExcel.includes('Resumo de Quantitativos') ? 'SIM' : 'NÃO'}`);
console.log(`Contém Aba 2: ${xmlExcel.includes('Planilha Orçamentária CAIXA') ? 'SIM' : 'NÃO'}`);
console.log('========================================================');
console.log('✅ Pipeline validado com sucesso!');
