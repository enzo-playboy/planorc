/**
 * Motor de Regras de Associação e Precificação da Engenharia Civil Brasileira.
 * Mapeia geometrias brutas em composições de custos e quantitativos SINAPI.
 */

import { PoligonoAmbienteMCP } from '../types/takeoff';
import {
  AmbienteCalculado,
  ConfiguracaoOrcamento,
  DetalhamentoVaos,
  ItemComposicaoSinapi,
  ProjetoOrcamentoBrasil,
  ResumoFinanceiroOrcamento,
} from '../types/orcamento';
import { CATALOGO_SINAPI, ReferenciaSinapi } from './sinapi-database';
import { BdiCalculator } from './bdi-calculator';

export class RuleEngine {
  private static readonly V_PORTA_LARGURA_M = 0.80;
  private static readonly V_PORTA_ALTURA_M = 2.10;
  private static readonly V_JANELA_LARGURA_M = 1.20;
  private static readonly V_JANELA_ALTURA_M = 1.20;

  /**
   * Identifica se a categoria do ambiente requer tratamento como área molhada/molhável.
   */
  public static ehAreaMolhada(categoria: PoligonoAmbienteMCP['categoriaSugerida']): boolean {
    return ['BANHEIRO', 'LAVABO', 'COZINHA', 'AREA_SERVICO', 'VARANDA'].includes(categoria);
  }

  /**
   * Processa a lista de ambientes medidos e retorna o projeto de orçamento consolidado.
   */
  public static gerarOrcamentoCompleto(
    ambientesMCP: PoligonoAmbienteMCP[],
    config: ConfiguracaoOrcamento,
    tituloProjeto: string = 'Orçamento Executivo Residencial'
  ): ProjetoOrcamentoBrasil {
    const taxaBdi = BdiCalculator.obterTaxaEfetiva(config);
    const ambientesCalculados: AmbienteCalculado[] = ambientesMCP.map((amb) =>
      this.calcularAmbiente(amb, config, taxaBdi)
    );

    // Consolidação financeira do projeto
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

    const resumoFinanceiro: ResumoFinanceiroOrcamento = {
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

  /**
   * Realiza os cálculos de engenharia para um único ambiente.
   */
  private static calcularAmbiente(
    ambiente: PoligonoAmbienteMCP,
    config: ConfiguracaoOrcamento,
    taxaBdi: number
  ): AmbienteCalculado {
    const peDireito = config.peDireitoPadraoM || 2.70;
    const ehMolhada = this.ehAreaMolhada(ambiente.categoriaSugerida);

    // Contagem de portas e janelas
    let portasQtd = 0;
    let janelasQtd = 0;

    for (const s of ambiente.simbolos) {
      if (s.tipo === 'PORTA') portasQtd += 1;
      if (s.tipo === 'JANELA') janelasQtd += 1;
    }

    // Área e perímetro
    const areaPisoM2 = Number(ambiente.areaM2.toFixed(2));
    const perimetroM = Number(ambiente.perimetroM.toFixed(2));
    const areaParedesBrutaM2 = Number((perimetroM * peDireito).toFixed(2));

    const areaTotalPortasM2 = Number((portasQtd * this.V_PORTA_LARGURA_M * this.V_PORTA_ALTURA_M).toFixed(2));
    const areaTotalJanelasM2 = Number((janelasQtd * this.V_JANELA_LARGURA_M * this.V_JANELA_ALTURA_M).toFixed(2));
    const areaTotalDeducoesM2 = Number((areaTotalPortasM2 + areaTotalJanelasM2).toFixed(2));

    const areaParedesLiquidaM2 = Math.max(0, Number((areaParedesBrutaM2 - areaTotalDeducoesM2).toFixed(2)));
    const areaTetoM2 = areaPisoM2;

    const vaos: DetalhamentoVaos = {
      portasQuantidade: portasQtd,
      janelasQuantidade: janelasQtd,
      areaTotalPortasM2,
      areaTotalJanelasM2,
      areaTotalDeducoesM2,
    };

    // Associação de composições
    const composicoes: ItemComposicaoSinapi[] = [];

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

    // Subtotais do ambiente
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

  /**
   * Constrói e anexa uma composição unitária com cálculos de material, mão de obra e BDI.
   */
  private static adicionarItem(
    lista: ItemComposicaoSinapi[],
    chaveSinapi: string,
    quantidade: number,
    taxaBdi: number
  ): void {
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
