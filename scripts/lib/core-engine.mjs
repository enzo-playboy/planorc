/**
 * Core Engine do PlanOrc para execução nativa em Node.js (ESM).
 * Espelha integralmente os módulos TypeScript em src/core com tipagem implícita,
 * permitindo execução direta em pipelines de teste, CI e scripts sem necessidade de build.
 */

// ============================================================================
// 1. GEOMETRY NORMALIZER (Gauss / Shoelace & Classificação Arquitetônica)
// ============================================================================

export class GeometryNormalizer {
  static REGRAS_CATEGORIAS = [
    // 1. Ambientes Sanitários e Lavabos (prioridade máxima sobre suite/serviço)
    ['lavabo', 'LAVABO'],
    ['banheiro', 'BANHEIRO'],
    ['bwc', 'BANHEIRO'],
    ['wc', 'BANHEIRO'],
    ['sanitario', 'BANHEIRO'],
    ['toilet', 'BANHEIRO'],

    // 2. Sacadas e Varandas (prioridade sobre suite/dormitório)
    ['varanda', 'VARANDA'],
    ['sacada', 'VARANDA'],
    ['balcony', 'VARANDA'],
    ['terraco', 'VARANDA'],

    // 3. Circulação e Corredores (prioridade sobre quartos/suíte)
    ['circulacao', 'CIRCULACAO'],
    ['corredor', 'CIRCULACAO'],
    ['hall', 'CIRCULACAO'],
    ['passagem', 'CIRCULACAO'],

    // 4. Áreas de Serviço e Lavanderia
    ['lavanderia', 'AREA_SERVICO'],
    ['servico', 'AREA_SERVICO'],

    // 5. Cozinhas
    ['cozinha', 'COZINHA'],
    ['kitchen', 'COZINHA'],

    // 6. Garagem
    ['garagem', 'GARAGEM'],
    ['abrigo', 'GARAGEM'],
    ['garage', 'GARAGEM'],

    // 7. Suíte (quando não qualificada por BWC ou Sacada)
    ['suite', 'SUITE'],

    // 8. Dormitório
    ['dormitorio', 'DORMITORIO'],
    ['quarto', 'DORMITORIO'],
    ['bedroom', 'DORMITORIO'],
    ['closet', 'DORMITORIO'],

    // 9. Salas e Living
    ['sala', 'SALA'],
    ['estar', 'SALA'],
    ['jantar', 'SALA'],
    ['living', 'SALA'],
  ];

  /**
   * Calcula a área de um polígono 2D fechado utilizando a Fórmula de Gauss (Shoelace).
   * Suporta vértices ordenados no sentido horário ou anti-horário.
   */
  static calcularAreaPoligono(vertices) {
    if (!vertices || vertices.length < 3) return 0;

    let soma = 0;
    const n = vertices.length;

    for (let i = 0; i < n; i++) {
      const proximo = (i + 1) % n;
      soma += vertices[i].x * vertices[proximo].y - vertices[proximo].x * vertices[i].y;
    }

    return Math.abs(soma) / 2.0;
  }

  /**
   * Calcula o perímetro linear euclidiano de um polígono 2D fechado.
   */
  static calcularPerimetroPoligono(vertices) {
    if (!vertices || vertices.length < 2) return 0;

    let perimetro = 0;
    const n = vertices.length;

    for (let i = 0; i < n; i++) {
      const proximo = (i + 1) % n;
      const dx = vertices[proximo].x - vertices[i].x;
      const dy = vertices[proximo].y - vertices[i].y;
      perimetro += Math.hypot(dx, dy);
    }

    return perimetro;
  }

  /**
   * Converte coordenadas de pixels para metros no mundo real utilizando o fator pixelsPorMetro.
   */
  static converterVerticesParaMetros(verticesEmPixels, pixelsPorMetro) {
    if (!pixelsPorMetro || pixelsPorMetro <= 0) {
      throw new Error('Fator de escala (pixelsPorMetro) inválido.');
    }

    return verticesEmPixels.map((p) => ({
      x: Number((p.x / pixelsPorMetro).toFixed(4)),
      y: Number((p.y / pixelsPorMetro).toFixed(4)),
    }));
  }

  /**
   * Normaliza um ambiente com cálculo de m² e m linear.
   */
  static normalizarAmbiente(id, rotuloOriginal, verticesEmMetros, simbolos = []) {
    const areaM2 = Number(this.calcularAreaPoligono(verticesEmMetros).toFixed(2));
    const perimetroM = Number(this.calcularPerimetroPoligono(verticesEmMetros).toFixed(2));
    const categoriaSugerida = this.inferirCategoria(rotuloOriginal);

    return {
      id,
      rotuloOriginal,
      categoriaSugerida,
      vertices: verticesEmMetros,
      areaM2,
      perimetroM,
      simbolos,
    };
  }

  /**
   * Infere a categoria arquitetônica a partir do texto detectado na planta.
   */
  static inferirCategoria(texto) {
    if (!texto || typeof texto !== 'string') return 'OUTRO';

    const limpo = texto
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/w\.c\./g, 'wc')
      .replace(/w\.c/g, 'wc')
      .replace(/b\.w\.c\./g, 'bwc')
      .replace(/b\.w\.c/g, 'bwc')
      .replace(/[^a-z0-9\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    for (const [termo, categoria] of this.REGRAS_CATEGORIAS) {
      if (limpo.includes(termo)) {
        return categoria;
      }
    }

    return 'OUTRO';
  }
}

// ============================================================================
// 2. BDI CALCULATOR (Acórdão TCU 2622/2013)
// ============================================================================

export class BdiCalculator {
  static PARAMETROS_TCU_PADRAO = {
    administracaoCentralPercentual: 4.0,   // AC
    seguroEGarantiaPercentual: 0.8,        // S + G
    riscoPercentual: 1.2,                  // R
    despesasFinanceirasPercentual: 1.23,   // DF
    lucroPercentual: 7.4,                  // L
    tributosPercentual: 8.65,              // PIS (0.65%) + COFINS (3.0%) + ISS (5.0%)
  };

  /**
   * Calcula a taxa de BDI efetiva em porcentagem a partir da fórmula analítica do TCU:
   * BDI = { [ (1 + AC + S + R + G) * (1 + DF) * (1 + L) ] / (1 - T) } - 1
   */
  static calcularTaxaBdiTCU(params) {
    const ac = params.administracaoCentralPercentual / 100;
    const sg = params.seguroEGarantiaPercentual / 100;
    const r = params.riscoPercentual / 100;
    const df = params.despesasFinanceirasPercentual / 100;
    const l = params.lucroPercentual / 100;
    const t = params.tributosPercentual / 100;

    const numerador = (1 + (ac + sg + r)) * (1 + df) * (1 + l);
    const denominador = 1 - t;

    if (denominador <= 0) {
      throw new Error('A soma dos tributos não pode ser igual ou superior a 100%.');
    }

    const bdiDecimal = numerador / denominador - 1;
    return Number((bdiDecimal * 100).toFixed(2));
  }

  /**
   * Obtém a taxa de BDI final com base na configuração do projeto.
   */
  static obterTaxaEfetiva(config = {}) {
    if (config.bdiTaxaDiretaPercentual !== undefined && config.bdiTaxaDiretaPercentual >= 0) {
      return Number(config.bdiTaxaDiretaPercentual.toFixed(2));
    }

    const params = config.parametrosBdiDetalhados || this.PARAMETROS_TCU_PADRAO;
    return this.calcularTaxaBdiTCU(params);
  }

  /**
   * Aplica a taxa de BDI sobre um valor de custo direto.
   */
  static aplicarBdi(valorCustoDireto, taxaBdiPercentual) {
    const taxaDecimal = taxaBdiPercentual / 100;
    const valorBdi = Number((valorCustoDireto * taxaDecimal).toFixed(2));
    const valorFinalComBdi = Number((valorCustoDireto + valorBdi).toFixed(2));

    return {
      subtotalDireto: Number(valorCustoDireto.toFixed(2)),
      valorBdi,
      valorFinalComBdi,
    };
  }
}

// ============================================================================
// 3. BANCO DE DADOS SINAPI (Tabela Oficial Caixa Econômica Federal)
// ============================================================================

export const CATALOGO_SINAPI = {
  'SINAPI-87284': {
    codigo: '87284',
    descricao: 'CONTRAPISO EM ARGAMASSA TRAÇO 1:4 (CIMENTO E AREIA), ESPESSURA 4CM, PREPARO MECÂNICO COM BETONEIRA',
    unidade: 'M2',
    custoMaterial: 18.45,
    custoMaoDeObra: 16.80,
    custoTotal: 35.25,
    macroGrupo: 'PISO',
    padroesAtendidos: ['ECONOMICO', 'MEDIO', 'ALTO'],
  },
  'SINAPI-87265': {
    codigo: '87265',
    descricao: 'REVESTIMENTO CERÂMICO PARA PISO COM PLACAS TIPO ESMALTADA EXTRA, ASSENTAMENTO COM ARGAMASSA COLANTE AC-I',
    unidade: 'M2',
    custoMaterial: 34.20,
    custoMaoDeObra: 23.50,
    custoTotal: 57.70,
    macroGrupo: 'PISO',
    padroesAtendidos: ['ECONOMICO'],
  },
  'SINAPI-101744': {
    codigo: '101744',
    descricao: 'REVESTIMENTO DE PISO EM PORCELANATO ESMALTADO RETIFICADO 60X60CM, ASSENTAMENTO COM ARGAMASSA AC-III',
    unidade: 'M2',
    custoMaterial: 68.90,
    custoMaoDeObra: 32.10,
    custoTotal: 101.00,
    macroGrupo: 'PISO',
    padroesAtendidos: ['MEDIO', 'ALTO'],
  },
  'SINAPI-88648': {
    codigo: '88648',
    descricao: 'RODAPÉ CERÂMICO DE 7CM DE ALTURA COM PLACAS TIPO ESMALTADA, ASSENTAMENTO COM ARGAMASSA COLANTE',
    unidade: 'M',
    custoMaterial: 8.30,
    custoMaoDeObra: 6.90,
    custoTotal: 15.20,
    macroGrupo: 'PISO',
    padroesAtendidos: ['ECONOMICO', 'MEDIO'],
  },
  'SINAPI-98546': {
    codigo: '98546',
    descricao: 'IMPERMEABILIZAÇÃO DE SUPERFÍCIE COM ARGAMASSA POLIMÉRICA EM 3 DEMÃOS CRUZADAS (BOX / ÁREAS MOLHADAS)',
    unidade: 'M2',
    custoMaterial: 22.15,
    custoMaoDeObra: 15.40,
    custoTotal: 37.55,
    macroGrupo: 'IMPERMEABILIZACAO',
    padroesAtendidos: ['ECONOMICO', 'MEDIO', 'ALTO'],
  },
  'SINAPI-87447': {
    codigo: '87447',
    descricao: 'CHAPISCO APLICADO EM ALVENARIA, TRAÇO 1:3 COM PREPARO MECÂNICO',
    unidade: 'M2',
    custoMaterial: 3.10,
    custoMaoDeObra: 4.80,
    custoTotal: 7.90,
    macroGrupo: 'PAREDE',
    padroesAtendidos: ['ECONOMICO', 'MEDIO', 'ALTO'],
  },
  'SINAPI-87530': {
    codigo: '87530',
    descricao: 'EMBOÇO OU MASSA ÚNICA PARA PAREDE INTERNA, TRAÇO 1:2:8, ESPESSURA 20MM, COM PREPARO MECÂNICO',
    unidade: 'M2',
    custoMaterial: 14.50,
    custoMaoDeObra: 21.30,
    custoTotal: 35.80,
    macroGrupo: 'PAREDE',
    padroesAtendidos: ['ECONOMICO', 'MEDIO', 'ALTO'],
  },
  'SINAPI-88489': {
    codigo: '88489',
    descricao: 'APLICAÇÃO MANUAL DE PINTURA COM TINTA LÁTEX PVA EM PAREDES INTERNAS, DUAS DEMÃOS, COM FUNDO SELADOR',
    unidade: 'M2',
    custoMaterial: 7.80,
    custoMaoDeObra: 11.20,
    custoTotal: 19.00,
    macroGrupo: 'PAREDE',
    padroesAtendidos: ['ECONOMICO', 'MEDIO'],
  },
  'SINAPI-88487': {
    codigo: '88487',
    descricao: 'APLICAÇÃO DE TINTA ACRÍLICA PREMIUM LAVÁVEL EM PAREDES INTERNAS, DUAS DEMÃOS (ÁREAS MOLHADAS/COZINHAS)',
    unidade: 'M2',
    custoMaterial: 12.40,
    custoMaoDeObra: 13.90,
    custoTotal: 26.30,
    macroGrupo: 'PAREDE',
    padroesAtendidos: ['MEDIO', 'ALTO'],
  },
  'SINAPI-87271': {
    codigo: '87271',
    descricao: 'REVESTIMENTO CERÂMICO PARA PAREDE INTERNA COM PLACAS DE COR BRANCA 20X20CM (AZULEJO ATÉ O TETO)',
    unidade: 'M2',
    custoMaterial: 31.80,
    custoMaoDeObra: 26.40,
    custoTotal: 58.20,
    macroGrupo: 'PAREDE',
    padroesAtendidos: ['ECONOMICO', 'MEDIO', 'ALTO'],
  },
  'SINAPI-96523': {
    codigo: '96523',
    descricao: 'FORRO EM PLACAS DE GESSO ACARTONADO (DRYWALL), PARA AMBIENTES RESIDENCIAIS, INCLUSIVE ESTRUTURA METÁLICA',
    unidade: 'M2',
    custoMaterial: 42.60,
    custoMaoDeObra: 29.50,
    custoTotal: 72.10,
    macroGrupo: 'TETO',
    padroesAtendidos: ['ECONOMICO', 'MEDIO', 'ALTO'],
  },
  'SINAPI-88485': {
    codigo: '88485',
    descricao: 'PINTURA LÁTEX PVA EM TETO/FORRO, DUAS DEMÃOS, COM FUNDO SELADOR',
    unidade: 'M2',
    custoMaterial: 6.90,
    custoMaoDeObra: 9.80,
    custoTotal: 16.70,
    macroGrupo: 'TETO',
    padroesAtendidos: ['ECONOMICO', 'MEDIO', 'ALTO'],
  },
  'SINAPI-91341': {
    codigo: '91341',
    descricao: 'KIT DE PORTA DE MADEIRA PARA PINTURA, ABERTURA 80X210CM, COM BATENTE, FECHADURA MÉDIA E DOBRADIÇAS',
    unidade: 'UN',
    custoMaterial: 385.00,
    custoMaoDeObra: 95.00,
    custoTotal: 480.00,
    macroGrupo: 'ESQUADRIA',
    padroesAtendidos: ['ECONOMICO', 'MEDIO', 'ALTO'],
  },
  'SINAPI-94569': {
    codigo: '94569',
    descricao: 'JANELA DE CORRER EM ALUMÍNIO ANODIZADO NATURAL 120X120CM, 2 FOLHAS, COM VIDRO LISO 4MM E GUARTIÇÕES',
    unidade: 'UN',
    custoMaterial: 420.00,
    custoMaoDeObra: 80.00,
    custoTotal: 500.00,
    macroGrupo: 'ESQUADRIA',
    padroesAtendidos: ['ECONOMICO', 'MEDIO', 'ALTO'],
  },
};

export class SinapiRepository {
  static buscarPorCodigo(codigo) {
    return Object.values(CATALOGO_SINAPI).find((item) => item.codigo === codigo);
  }

  static buscarPorMacroGrupo(macroGrupo, padrao = 'MEDIO') {
    return Object.values(CATALOGO_SINAPI).filter(
      (item) => item.macroGrupo === macroGrupo && item.padroesAtendidos.includes(padrao)
    );
  }
}

// ============================================================================
// 4. MOTOR DE REGRAS PARAMÉTRICAS (ABNT NBR 12721 & SINAPI)
// ============================================================================

export class RuleEngine {
  static V_PORTA_LARGURA_M = 0.80;
  static V_PORTA_ALTURA_M = 2.10;
  static V_JANELA_LARGURA_M = 1.20;
  static V_JANELA_ALTURA_M = 1.20;

  static ehAreaMolhada(categoria) {
    return ['BANHEIRO', 'LAVABO', 'COZINHA', 'AREA_SERVICO', 'VARANDA'].includes(categoria);
  }

  static gerarOrcamentoCompleto(ambientesMCP, config = {}, tituloProjeto = 'Orçamento Executivo Residencial') {
    const taxaBdi = BdiCalculator.obterTaxaEfetiva(config);
    const ambientesCalculados = ambientesMCP.map((amb) =>
      this.calcularAmbiente(amb, config, taxaBdi)
    );

    let custoTotalMaterial = 0;
    let custoTotalMaoDeObra = 0;
    let areaTotalConstruidaM2 = 0;

    for (const amb of ambientesCalculados) {
      areaTotalConstruidaM2 += amb.areaPisoM2;
      for (const item of amb.composicoes) {
        custoTotalMaterial += item.custoTotalMaterial;
        custoTotalMaoDeObra += item.custoTotalMaoDeObra;
      }
    }

    const custoDiretoTotal = Number((custoTotalMaterial + custoTotalMaoDeObra).toFixed(2));
    const { valorBdi, valorFinalComBdi } = BdiCalculator.aplicarBdi(custoDiretoTotal, taxaBdi);
    const custoMedioPorM2 =
      areaTotalConstruidaM2 > 0 ? Number((valorFinalComBdi / areaTotalConstruidaM2).toFixed(2)) : 0;

    const resumoFinanceiro = {
      areaTotalConstruidaM2: Number(areaTotalConstruidaM2.toFixed(2)),
      custoDiretoMaterial: Number(custoTotalMaterial.toFixed(2)),
      custoDiretoMaoDeObra: Number(custoTotalMaoDeObra.toFixed(2)),
      custoDiretoTotal,
      taxaBdiEfetivaPercentual: taxaBdi,
      valorTotalBdi: valorBdi,
      precoFinalVenda: valorFinalComBdi,
      custoMedioPorM2,
    };

    return {
      id: `ORC-${Date.now()}`,
      tituloProjeto,
      dataEmissao: new Date().toISOString(),
      configuracao: config,
      ambientes: ambientesCalculados,
      resumoFinanceiro,
    };
  }

  static calcularAmbiente(ambiente, config, taxaBdi) {
    const peDireito = config.peDireitoPadraoM || 2.70;
    const ehMolhada = this.ehAreaMolhada(ambiente.categoriaSugerida);

    let portasQtd = 0;
    let janelasQtd = 0;

    for (const s of (ambiente.simbolos || [])) {
      if (s.tipo === 'PORTA') portasQtd += (s.quantidade || 1);
      if (s.tipo === 'JANELA') janelasQtd += (s.quantidade || 1);
    }

    const areaPisoM2 = Number(ambiente.areaM2.toFixed(2));
    const perimetroM = Number(ambiente.perimetroM.toFixed(2));
    const areaParedesBrutaM2 = Number((perimetroM * peDireito).toFixed(2));

    const areaTotalPortasM2 = Number((portasQtd * this.V_PORTA_LARGURA_M * this.V_PORTA_ALTURA_M).toFixed(2));
    const areaTotalJanelasM2 = Number((janelasQtd * this.V_JANELA_LARGURA_M * this.V_JANELA_ALTURA_M).toFixed(2));
    const areaTotalDeducoesM2 = Number((areaTotalPortasM2 + areaTotalJanelasM2).toFixed(2));

    const areaParedesLiquidaM2 = Math.max(0, Number((areaParedesBrutaM2 - areaTotalDeducoesM2).toFixed(2)));
    const areaTetoM2 = areaPisoM2;

    const vaos = {
      portasQuantidade: portasQtd,
      janelasQuantidade: janelasQtd,
      areaTotalPortasM2,
      areaTotalJanelasM2,
      areaTotalDeducoesM2,
    };

    const composicoes = [];

    // 1. Contrapiso argamassa 4cm (Piso)
    this.adicionarItem(composicoes, 'SINAPI-87284', areaPisoM2, taxaBdi);

    // 2. Revestimento de piso (Porcelanato ou cerâmica)
    if (config.padraoAcabamento === 'ECONOMICO') {
      this.adicionarItem(composicoes, 'SINAPI-87265', areaPisoM2, taxaBdi);
    } else {
      this.adicionarItem(composicoes, 'SINAPI-101744', areaPisoM2, taxaBdi);
    }

    // 3. Rodapé (Perímetro deduzindo largura das portas)
    const perimetroRodapeM = Math.max(0, Number((perimetroM - portasQtd * this.V_PORTA_LARGURA_M).toFixed(2)));
    if (perimetroRodapeM > 0) {
      this.adicionarItem(composicoes, 'SINAPI-88648', perimetroRodapeM, taxaBdi);
    }

    // 4. Impermeabilização em áreas molhadas
    if (ehMolhada) {
      this.adicionarItem(composicoes, 'SINAPI-98546', areaPisoM2, taxaBdi);
    }

    // 5. Paredes (Chapisco + Emboço)
    if (areaParedesLiquidaM2 > 0) {
      this.adicionarItem(composicoes, 'SINAPI-87447', areaParedesLiquidaM2, taxaBdi);
      this.adicionarItem(composicoes, 'SINAPI-87530', areaParedesLiquidaM2, taxaBdi);

      // Revestimento final da parede
      if (ambiente.categoriaSugerida === 'BANHEIRO') {
        this.adicionarItem(composicoes, 'SINAPI-87271', areaParedesLiquidaM2, taxaBdi);
      } else if (ehMolhada) {
        this.adicionarItem(composicoes, 'SINAPI-88487', areaParedesLiquidaM2, taxaBdi);
      } else {
        this.adicionarItem(composicoes, 'SINAPI-88489', areaParedesLiquidaM2, taxaBdi);
      }
    }

    // 6. Forro de Gesso + Pintura de Teto
    if (areaTetoM2 > 0) {
      this.adicionarItem(composicoes, 'SINAPI-96523', areaTetoM2, taxaBdi);
      this.adicionarItem(composicoes, 'SINAPI-88485', areaTetoM2, taxaBdi);
    }

    // 7. Esquadrias (Portas e Janelas)
    if (portasQtd > 0) {
      this.adicionarItem(composicoes, 'SINAPI-91341', portasQtd, taxaBdi);
    }
    if (janelasQtd > 0) {
      this.adicionarItem(composicoes, 'SINAPI-94569', janelasQtd, taxaBdi);
    }

    let subtotalCustoDireto = 0;
    let subtotalComBdi = 0;

    for (const item of composicoes) {
      subtotalCustoDireto += item.subtotalSemBdi;
      subtotalComBdi += item.precoTotalComBdi;
    }

    return {
      id: ambiente.id,
      nome: ambiente.rotuloOriginal || `Ambiente ${ambiente.id}`,
      categoria: ambiente.categoriaSugerida,
      ehAreaMolhada: ehMolhada,
      peDireitoM: peDireito,
      areaPisoM2,
      perimetroM,
      areaParedesBrutaM2,
      areaParedesLiquidaM2,
      areaTetoM2,
      vaos,
      composicoes,
      subtotalCustoDireto: Number(subtotalCustoDireto.toFixed(2)),
      subtotalComBdi: Number(subtotalComBdi.toFixed(2)),
    };
  }

  static adicionarItem(lista, chaveSinapi, quantidade, taxaBdi) {
    const ref = CATALOGO_SINAPI[chaveSinapi];
    if (!ref || quantidade <= 0) return;

    const custoTotalMaterial = Number((quantidade * ref.custoMaterial).toFixed(2));
    const custoTotalMaoDeObra = Number((quantidade * ref.custoMaoDeObra).toFixed(2));
    const subtotalSemBdi = Number((custoTotalMaterial + custoTotalMaoDeObra).toFixed(2));

    const { valorBdi, valorFinalComBdi } = BdiCalculator.aplicarBdi(subtotalSemBdi, taxaBdi);

    lista.push({
      codigoSinapi: ref.codigo,
      descricao: ref.descricao,
      unidade: ref.unidade,
      quantidade: Number(quantidade.toFixed(2)),
      custoUnitarioMaterial: ref.custoMaterial,
      custoUnitarioMaoDeObra: ref.custoMaoDeObra,
      custoUnitarioDireto: ref.custoTotal,
      custoTotalMaterial,
      custoTotalMaoDeObra,
      subtotalSemBdi,
      valorBdiItem: valorBdi,
      precoTotalComBdi: valorFinalComBdi,
    });
  }
}

// ============================================================================
// 5. EXCEL CAIXA GENERATOR (SpreadsheetML de 2 Abas Sanitizado)
// ============================================================================

export class ExcelCaixaGenerator {
  static escapeXml(texto) {
    if (!texto) return '';
    return String(texto)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  static gerarPlanilhaXml(projeto) {
    const { resumoFinanceiro, configuracao, ambientes } = projeto;

    return `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
 <Styles>
  <Style ss:ID="Default" ss:Name="Normal">
   <Alignment ss:Vertical="Center"/>
   <Borders/>
   <Font ss:FontName="Calibri" x:Family="Swiss" ss:Size="11" ss:Color="#000000"/>
   <Interior/>
   <NumberFormat/>
   <Protection/>
  </Style>
  <Style ss:ID="HeaderPrincipal">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Font ss:FontName="Calibri" ss:Size="14" ss:Color="#FFFFFF" ss:Bold="1"/>
   <Interior ss:Color="#1B365D" ss:Pattern="Solid"/>
  </Style>
  <Style ss:ID="HeaderSecundario">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Font ss:FontName="Calibri" ss:Size="11" ss:Color="#FFFFFF" ss:Bold="1"/>
   <Interior ss:Color="#2C5282" ss:Pattern="Solid"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#A0AEC0"/>
   </Borders>
  </Style>
  <Style ss:ID="CelulaTexto">
   <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>
  </Style>
  <Style ss:ID="CelulaCentro">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
  </Style>
  <Style ss:ID="CelulaNumero">
   <Alignment ss:Horizontal="Right" ss:Vertical="Center"/>
   <NumberFormat ss:Format="#,##0.00"/>
  </Style>
  <Style ss:ID="CelulaMoeda">
   <Alignment ss:Horizontal="Right" ss:Vertical="Center"/>
   <NumberFormat ss:Format="&quot;R$&quot;\\ #,##0.00"/>
  </Style>
  <Style ss:ID="LinhaTotal">
   <Alignment ss:Horizontal="Right" ss:Vertical="Center"/>
   <Font ss:FontName="Calibri" ss:Size="11" ss:Bold="1" ss:Color="#1A202C"/>
   <Interior ss:Color="#E2E8F0" ss:Pattern="Solid"/>
   <NumberFormat ss:Format="&quot;R$&quot;\\ #,##0.00"/>
   <Borders>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#718096"/>
    <Border ss:Position="Bottom" ss:LineStyle="Double" ss:Weight="3" ss:Color="#718096"/>
   </Borders>
  </Style>
  <Style ss:ID="LinhaTotalTexto">
   <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>
   <Font ss:FontName="Calibri" ss:Size="11" ss:Bold="1" ss:Color="#1A202C"/>
   <Interior ss:Color="#E2E8F0" ss:Pattern="Solid"/>
   <Borders>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#718096"/>
    <Border ss:Position="Bottom" ss:LineStyle="Double" ss:Weight="3" ss:Color="#718096"/>
   </Borders>
  </Style>
 </Styles>

 <!-- ABA 1: RESUMO DE QUANTITATIVOS -->
 <Worksheet ss:Name="Resumo de Quantitativos">
  <Table ss:DefaultRowHeight="20">
   <Column ss:Width="60"/>
   <Column ss:Width="150"/>
   <Column ss:Width="110"/>
   <Column ss:Width="90"/>
   <Column ss:Width="90"/>
   <Column ss:Width="80"/>
   <Column ss:Width="110"/>
   <Column ss:Width="60"/>
   <Column ss:Width="60"/>
   <Column ss:Width="120"/>
   <Column ss:Width="120"/>

   <Row ss:Height="30">
    <Cell ss:MergeAcross="10" ss:StyleID="HeaderPrincipal">
     <Data ss:Type="String">QUADRO GERAL DE QUANTITATIVOS POR AMBIENTE - ${ExcelCaixaGenerator.escapeXml((projeto.tituloProjeto || '').toUpperCase())}</Data>
    </Cell>
   </Row>

   <Row ss:Height="24">
    <Cell ss:StyleID="HeaderSecundario"><Data ss:Type="String">Item</Data></Cell>
    <Cell ss:StyleID="HeaderSecundario"><Data ss:Type="String">Ambiente</Data></Cell>
    <Cell ss:StyleID="HeaderSecundario"><Data ss:Type="String">Categoria</Data></Cell>
    <Cell ss:StyleID="HeaderSecundario"><Data ss:Type="String">Área Piso (m²)</Data></Cell>
    <Cell ss:StyleID="HeaderSecundario"><Data ss:Type="String">Perímetro (m)</Data></Cell>
    <Cell ss:StyleID="HeaderSecundario"><Data ss:Type="String">Pé-Direito (m)</Data></Cell>
    <Cell ss:StyleID="HeaderSecundario"><Data ss:Type="String">Paredes Líq. (m²)</Data></Cell>
    <Cell ss:StyleID="HeaderSecundario"><Data ss:Type="String">Portas (un)</Data></Cell>
    <Cell ss:StyleID="HeaderSecundario"><Data ss:Type="String">Janelas (un)</Data></Cell>
    <Cell ss:StyleID="HeaderSecundario"><Data ss:Type="String">Custo Direto (R$)</Data></Cell>
    <Cell ss:StyleID="HeaderSecundario"><Data ss:Type="String">Preço Final (R$)</Data></Cell>
   </Row>

   ${ambientes
     .map(
       (amb, index) => `
   <Row>
    <Cell ss:StyleID="CelulaCentro"><Data ss:Type="String">${(index + 1).toString().padStart(2, '0')}</Data></Cell>
    <Cell ss:StyleID="CelulaTexto"><Data ss:Type="String">${ExcelCaixaGenerator.escapeXml(amb.nome)}</Data></Cell>
    <Cell ss:StyleID="CelulaCentro"><Data ss:Type="String">${ExcelCaixaGenerator.escapeXml(amb.categoria)}</Data></Cell>
    <Cell ss:StyleID="CelulaNumero"><Data ss:Type="Number">${amb.areaPisoM2}</Data></Cell>
    <Cell ss:StyleID="CelulaNumero"><Data ss:Type="Number">${amb.perimetroM}</Data></Cell>
    <Cell ss:StyleID="CelulaNumero"><Data ss:Type="Number">${amb.peDireitoM}</Data></Cell>
    <Cell ss:StyleID="CelulaNumero"><Data ss:Type="Number">${amb.areaParedesLiquidaM2}</Data></Cell>
    <Cell ss:StyleID="CelulaCentro"><Data ss:Type="Number">${amb.vaos.portasQuantidade}</Data></Cell>
    <Cell ss:StyleID="CelulaCentro"><Data ss:Type="Number">${amb.vaos.janelasQuantidade}</Data></Cell>
    <Cell ss:StyleID="CelulaMoeda"><Data ss:Type="Number">${amb.subtotalCustoDireto}</Data></Cell>
    <Cell ss:StyleID="CelulaMoeda"><Data ss:Type="Number">${amb.subtotalComBdi}</Data></Cell>
   </Row>`
     )
     .join('')}

   <Row ss:Height="22">
    <Cell ss:MergeAcross="2" ss:StyleID="LinhaTotalTexto"><Data ss:Type="String">TOTAIS CONSOLIDADOS</Data></Cell>
    <Cell ss:StyleID="LinhaTotal"><Data ss:Type="Number">${resumoFinanceiro.areaTotalConstruidaM2}</Data></Cell>
    <Cell ss:StyleID="LinhaTotal"><Data ss:Type="String">-</Data></Cell>
    <Cell ss:StyleID="LinhaTotal"><Data ss:Type="String">-</Data></Cell>
    <Cell ss:StyleID="LinhaTotal"><Data ss:Type="String">-</Data></Cell>
    <Cell ss:StyleID="LinhaTotal"><Data ss:Type="String">-</Data></Cell>
    <Cell ss:StyleID="LinhaTotal"><Data ss:Type="String">-</Data></Cell>
    <Cell ss:StyleID="LinhaTotal"><Data ss:Type="Number">${resumoFinanceiro.custoDiretoTotal}</Data></Cell>
    <Cell ss:StyleID="LinhaTotal"><Data ss:Type="Number">${resumoFinanceiro.precoFinalVenda}</Data></Cell>
   </Row>
  </Table>
 </Worksheet>

 <!-- ABA 2: PLANILHA ORÇAMENTÁRIA SINAPI -->
 <Worksheet ss:Name="Planilha Orçamentária CAIXA">
  <Table ss:DefaultRowHeight="20">
   <Column ss:Width="50"/>
   <Column ss:Width="80"/>
   <Column ss:Width="300"/>
   <Column ss:Width="50"/>
   <Column ss:Width="70"/>
   <Column ss:Width="90"/>
   <Column ss:Width="90"/>
   <Column ss:Width="100"/>
   <Column ss:Width="100"/>
   <Column ss:Width="90"/>
   <Column ss:Width="110"/>

   <Row ss:Height="26">
    <Cell ss:MergeAcross="10" ss:StyleID="HeaderPrincipal">
     <Data ss:Type="String">ORÇAMENTO DISCRIMINADO DE SERVIÇOS (TABELA SINAPI / CEF)</Data>
    </Cell>
   </Row>
   <Row>
    <Cell ss:MergeAcross="1" ss:StyleID="CelulaTexto"><Data ss:Type="String">Projeto:</Data></Cell>
    <Cell ss:MergeAcross="4" ss:StyleID="CelulaTexto"><Data ss:Type="String">${ExcelCaixaGenerator.escapeXml(projeto.tituloProjeto)}</Data></Cell>
    <Cell ss:MergeAcross="1" ss:StyleID="CelulaTexto"><Data ss:Type="String">Taxa BDI Aplicada:</Data></Cell>
    <Cell ss:MergeAcross="2" ss:StyleID="CelulaNumero"><Data ss:Type="Number">${resumoFinanceiro.taxaBdiEfetivaPercentual}</Data></Cell>
   </Row>
   <Row>
    <Cell ss:MergeAcross="1" ss:StyleID="CelulaTexto"><Data ss:Type="String">Área Construída:</Data></Cell>
    <Cell ss:MergeAcross="4" ss:StyleID="CelulaTexto"><Data ss:Type="String">${resumoFinanceiro.areaTotalConstruidaM2} m²</Data></Cell>
    <Cell ss:MergeAcross="1" ss:StyleID="CelulaTexto"><Data ss:Type="String">Padrão de Acabamento:</Data></Cell>
    <Cell ss:MergeAcross="2" ss:StyleID="CelulaTexto"><Data ss:Type="String">${ExcelCaixaGenerator.escapeXml(configuracao.padraoAcabamento || 'MEDIO')}</Data></Cell>
   </Row>

   <Row ss:Height="24">
    <Cell ss:StyleID="HeaderSecundario"><Data ss:Type="String">Item</Data></Cell>
    <Cell ss:StyleID="HeaderSecundario"><Data ss:Type="String">Código</Data></Cell>
    <Cell ss:StyleID="HeaderSecundario"><Data ss:Type="String">Descrição do Serviço</Data></Cell>
    <Cell ss:StyleID="HeaderSecundario"><Data ss:Type="String">Unid.</Data></Cell>
    <Cell ss:StyleID="HeaderSecundario"><Data ss:Type="String">Qtd.</Data></Cell>
    <Cell ss:StyleID="HeaderSecundario"><Data ss:Type="String">Unit. Mat. (R$)</Data></Cell>
    <Cell ss:StyleID="HeaderSecundario"><Data ss:Type="String">Unit. M.O. (R$)</Data></Cell>
    <Cell ss:StyleID="HeaderSecundario"><Data ss:Type="String">Preço Unit. (R$)</Data></Cell>
    <Cell ss:StyleID="HeaderSecundario"><Data ss:Type="String">Total Sem BDI (R$)</Data></Cell>
    <Cell ss:StyleID="HeaderSecundario"><Data ss:Type="String">BDI Rateado (R$)</Data></Cell>
    <Cell ss:StyleID="HeaderSecundario"><Data ss:Type="String">Total Com BDI (R$)</Data></Cell>
   </Row>

   ${this.gerarLinhasItensSinapi(ambientes)}

   <Row ss:Height="24">
    <Cell ss:MergeAcross="7" ss:StyleID="LinhaTotalTexto"><Data ss:Type="String">CUSTO DIRETO TOTAL (MATERIAL + MÃO DE OBRA)</Data></Cell>
    <Cell ss:StyleID="LinhaTotal"><Data ss:Type="Number">${resumoFinanceiro.custoDiretoTotal}</Data></Cell>
    <Cell ss:StyleID="LinhaTotal"><Data ss:Type="Number">${resumoFinanceiro.valorTotalBdi}</Data></Cell>
    <Cell ss:StyleID="LinhaTotal"><Data ss:Type="Number">${resumoFinanceiro.precoFinalVenda}</Data></Cell>
   </Row>
  </Table>
 </Worksheet>
</Workbook>`;
  }

  static gerarLinhasItensSinapi(ambientes) {
    let linhas = '';
    let itemContadorGeral = 1;

    for (let i = 0; i < ambientes.length; i++) {
      const amb = ambientes[i];
      linhas += `
   <Row ss:Height="22">
    <Cell ss:MergeAcross="10" ss:StyleID="HeaderSecundario">
     <Data ss:Type="String">${(i + 1).toString().padStart(2, '0')}. AMBIENTE: ${ExcelCaixaGenerator.escapeXml((amb.nome || '').toUpperCase())} (${amb.areaPisoM2} m²)</Data>
    </Cell>
   </Row>`;

      for (let j = 0; j < amb.composicoes.length; j++) {
        const comp = amb.composicoes[j];
        const itemNumero = `${i + 1}.${j + 1}`;

        linhas += `
   <Row>
    <Cell ss:StyleID="CelulaCentro"><Data ss:Type="String">${itemNumero}</Data></Cell>
    <Cell ss:StyleID="CelulaCentro"><Data ss:Type="String">${ExcelCaixaGenerator.escapeXml(comp.codigoSinapi)}</Data></Cell>
    <Cell ss:StyleID="CelulaTexto"><Data ss:Type="String">${ExcelCaixaGenerator.escapeXml(comp.descricao)}</Data></Cell>
    <Cell ss:StyleID="CelulaCentro"><Data ss:Type="String">${ExcelCaixaGenerator.escapeXml(comp.unidade)}</Data></Cell>
    <Cell ss:StyleID="CelulaNumero"><Data ss:Type="Number">${comp.quantidade}</Data></Cell>
    <Cell ss:StyleID="CelulaMoeda"><Data ss:Type="Number">${comp.custoUnitarioMaterial}</Data></Cell>
    <Cell ss:StyleID="CelulaMoeda"><Data ss:Type="Number">${comp.custoUnitarioMaoDeObra}</Data></Cell>
    <Cell ss:StyleID="CelulaMoeda"><Data ss:Type="Number">${comp.custoUnitarioDireto}</Data></Cell>
    <Cell ss:StyleID="CelulaMoeda"><Data ss:Type="Number">${comp.subtotalSemBdi}</Data></Cell>
    <Cell ss:StyleID="CelulaMoeda"><Data ss:Type="Number">${comp.valorBdiItem}</Data></Cell>
    <Cell ss:StyleID="CelulaMoeda"><Data ss:Type="Number">${comp.precoTotalComBdi}</Data></Cell>
   </Row>`;
        itemContadorGeral++;
      }
    }

    return linhas;
  }
}
