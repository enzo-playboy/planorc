/**
 * Tipos e esquemas de dados de Engenharia Civil e Orçamentação Brasileira.
 * Compatível com padrões SINAPI / CAIXA e Acórdão 2622/2013 TCU para BDI.
 */

import { CategoriaAmbiente } from './takeoff';

export type UnidadeMedida = 'M2' | 'M' | 'UN' | 'M3' | 'KG' | 'H';

export interface ItemComposicaoSinapi {
  codigoSinapi: string;
  descricao: string;
  unidade: UnidadeMedida;
  quantidade: number;
  custoUnitarioMaterial: number;
  custoUnitarioMaoDeObra: number;
  custoUnitarioDireto: number;
  custoTotalMaterial: number;
  custoTotalMaoDeObra: number;
  subtotalSemBdi: number;
  valorBdiItem: number;
  precoTotalComBdi: number;
}

export interface DetalhamentoVaos {
  portasQuantidade: number;
  janelasQuantidade: number;
  areaTotalPortasM2: number;
  areaTotalJanelasM2: number;
  areaTotalDeducoesM2: number;
}

export interface AmbienteCalculado {
  id: string;
  nome: string;
  categoria: CategoriaAmbiente;
  ehAreaMolhada: boolean;
  peDireitoM: number;
  areaPisoM2: number;
  perimetroM: number;
  areaParedesBrutaM2: number;
  areaParedesLiquidaM2: number;
  areaTetoM2: number;
  vaos: DetalhamentoVaos;
  composicoes: ItemComposicaoSinapi[];
  subtotalCustoDireto: number;
  subtotalComBdi: number;
}

export interface ParametrosBdiTCU {
  administracaoCentralPercentual: number; // AC: tipicamente 3.0% a 5.5%
  seguroEGarantiaPercentual: number;      // S + G: tipicamente 0.8% a 1.2%
  riscoPercentual: number;                 // R: tipicamente 0.97% a 1.27%
  despesasFinanceirasPercentual: number;  // DF: tipicamente 0.59% a 1.39%
  lucroPercentual: number;                // L: tipicamente 6.16% a 8.96%
  tributosPercentual: number;             // PIS + COFINS + ISS: tipicamente 5.65% a 8.65%
}

export interface ConfiguracaoOrcamento {
  bdiTaxaDiretaPercentual?: number;
  parametrosBdiDetalhados?: ParametrosBdiTCU;
  peDireitoPadraoM: number; // Normalmente 2.70m a 3.00m
  padraoAcabamento: 'ECONOMICO' | 'MEDIO' | 'ALTO';
  desoneracaoFolha: boolean;
  ufTabelaSinapi: 'SP' | 'RJ' | 'MG' | 'RS' | 'PR' | 'BA' | 'DF' | 'PE' | 'CE' | 'SC' | 'GO';
}

export interface ResumoFinanceiroOrcamento {
  areaTotalConstruidaM2: number;
  custoDiretoMaterial: number;
  custoDiretoMaoDeObra: number;
  custoDiretoTotal: number;
  taxaBdiEfetivaPercentual: number;
  valorTotalBdi: number;
  precoFinalVenda: number;
  custoMedioPorM2: number;
}

export interface ProjetoOrcamentoBrasil {
  id: string;
  tituloProjeto: string;
  codigoArt?: string;
  responsavelTecnico?: string;
  dataEmissao: string;
  configuracao: ConfiguracaoOrcamento;
  ambientes: AmbienteCalculado[];
  resumoFinanceiro: ResumoFinanceiroOrcamento;
}
