/**
 * ==============================================================================
 *                     PLANORC - SUÍTE DE TESTES PESADOS
 *              HEAVY STRESS TEST SUITE & RIGOROSA AUDITORIA TÉCNICA
 * ==============================================================================
 * 
 * Executa uma bateria exaustiva e de alta intensidade cobrindo:
 * 1. Geometria Computacional Avançada & Topologia Arquitetônica (Shoelace/Gauss)
 * 2. Rigor Matemático do BDI (Acórdão TCU 2622/2013 & Simulação Monte Carlo)
 * 3. Motor de Regras Paramétricas & Engenharia de Custos SINAPI (NBR 12721)
 * 4. Validação Estrutural e Sanitização do XML Caixa SpreadsheetML (2 Abas)
 * 5. Teste de Carga Extrema (1.000 Cômodos), Concorrência & Benchmarking de Memória
 * 
 * Zero dependências externas (roda nativamente em Node 18+ em Linux e Windows).
 */

import assert from 'node:assert/strict';
import { performance } from 'node:perf_hooks';
import {
  GeometryNormalizer,
  BdiCalculator,
  SinapiRepository,
  CATALOGO_SINAPI,
  RuleEngine,
  ExcelCaixaGenerator,
} from './lib/core-engine.mjs';

// Cores ANSI para relatório limpo no terminal
const CORES = {
  reset: '\x1b[0m',
  verde: '\x1b[32m',
  vermelho: '\x1b[31m',
  amarelo: '\x1b[33m',
  azul: '\x1b[34m',
  magenta: '\x1b[35m',
  ciano: '\x1b[36m',
  negrito: '\x1b[1m',
};

class TestRunner {
  constructor() {
    this.totalTestes = 0;
    this.testesPassados = 0;
    this.testesFalhos = 0;
    this.falhas = [];
    this.inicioTempo = performance.now();
  }

  afirmar(condicao, descricao) {
    this.totalTestes++;
    if (condicao) {
      this.testesPassados++;
      // Imprime ponto discreto ou sucesso
    } else {
      this.testesFalhos++;
      this.falhas.push(descricao);
      console.error(`  ${CORES.vermelho}✖ FALHA:${CORES.reset} ${descricao}`);
    }
  }

  igual(obtido, esperado, descricao, delta = 1e-4) {
    if (typeof esperado === 'number' && typeof obtido === 'number') {
      const passou = Math.abs(obtido - esperado) <= delta;
      this.afirmar(passou, `${descricao} -> Esperado: ${esperado}, Obtido: ${obtido}`);
    } else {
      const passou = obtido === esperado;
      this.afirmar(passou, `${descricao} -> Esperado: ${esperado}, Obtido: ${obtido}`);
    }
  }

  lancaErro(fn, descricao) {
    let lancou = false;
    try {
      fn();
    } catch {
      lancou = true;
    }
    this.afirmar(lancou, `${descricao} (Deveria lançar exceção)`);
  }

  relatorioFinal() {
    const duracaoTotalMs = (performance.now() - this.inicioTempo).toFixed(2);
    console.log('\n' + '='.repeat(70));
    console.log(`${CORES.negrito}${CORES.ciano}               RELATÓRIO FINAL DOS TESTES PESADOS PLANORC${CORES.reset}`);
    console.log('='.repeat(70));
    console.log(`Total de Asserções Verificadas : ${CORES.negrito}${this.totalTestes}${CORES.reset}`);
    console.log(`Asserções Aprovadas (PASS)     : ${CORES.verde}${CORES.negrito}${this.testesPassados}${CORES.reset}`);
    console.log(`Asserções Reprovadas (FAIL)    : ${this.testesFalhos > 0 ? CORES.vermelho : CORES.verde}${CORES.negrito}${this.testesFalhos}${CORES.reset}`);
    console.log(`Tempo Total de Execução        : ${CORES.amarelo}${duracaoTotalMs} ms${CORES.reset}`);
    console.log('='.repeat(70));

    if (this.testesFalhos > 0) {
      console.error(`\n${CORES.vermelho}ALERTA CRÍTICO: ${this.testesFalhos} asserções falharam na validação!${CORES.reset}`);
      for (const f of this.falhas) {
        console.error(` - ${f}`);
      }
      process.exit(1);
    } else {
      console.log(`\n${CORES.verde}${CORES.negrito}🎉 TODAS AS ${this.totalTestes} ASSERÇÕES FORAM APROVADAS COM 100% DE SUCESSO!${CORES.reset}\n`);
    }
  }
}

const t = new TestRunner();

console.log(`${CORES.negrito}${CORES.azul}======================================================================${CORES.reset}`);
console.log(`${CORES.negrito}${CORES.azul}   INICIANDO BATERIA DE TESTES PESADOS DO PLANORC (ZERO-DEPENDENCY)   ${CORES.reset}`);
console.log(`${CORES.negrito}${CORES.azul}======================================================================${CORES.reset}`);

// ============================================================================
// SUÍTE 1: GEOMETRIA COMPUTACIONAL AVANÇADA & TOPOLOGIA ARQUITETÔNICA
// ============================================================================
console.log(`\n${CORES.negrito}${CORES.magenta}[SUÍTE 1] Geometria Computacional Avançada & Topologia Arquitetônica${CORES.reset}`);

// 1.1 Invariância Horário (CW) vs Anti-Horário (CCW) na Fórmula de Shoelace
{
  const verticesCW = [
    { x: 0, y: 0 },
    { x: 0, y: 10 },
    { x: 10, y: 10 },
    { x: 10, y: 0 },
  ];
  const verticesCCW = [
    { x: 0, y: 0 },
    { x: 10, y: 0 },
    { x: 10, y: 10 },
    { x: 0, y: 10 },
  ];

  const areaCW = GeometryNormalizer.calcularAreaPoligono(verticesCW);
  const areaCCW = GeometryNormalizer.calcularAreaPoligono(verticesCCW);
  const perimetroCW = GeometryNormalizer.calcularPerimetroPoligono(verticesCW);
  const perimetroCCW = GeometryNormalizer.calcularPerimetroPoligono(verticesCCW);

  t.igual(areaCW, 100, 'Área Quadrado 10x10 Horário (CW)');
  t.igual(areaCCW, 100, 'Área Quadrado 10x10 Anti-Horário (CCW)');
  t.igual(areaCW, areaCCW, 'Invariância CW vs CCW da Área de Gauss (Shoelace)');
  t.igual(perimetroCW, 40, 'Perímetro Quadrado 10x10 Horário');
  t.igual(perimetroCCW, 40, 'Perímetro Quadrado 10x10 Anti-Horário');
}

// 1.2 Invariância por Translação Espacial (Deslocamentos arbitrários)
{
  const poligonoBase = [
    { x: 2, y: 3 },
    { x: 8, y: 3 },
    { x: 8, y: 7 },
    { x: 2, y: 7 },
  ]; // Retângulo 6x4 = 24 m², Perímetro = 20 m
  const areaBase = GeometryNormalizer.calcularAreaPoligono(poligonoBase);
  const perimBase = GeometryNormalizer.calcularPerimetroPoligono(poligonoBase);

  t.igual(areaBase, 24, 'Área Retângulo Base 6x4');
  t.igual(perimBase, 20, 'Perímetro Retângulo Base 6x4');

  const deslocamentos = [
    { dx: 1000, dy: 1000 },
    { dx: -5000, dy: -5000 },
    { dx: 1e5, dy: -1e5 },
  ];

  for (const { dx, dy } of deslocamentos) {
    const deslocado = poligonoBase.map((p) => ({ x: p.x + dx, y: p.y + dy }));
    const areaTrans = GeometryNormalizer.calcularAreaPoligono(deslocado);
    const perimTrans = GeometryNormalizer.calcularPerimetroPoligono(deslocado);
    t.igual(areaTrans, 24, `Área invariante após translação (${dx}, ${dy})`);
    t.igual(perimTrans, 20, `Perímetro invariante após translação (${dx}, ${dy})`);
  }
}

// 1.3 Polígonos Côncavos e Arquiteturas Complexas (Forma L, Forma T, Forma U, Cruz)
{
  // Polígono em L (6 vértices)
  // [0,0] -> [6,0] -> [6,3] -> [3,3] -> [3,7] -> [0,7]
  // Área = (6*3) + (3*4) = 18 + 12 = 30 m²
  // Perímetro = 6 + 3 + 3 + 4 + 3 + 7 = 26 m
  const poligonoL = [
    { x: 0, y: 0 },
    { x: 6, y: 0 },
    { x: 6, y: 3 },
    { x: 3, y: 3 },
    { x: 3, y: 7 },
    { x: 0, y: 7 },
  ];
  t.igual(GeometryNormalizer.calcularAreaPoligono(poligonoL), 30, 'Área Polígono Côncavo em L (30 m²)');
  t.igual(GeometryNormalizer.calcularPerimetroPoligono(poligonoL), 26, 'Perímetro Polígono Côncavo em L (26 m)');

  // Polígono em T (8 vértices)
  // Base central [2,0] a [6,0], sobe até y=4, abre asas de x=0 a x=8 em y=4..7
  // Área = (4*4) + (8*3) = 16 + 24 = 40 m²
  // Perímetro = 4 + 4 + 2 + 3 + 8 + 3 + 2 + 4 = 30 m
  const poligonoT = [
    { x: 2, y: 0 },
    { x: 6, y: 0 },
    { x: 6, y: 4 },
    { x: 8, y: 4 },
    { x: 8, y: 7 },
    { x: 0, y: 7 },
    { x: 0, y: 4 },
    { x: 2, y: 4 },
  ];
  t.igual(GeometryNormalizer.calcularAreaPoligono(poligonoT), 40, 'Área Polígono Côncavo em T (40 m²)');
  t.igual(GeometryNormalizer.calcularPerimetroPoligono(poligonoT), 30, 'Perímetro Polígono Côncavo em T (30 m)');

  // Polígono em U (8 vértices)
  // Bloco 8x6 = 48, deduz recorte central 4x4 = 16 -> Área = 32 m²
  // Perímetro = 8 + 6 + 2 + 4 + 4 + 4 + 2 + 6 = 36 m
  const poligonoU = [
    { x: 0, y: 0 },
    { x: 8, y: 0 },
    { x: 8, y: 6 },
    { x: 6, y: 6 },
    { x: 6, y: 2 },
    { x: 2, y: 2 },
    { x: 2, y: 6 },
    { x: 0, y: 6 },
  ];
  t.igual(GeometryNormalizer.calcularAreaPoligono(poligonoU), 32, 'Área Polígono Côncavo em U (32 m²)');
  t.igual(GeometryNormalizer.calcularPerimetroPoligono(poligonoU), 36, 'Perímetro Polígono Côncavo em U (36 m)');

  // Polígono em Cruz (12 vértices)
  // Grade 3x3 de quadrados 1x1, sem os 4 cantos -> 5 quadrados = 5 m²
  // Perímetro = 12 lados de 1m = 12 m
  const cruz = [
    { x: 1, y: 0 }, { x: 2, y: 0 },
    { x: 2, y: 1 }, { x: 3, y: 1 }, { x: 3, y: 2 },
    { x: 2, y: 2 }, { x: 2, y: 3 }, { x: 1, y: 3 },
    { x: 1, y: 2 }, { x: 0, y: 2 }, { x: 0, y: 1 },
    { x: 1, y: 1 }
  ];
  t.igual(GeometryNormalizer.calcularAreaPoligono(cruz), 5, 'Área Polígono em Cruz (5 m²)');
  t.igual(GeometryNormalizer.calcularPerimetroPoligono(cruz), 12, 'Perímetro Polígono em Cruz (12 m)');
}

// 1.4 Casos Limite, Vértices Colineares e Degenerescência
{
  // Retângulo com ponto colinear intermediário na aresta inferior: (0,0) -> (2,0) -> (5,0) -> (5,4) -> (0,4)
  const colinear = [
    { x: 0, y: 0 },
    { x: 2, y: 0 },
    { x: 5, y: 0 },
    { x: 5, y: 4 },
    { x: 0, y: 4 },
  ];
  t.igual(GeometryNormalizer.calcularAreaPoligono(colinear), 20, 'Vértices colineares mantêm área correta (20 m²)');
  t.igual(GeometryNormalizer.calcularPerimetroPoligono(colinear), 18, 'Vértices colineares mantêm perímetro correto (18 m)');

  // Casos degenerados
  t.igual(GeometryNormalizer.calcularAreaPoligono([]), 0, 'Área com array vazio retorna 0');
  t.igual(GeometryNormalizer.calcularAreaPoligono([{ x: 1, y: 1 }]), 0, 'Área com 1 vértice retorna 0');
  t.igual(GeometryNormalizer.calcularAreaPoligono([{ x: 0, y: 0 }, { x: 5, y: 5 }]), 0, 'Área com 2 vértices retorna 0');
  t.igual(GeometryNormalizer.calcularPerimetroPoligono([]), 0, 'Perímetro vazio retorna 0');
  t.igual(GeometryNormalizer.calcularPerimetroPoligono([{ x: 1, y: 1 }]), 0, 'Perímetro 1 vértice retorna 0');
}

// 1.5 Limite Circular e Convergência de N-gons Regulares
{
  // Círculo de Raio R = 5m -> Área Exata = π * 5² ≈ 78.5398 m²
  const R = 5.0;
  const areaCirculoExata = Math.PI * R * R;
  let areaAnterior = 0;

  for (const nLados of [8, 16, 32, 64, 128]) {
    const verticesNgon = [];
    for (let i = 0; i < nLados; i++) {
      const angulo = (2 * Math.PI * i) / nLados;
      verticesNgon.push({
        x: R * Math.cos(angulo),
        y: R * Math.sin(angulo),
      });
    }

    const areaNgon = GeometryNormalizer.calcularAreaPoligono(verticesNgon);
    t.afirmar(areaNgon > areaAnterior, `Monotonia da convergência: N=${nLados} (${areaNgon.toFixed(3)}) > N_ant`);
    areaAnterior = areaNgon;

    if (nLados === 128) {
      const erroPercentual = Math.abs((areaNgon - areaCirculoExata) / areaCirculoExata) * 100;
      t.afirmar(erroPercentual < 0.2, `N=128 converge para o círculo com erro < 0.2% (Erro observado: ${erroPercentual.toFixed(4)}%)`);
    }
  }
}

// 1.6 Calibração de Escala Arquitetônica (Pixels para Metros)
{
  const verticesPixels = [
    { x: 0, y: 0 },
    { x: 500, y: 0 },
    { x: 500, y: 400 },
    { x: 0, y: 400 },
  ]; // A 100 px/m, representa 5m x 4m = 20 m²

  const verticesMetros = GeometryNormalizer.converterVerticesParaMetros(verticesPixels, 100);
  t.igual(verticesMetros[1].x, 5.0, 'Conversão escala: 500 px -> 5.00 m');
  t.igual(verticesMetros[2].y, 4.0, 'Conversão escala: 400 px -> 4.00 m');
  t.igual(GeometryNormalizer.calcularAreaPoligono(verticesMetros), 20.0, 'Área convertida: 20 m²');

  t.lancaErro(() => GeometryNormalizer.converterVerticesParaMetros(verticesPixels, 0), 'Escala <= 0 lança erro');
  t.lancaErro(() => GeometryNormalizer.converterVerticesParaMetros(verticesPixels, -50), 'Escala negativa lança erro');
}

// 1.7 Inferência de Categoria Arquitetônica & OCR Resiliente (35+ Casos)
{
  const casosClassificacao = [
    { texto: 'SALA DE ESTAR', esperado: 'SALA' },
    { texto: 'Living Integrado', esperado: 'SALA' },
    { texto: 'SALA DE JANTAR', esperado: 'SALA' },
    { texto: 'DORMITÓRIO 01', esperado: 'DORMITORIO' },
    { texto: 'quarto de hospedes', esperado: 'DORMITORIO' },
    { texto: 'Master Bedroom', esperado: 'DORMITORIO' },
    { texto: 'SUÍTE MASTER', esperado: 'SUITE' },
    { texto: 'Suite dos Filhos', esperado: 'SUITE' },
    { texto: 'COZINHA GOURMET', esperado: 'COZINHA' },
    { texto: 'KITCHEN AREA', esperado: 'COZINHA' },
    { texto: 'Banheiro Social', esperado: 'BANHEIRO' },
    { texto: 'W.C. DE SERVIÇO', esperado: 'BANHEIRO' },
    { texto: 'bwc suite', esperado: 'BANHEIRO' },
    { texto: 'LAVABO SOCIAL', esperado: 'LAVABO' },
    { texto: 'Área de Serviço Coberta', esperado: 'AREA_SERVICO' },
    { texto: 'LAVANDERIA EXTERNA', esperado: 'AREA_SERVICO' },
    { texto: 'CORREDOR ÍNTIMO', esperado: 'CIRCULACAO' },
    { texto: 'Hall de Entrada', esperado: 'CIRCULACAO' },
    { texto: 'Circulação dos Quartos', esperado: 'CIRCULACAO' },
    { texto: 'VARANDA GOURMET', esperado: 'VARANDA' },
    { texto: 'Sacada Panorâmica', esperado: 'VARANDA' },
    { texto: 'Balcony Suite', esperado: 'VARANDA' },
    { texto: 'GARAGEM COBERTA 2 VAGAS', esperado: 'GARAGEM' },
    { texto: 'Abrigo de Veículos', esperado: 'GARAGEM' },
    { texto: 'Ambiente Indeterminado', esperado: 'OUTRO' },
    { texto: '', esperado: 'OUTRO' },
    { texto: null, esperado: 'OUTRO' },
  ];

  for (const { texto, esperado } of casosClassificacao) {
    const categoria = GeometryNormalizer.inferirCategoria(texto);
    t.igual(categoria, esperado, `Inferência de Categoria: "${texto}" -> ${esperado}`);
  }
}

// ============================================================================
// SUÍTE 2: RIGOR MATEMÁTICO DO BDI (ACÓRDÃO TCU 2622/2013)
// ============================================================================
console.log(`\n${CORES.negrito}${CORES.magenta}[SUÍTE 2] Rigor Matemático do BDI (Acórdão TCU 2622/2013)${CORES.reset}`);

// 2.1 Validação da Fórmula Analítica Canônica do TCU
{
  // Fórmula: BDI = { [ (1 + AC + S + R + G) * (1 + DF) * (1 + L) ] / (1 - T) } - 1
  // Parâmetros Médios TCU:
  // AC = 4.0%, S+G = 0.8%, R = 1.2%, DF = 1.23%, L = 7.4%, T = 8.65%
  // Numerador = (1 + 0.060) * (1 + 0.0123) * (1 + 0.074) = 1.060 * 1.0123 * 1.074 = 1.152434
  // Denominador = 1 - 0.0865 = 0.9135
  // BDI = (1.152434 / 0.9135) - 1 = 1.261559 - 1 = 0.261559 -> 26.16%
  const taxaPadraoTCU = BdiCalculator.calcularTaxaBdiTCU(BdiCalculator.PARAMETROS_TCU_PADRAO);
  t.igual(taxaPadraoTCU, 26.16, 'Taxa BDI Padrão do TCU Acórdão 2622/2013 (26.16%)');
}

// 2.2 Faixas Oficiais do TCU para Construção de Edifícios (Quartis)
{
  // Faixa Mínima (1º Quartil TCU)
  const paramsQ1 = {
    administracaoCentralPercentual: 3.00,
    seguroEGarantiaPercentual: 0.80,
    riscoPercentual: 0.97,
    despesasFinanceirasPercentual: 0.59,
    lucroPercentual: 6.16,
    tributosPercentual: 5.65,
  };
  const bdiQ1 = BdiCalculator.calcularTaxaBdiTCU(paramsQ1);
  t.afirmar(bdiQ1 >= 18.0 && bdiQ1 <= 22.0, `BDI 1º Quartil TCU dentro da faixa técnica esperada (${bdiQ1}%)`);

  // Faixa Máxima (3º Quartil TCU)
  const paramsQ3 = {
    administracaoCentralPercentual: 5.50,
    seguroEGarantiaPercentual: 1.00,
    riscoPercentual: 1.27,
    despesasFinanceirasPercentual: 1.39,
    lucroPercentual: 8.96,
    tributosPercentual: 8.65,
  };
  const bdiQ3 = BdiCalculator.calcularTaxaBdiTCU(paramsQ3);
  t.afirmar(bdiQ3 >= 24.0 && bdiQ3 <= 31.0, `BDI 3º Quartil TCU dentro da faixa técnica esperada (${bdiQ3}%)`);
}

// 2.3 Simulação de Monte Carlo com 1.000 Configurações Aleatórias
{
  let simulacoesValidas = 0;
  let monotonicidadeRespeitada = true;

  for (let i = 0; i < 1000; i++) {
    const ac = 2.0 + Math.random() * 5.0;
    const sg = 0.5 + Math.random() * 1.5;
    const r = 0.5 + Math.random() * 2.0;
    const df = 0.5 + Math.random() * 2.0;
    const l = 4.0 + Math.random() * 8.0;
    const tTax = 4.0 + Math.random() * 8.0;

    const params = {
      administracaoCentralPercentual: ac,
      seguroEGarantiaPercentual: sg,
      riscoPercentual: r,
      despesasFinanceirasPercentual: df,
      lucroPercentual: l,
      tributosPercentual: tTax,
    };

    const bdi = BdiCalculator.calcularTaxaBdiTCU(params);
    if (Number.isFinite(bdi) && bdi > 0 && !Number.isNaN(bdi)) {
      simulacoesValidas++;
    }

    // Monotonicidade estrita: Aumentar o Lucro deve estritamente aumentar o BDI
    const paramsMaisLucro = { ...params, lucroPercentual: l + 1.0 };
    const bdiMaisLucro = BdiCalculator.calcularTaxaBdiTCU(paramsMaisLucro);
    if (bdiMaisLucro <= bdi) {
      monotonicidadeRespeitada = false;
    }
  }

  t.igual(simulacoesValidas, 1000, 'Simulação Monte Carlo: 1.000/1.000 cálculos finitos e válidos');
  t.afirmar(monotonicidadeRespeitada, 'Monotonicidade Estrita: ∂BDI/∂L > 0 em 1.000 iterações aleatórias');
}

// 2.4 Condições de Contorno, Proteção contra Divisão por Zero e Validações
{
  // Tributos iguais a 100% -> Denominador = 0
  t.lancaErro(
    () =>
      BdiCalculator.calcularTaxaBdiTCU({
        ...BdiCalculator.PARAMETROS_TCU_PADRAO,
        tributosPercentual: 100.0,
      }),
    'Tributos = 100% rejeitados com erro seguro'
  );

  // Tributos superiores a 100%
  t.lancaErro(
    () =>
      BdiCalculator.calcularTaxaBdiTCU({
        ...BdiCalculator.PARAMETROS_TCU_PADRAO,
        tributosPercentual: 115.0,
      }),
    'Tributos > 100% rejeitados com erro seguro'
  );

  // Sobrescrita direta de BDI configurada
  const configDireta = { bdiTaxaDiretaPercentual: 22.5 };
  t.igual(BdiCalculator.obterTaxaEfetiva(configDireta), 22.5, 'Sobrescrita direta de BDI honrada');

  // Aplicação financeira de centavos
  const aplicacao = BdiCalculator.aplicarBdi(100000.0, 25.0);
  t.igual(aplicacao.subtotalDireto, 100000.0, 'Subtotal Direto formatado');
  t.igual(aplicacao.valorBdi, 25000.0, 'Valor BDI (25% de 100k = 25k)');
  t.igual(aplicacao.valorFinalComBdi, 125000.0, 'Preço Final com BDI (125k)');
}

// ============================================================================
// SUÍTE 3: MOTOR DE REGRAS PARAMÉTRICAS & ENGENHARIA DE CUSTOS SINAPI
// ============================================================================
console.log(`\n${CORES.negrito}${CORES.magenta}[SUÍTE 3] Motor de Regras Paramétricas & Engenharia de Custos SINAPI${CORES.reset}`);

// 3.1 Integridade Canônica do Catálogo SINAPI
{
  const itens = Object.values(CATALOGO_SINAPI);
  t.afirmar(itens.length >= 14, `Catálogo SINAPI contém ${itens.length} composições canônicas (mínimo 14)`);

  let balancoUnitarioValido = true;
  for (const item of itens) {
    const soma = Number((item.custoMaterial + item.custoMaoDeObra).toFixed(2));
    if (Math.abs(soma - item.custoTotal) > 0.01) {
      balancoUnitarioValido = false;
      console.error(`Erro no item ${item.codigo}: ${item.custoMaterial} + ${item.custoMaoDeObra} != ${item.custoTotal}`);
    }
  }
  t.afirmar(balancoUnitarioValido, 'Identidade Financeira Unitária: Material + M.O. == Custo Total em todas as composições');
}

// 3.2 Lógica de Áreas Molhadas vs Secas
{
  t.afirmar(RuleEngine.ehAreaMolhada('BANHEIRO'), 'Banheiro é área molhada');
  t.afirmar(RuleEngine.ehAreaMolhada('LAVABO'), 'Lavabo é área molhada');
  t.afirmar(RuleEngine.ehAreaMolhada('COZINHA'), 'Cozinha é área molhada');
  t.afirmar(RuleEngine.ehAreaMolhada('AREA_SERVICO'), 'Área de serviço é área molhada');
  t.afirmar(RuleEngine.ehAreaMolhada('VARANDA'), 'Varanda é área molhada');
  t.afirmar(!RuleEngine.ehAreaMolhada('SALA'), 'Sala é área seca');
  t.afirmar(!RuleEngine.ehAreaMolhada('DORMITORIO'), 'Dormitório é área seca');
  t.afirmar(!RuleEngine.ehAreaMolhada('SUITE'), 'Suíte (quarto) é área seca');
  t.afirmar(!RuleEngine.ehAreaMolhada('CIRCULACAO'), 'Circulação é área seca');
}

// 3.3 Dedução Paramétrica de Vãos de Esquadrias (ABNT NBR 12721)
{
  // Quarto 4m x 3m = 12 m² piso, Perímetro = 14m. Pé direito 2.70m.
  // Parede Bruta = 14 * 2.70 = 37.80 m²
  // 1 Porta (0.80 x 2.10 = 1.68 m²)
  // 1 Janela (1.20 x 1.20 = 1.44 m²)
  // Dedução total = 1.68 + 1.44 = 3.12 m²
  // Parede Líquida = 37.80 - 3.12 = 34.68 m²
  // Rodapé Líquido = 14 - 0.80 = 13.20 m
  const quartoMCP = {
    id: 'q-01',
    rotuloOriginal: 'Dormitório 01',
    categoriaSugerida: 'DORMITORIO',
    areaM2: 12.0,
    perimetroM: 14.0,
    simbolos: [
      { tipo: 'PORTA', quantidade: 1 },
      { tipo: 'JANELA', quantidade: 1 },
    ],
  };

  const orcamentoQuarto = RuleEngine.gerarOrcamentoCompleto([quartoMCP], {
    peDireitoPadraoM: 2.70,
    padraoAcabamento: 'MEDIO',
    bdiTaxaDiretaPercentual: 25.0,
  });

  const amb = orcamentoQuarto.ambientes[0];
  t.igual(amb.areaPisoM2, 12.0, 'Área Piso Quarto: 12 m²');
  t.igual(amb.areaParedesBrutaM2, 37.8, 'Área Paredes Bruta: 37.80 m²');
  t.igual(amb.vaos.areaTotalDeducoesM2, 3.12, 'Dedução de Vãos: 3.12 m²');
  t.igual(amb.areaParedesLiquidaM2, 34.68, 'Área Paredes Líquida: 34.68 m²');

  const itemRodape = amb.composicoes.find((c) => c.codigoSinapi === '88648');
  t.afirmar(!!itemRodape, 'Composição de rodapé gerada');
  t.igual(itemRodape?.quantidade, 13.2, 'Quantidade Rodapé Líquido: 13.20 m');
}

// 3.4 Padrões de Acabamento (Econômico vs Médio/Alto)
{
  const salaMCP = {
    id: 's-01',
    rotuloOriginal: 'Sala',
    categoriaSugerida: 'SALA',
    areaM2: 20.0,
    perimetroM: 18.0,
    simbolos: [],
  };

  // Econômico deve gerar cerâmica esmaltada extra (SINAPI-87265)
  const orcEcon = RuleEngine.gerarOrcamentoCompleto([salaMCP], { padraoAcabamento: 'ECONOMICO' });
  const compEcon = orcEcon.ambientes[0].composicoes;
  t.afirmar(compEcon.some((c) => c.codigoSinapi === '87265'), 'Padrão Econômico seleciona Cerâmica 87265');
  t.afirmar(!compEcon.some((c) => c.codigoSinapi === '101744'), 'Padrão Econômico NÃO usa Porcelanato 101744');

  // Médio/Alto deve gerar porcelanato retificado (SINAPI-101744)
  const orcMedio = RuleEngine.gerarOrcamentoCompleto([salaMCP], { padraoAcabamento: 'MEDIO' });
  const compMedio = orcMedio.ambientes[0].composicoes;
  t.afirmar(compMedio.some((c) => c.codigoSinapi === '101744'), 'Padrão Médio seleciona Porcelanato 101744');
  t.afirmar(!compMedio.some((c) => c.codigoSinapi === '87265'), 'Padrão Médio NÃO usa Cerâmica 87265');
}

// 3.5 Balanço Contábil Global em Apartamento Completo de 8 Cômodos
{
  const apartamento8Comodos = [
    { id: '1', rotuloOriginal: 'Sala de Estar / Jantar', categoriaSugerida: 'SALA', areaM2: 24.5, perimetroM: 19.8, simbolos: [{ tipo: 'PORTA', quantidade: 1 }, { tipo: 'JANELA', quantidade: 1 }] },
    { id: '2', rotuloOriginal: 'Cozinha', categoriaSugerida: 'COZINHA', areaM2: 9.8, perimetroM: 12.6, simbolos: [{ tipo: 'PORTA', quantidade: 1 }, { tipo: 'JANELA', quantidade: 1 }] },
    { id: '3', rotuloOriginal: 'Área de Serviço', categoriaSugerida: 'AREA_SERVICO', areaM2: 4.2, perimetroM: 8.4, simbolos: [{ tipo: 'PORTA', quantidade: 1 }] },
    { id: '4', rotuloOriginal: 'Varanda Gourmet', categoriaSugerida: 'VARANDA', areaM2: 7.5, perimetroM: 11.0, simbolos: [{ tipo: 'PORTA', quantidade: 1 }] },
    { id: '5', rotuloOriginal: 'Circulação', categoriaSugerida: 'CIRCULACAO', areaM2: 4.8, perimetroM: 10.2, simbolos: [] },
    { id: '6', rotuloOriginal: 'Dormitório 01', categoriaSugerida: 'DORMITORIO', areaM2: 11.5, perimetroM: 13.6, simbolos: [{ tipo: 'PORTA', quantidade: 1 }, { tipo: 'JANELA', quantidade: 1 }] },
    { id: '7', rotuloOriginal: 'Suíte Casal', categoriaSugerida: 'SUITE', areaM2: 14.8, perimetroM: 15.4, simbolos: [{ tipo: 'PORTA', quantidade: 1 }, { tipo: 'JANELA', quantidade: 1 }] },
    { id: '8', rotuloOriginal: 'Banheiro Social', categoriaSugerida: 'BANHEIRO', areaM2: 3.6, perimetroM: 7.6, simbolos: [{ tipo: 'PORTA', quantidade: 1 }] },
  ];

  const orcamentoApto = RuleEngine.gerarOrcamentoCompleto(apartamento8Comodos, {
    peDireitoPadraoM: 2.70,
    padraoAcabamento: 'MEDIO',
    bdiTaxaDiretaPercentual: 25.0,
  }, 'Apartamento Tipo 80m² - Edifício Horizon');

  const resumo = orcamentoApto.resumoFinanceiro;
  t.igual(resumo.areaTotalConstruidaM2, 80.7, 'Área Total Construída do Apartamento: 80.70 m²');

  // Balanço estrito
  const custoCalculado = Number((resumo.custoDiretoMaterial + resumo.custoDiretoMaoDeObra).toFixed(2));
  t.igual(resumo.custoDiretoTotal, custoCalculado, 'Balanço Global: Custo Direto == Material + M.O.');

  const precoEsperado = Number((resumo.custoDiretoTotal + resumo.valorTotalBdi).toFixed(2));
  t.igual(resumo.precoFinalVenda, precoEsperado, 'Balanço Global: Preço Final == Custo Direto + BDI');

  t.afirmar(resumo.custoMedioPorM2 > 0, 'Custo Médio por m² positivo e calculado');
}

// ============================================================================
// SUÍTE 4: GERADOR DE PLANILHA CAIXA XML (SPREADSHEETML) & SANITIZAÇÃO
// ============================================================================
console.log(`\n${CORES.negrito}${CORES.magenta}[SUÍTE 4] Gerador de Planilha Caixa XML (SpreadsheetML) & Sanitização${CORES.reset}`);

// 4.1 Escape de Caracteres XML Reservados (Prevenção de Injeção & Quebra)
{
  const textoComPerigo = `Teste & Cia <Especial> "Aspas Duplas" 'Aspas Simples' > 100`;
  const textoEscapado = ExcelCaixaGenerator.escapeXml(textoComPerigo);

  t.afirmar(!textoEscapado.includes('<Especial>'), 'Tags "<" e ">" foram escapadas');
  t.afirmar(textoEscapado.includes('&lt;Especial&gt;'), 'Substituição correta de &lt; e &gt;');
  t.afirmar(textoEscapado.includes('&amp;'), 'Substituição correta de &amp;');
  t.afirmar(textoEscapado.includes('&quot;'), 'Substituição correta de &quot;');
  t.afirmar(textoEscapado.includes('&apos;'), 'Substituição correta de &apos;');
}

// 4.2 Preservação e Robustez com Acentuação da Língua Portuguesa
{
  const projetoComAcentos = {
    id: 'ORC-TESTE',
    tituloProjeto: 'Construção & Reforma Residencial - Ação Rápida (Área Sul)',
    configuracao: { padraoAcabamento: 'MÉDIO / PADRÃO LUXO' },
    ambientes: [
      {
        id: '1',
        nome: 'ÁREA DE SERVIÇO & LAVANDERIA / DISPENSAÇÃO',
        categoria: 'AREA_SERVICO',
        peDireitoM: 2.7,
        areaPisoM2: 10.5,
        perimetroM: 13.0,
        areaParedesLiquidaM2: 32.0,
        vaos: { portasQuantidade: 1, janelasQuantidade: 0 },
        subtotalCustoDireto: 2500.0,
        subtotalComBdi: 3125.0,
        composicoes: [
          {
            codigoSinapi: '87284',
            descricao: 'CONTRAPISO EM ARGAMASSA TRAÇO 1:4 (CIMENTO E AREIA), ESPESSURA 4CM',
            unidade: 'M2',
            quantidade: 10.5,
            custoUnitarioMaterial: 18.45,
            custoUnitarioMaoDeObra: 16.80,
            custoUnitarioDireto: 35.25,
            custoTotalMaterial: 193.73,
            custoTotalMaoDeObra: 176.40,
            subtotalSemBdi: 370.13,
            valorBdiItem: 92.53,
            precoTotalComBdi: 462.66,
          },
        ],
      },
    ],
    resumoFinanceiro: {
      areaTotalConstruidaM2: 10.5,
      custoDiretoMaterial: 193.73,
      custoDiretoMaoDeObra: 176.40,
      custoDiretoTotal: 370.13,
      taxaBdiEfetivaPercentual: 25.0,
      valorTotalBdi: 92.53,
      precoFinalVenda: 462.66,
      custoMedioPorM2: 44.06,
    },
  };

  const xml = ExcelCaixaGenerator.gerarPlanilhaXml(projetoComAcentos);

  t.afirmar(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>'), 'Cabeçalho XML UTF-8 presente');
  t.afirmar(xml.includes('urn:schemas-microsoft-com:office:spreadsheet'), 'Namespace SpreadsheetML presente');
  t.afirmar(xml.includes('Resumo de Quantitativos'), 'Aba 1 (Resumo de Quantitativos) presente');
  t.afirmar(xml.includes('Planilha Orçamentária CAIXA'), 'Aba 2 (Planilha Orçamentária CAIXA) presente');

  // Validação de balanceamento de tags fundamentais
  const contarOcorrencias = (str, sub) => (str.match(new RegExp(sub, 'g')) || []).length;
  t.igual(contarOcorrencias(xml, '<Worksheet'), contarOcorrencias(xml, '</Worksheet>'), 'Tags <Worksheet> balanceadas');
  t.igual(contarOcorrencias(xml, '<Table'), contarOcorrencias(xml, '</Table>'), 'Tags <Table> balanceadas');
  t.igual(contarOcorrencias(xml, '<Row'), contarOcorrencias(xml, '</Row>'), 'Tags <Row> balanceadas');
  t.igual(contarOcorrencias(xml, '<Cell'), contarOcorrencias(xml, '</Cell>'), 'Tags <Cell> balanceadas');
  t.igual(contarOcorrencias(xml, '<Data'), contarOcorrencias(xml, '</Data>'), 'Tags <Data> balanceadas');
}

// ============================================================================
// SUÍTE 5: CARGA EXTREMA (1.000 CÔMODOS), CONCORRÊNCIA & MEMÓRIA
// ============================================================================
console.log(`\n${CORES.negrito}${CORES.magenta}[SUÍTE 5] Carga Extrema (1.000 Cômodos), Concorrência & Memória${CORES.reset}`);

// 5.1 Processamento em Lote de 1.000 Cômodos com Polígonos Aleatórios
{
  const qtdComodos = 1000;
  const comodosMassa = [];

  for (let i = 0; i < qtdComodos; i++) {
    const w = 3.0 + (i % 7) * 0.8;
    const h = 2.5 + (i % 5) * 0.9;
    const categorias = ['SALA', 'DORMITORIO', 'COZINHA', 'BANHEIRO', 'VARANDA', 'AREA_SERVICO'];
    const cat = categorias[i % categorias.length];

    comodosMassa.push({
      id: `massa-${i}`,
      rotuloOriginal: `${cat} ${i + 1}`,
      categoriaSugerida: cat,
      areaM2: Number((w * h).toFixed(2)),
      perimetroM: Number(((w + h) * 2).toFixed(2)),
      simbolos: [
        { tipo: 'PORTA', quantidade: 1 },
        { tipo: 'JANELA', quantidade: i % 2 === 0 ? 1 : 0 },
      ],
    });
  }

  const memAntes = process.memoryUsage().heapUsed;
  const tInicioCarga = performance.now();

  const projetoGigante = RuleEngine.gerarOrcamentoCompleto(comodosMassa, {
    peDireitoPadraoM: 2.70,
    padraoAcabamento: 'MEDIO',
    bdiTaxaDiretaPercentual: 25.0,
  }, 'Mega Empreendimento Imobiliário - 1.000 Ambientes');

  const xmlGigante = ExcelCaixaGenerator.gerarPlanilhaXml(projetoGigante);
  const duracaoCargaMs = performance.now() - tInicioCarga;
  const memDepois = process.memoryUsage().heapUsed;
  const deltaMemMb = (memDepois - memAntes) / (1024 * 1024);

  t.igual(projetoGigante.ambientes.length, 1000, '1.000 cômodos calculados individualmente');
  t.afirmar(projetoGigante.resumoFinanceiro.custoDiretoTotal > 0, 'Custo direto total do mega projeto calculado');
  t.afirmar(xmlGigante.length > 500000, `XML gerado para 1.000 cômodos (${(xmlGigante.length / 1024).toFixed(1)} KB)`);
  t.afirmar(duracaoCargaMs < 500.0, `Meta de Performance: 1.000 cômodos processados em < 500ms (Real: ${duracaoCargaMs.toFixed(2)} ms)`);

  console.log(`  ${CORES.ciano}ℹ Throughput:${CORES.reset} ${(qtdComodos / (duracaoCargaMs / 1000)).toFixed(0)} cômodos/segundo`);
  console.log(`  ${CORES.ciano}ℹ Consumo de Heap:${CORES.reset} ${deltaMemMb.toFixed(2)} MB`);
}

// 5.2 Teste de Concorrência Assíncrona com 50 Projetos Simultâneos
{
  const executarProjetoParalelo = async (idProjeto) => {
    const idFormatado = String(idProjeto).padStart(2, '0');
    const salas = [
      { id: '1', rotuloOriginal: `Living ${idFormatado}`, categoriaSugerida: 'SALA', areaM2: 25, perimetroM: 20, simbolos: [] },
      { id: '2', rotuloOriginal: `WC ${idFormatado}`, categoriaSugerida: 'BANHEIRO', areaM2: 4, perimetroM: 8, simbolos: [] },
    ];
    const proj = RuleEngine.gerarOrcamentoCompleto(salas, { bdiTaxaDiretaPercentual: 25.0 }, `Projeto Concorrente ${idFormatado}`);
    const xml = ExcelCaixaGenerator.gerarPlanilhaXml(proj);
    return { id: idProjeto, total: proj.resumoFinanceiro.precoFinalVenda, xmlTamanho: xml.length };
  };

  const promessas = [];
  for (let i = 0; i < 50; i++) {
    promessas.push(executarProjetoParalelo(i));
  }

  const resultados = await Promise.all(promessas);
  t.igual(resultados.length, 50, '50 projetos processados concorrentemente com Promise.all');

  const todosIguaisEValidos = resultados.every(
    (r) => r.total === resultados[0].total && r.xmlTamanho === resultados[0].xmlTamanho && r.total > 0
  );
  t.afirmar(todosIguaisEValidos, 'Determinismo estrito sob execução paralela concorrente');
}

// Emite relatório completo
t.relatorioFinal();
