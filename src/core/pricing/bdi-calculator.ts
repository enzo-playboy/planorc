/**
 * Calculadora de BDI (Benefícios e Despesas Indiretas).
 * Implementa a fórmula recomendada pelo Tribunal de Contas da União (TCU - Acórdão 2622/2013)
 * para obras públicas e estimativas da Caixa Econômica Federal.
 */

import { ConfiguracaoOrcamento, ParametrosBdiTCU } from '../types/orcamento';

export class BdiCalculator {
  /**
   * Valores médios de referência do TCU (Edificações - Faixa Média).
   */
  public static readonly PARAMETROS_TCU_PADRAO: ParametrosBdiTCU = {
    administracaoCentralPercentual: 4.0,   // AC
    seguroEGarantiaPercentual: 0.8,        // S + G
    riscoPercentual: 1.2,                  // R
    despesasFinanceirasPercentual: 1.23,   // DF
    lucroPercentual: 7.4,                  // L
    tributosPercentual: 8.65,              // PIS (0.65%) + COFINS (3.0%) + ISS (5.0%)
  };

  /**
   * Calcula a taxa de BDI efetiva em porcentagem a partir dos parâmetros do TCU:
   * BDI = { [ (1 + AC + S + R + G) * (1 + DF) * (1 + L) ] / (1 - T) } - 1
   */
  public static calcularTaxaBdiTCU(params: ParametrosBdiTCU): number {
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
   * Se houver taxa direta configurada, utiliza-a; caso contrário, utiliza a fórmula do TCU.
   */
  public static obterTaxaEfetiva(config: ConfiguracaoOrcamento): number {
    if (config.bdiTaxaDiretaPercentual !== undefined && config.bdiTaxaDiretaPercentual >= 0) {
      return Number(config.bdiTaxaDiretaPercentual.toFixed(2));
    }

    const params = config.parametrosBdiDetalhados || this.PARAMETROS_TCU_PADRAO;
    return this.calcularTaxaBdiTCU(params);
  }

  /**
   * Aplica a taxa de BDI sobre um valor de custo direto.
   */
  public static aplicarBdi(valorCustoDireto: number, taxaBdiPercentual: number): {
    subtotalDireto: number;
    valorBdi: number;
    valorFinalComBdi: number;
  } {
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
