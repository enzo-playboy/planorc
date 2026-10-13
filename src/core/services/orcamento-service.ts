/**
 * Serviço de Fachada e Orquestração do Orçamento Executivo.
 * Une a extração geométrica do MCP ao motor de regras SINAPI e exportação Excel.
 */

import { OpenTakeoffClient, OpcoesProcessamentoTakeoff } from '../mcp/opentakeoff-client';
import { RuleEngine } from '../pricing/rule-engine';
import { ExcelCaixaGenerator } from '../exporter/excel-caixa-generator';
import { ConfiguracaoOrcamento, ProjetoOrcamentoBrasil } from '../types/orcamento';
import { ResultadoExtracaoMCP } from '../types/takeoff';

export interface SolicitacaoProcessamentoPlanta {
  nomeArquivo: string;
  bufferOuCaminho: Buffer | string;
  configuracaoOrcamento?: Partial<ConfiguracaoOrcamento>;
  opcoesTakeoff?: OpcoesProcessamentoTakeoff;
  tituloProjeto?: string;
}

export class OrcamentoService {
  private readonly takeoffClient: OpenTakeoffClient;

  constructor(takeoffClient?: OpenTakeoffClient) {
    this.takeoffClient = takeoffClient || new OpenTakeoffClient();
  }

  /**
   * Executa o pipeline completo:
   * 1. Extração geométrica e contagem de itens (OpenTakeoff MCP).
   * 2. Aplicação das regras de negócio brasileiras (SINAPI / TCU).
   * 3. Retorno do projeto orçamentário consolidado.
   */
  public async processarPlantaEOrcar(
    solicitacao: SolicitacaoProcessamentoPlanta
  ): Promise<{
    projeto: ProjetoOrcamentoBrasil;
    extracaoMCP: ResultadoExtracaoMCP;
  }> {
    const configPadrao: ConfiguracaoOrcamento = {
      peDireitoPadraoM: 2.70,
      padraoAcabamento: 'MEDIO',
      desoneracaoFolha: false,
      ufTabelaSinapi: 'SP',
      bdiTaxaDiretaPercentual: 25.0, // 25% de BDI padrão de mercado
      ...solicitacao.configuracaoOrcamento,
    };

    // 1. Extrai a geometria via MCP
    const extracaoMCP = await this.takeoffClient.processarFolha(
      solicitacao.nomeArquivo,
      solicitacao.bufferOuCaminho,
      solicitacao.opcoesTakeoff
    );

    // 2. Calcula as composições SINAPI e o BDI
    const projeto = RuleEngine.gerarOrcamentoCompleto(
      extracaoMCP.ambientes,
      configPadrao,
      solicitacao.tituloProjeto || `Orçamento - ${solicitacao.nomeArquivo}`
    );

    return {
      projeto,
      extracaoMCP,
    };
  }

  /**
   * Gera o arquivo da planilha orçamentária pronto para download.
   */
  public gerarPlanilhaExcel(projeto: ProjetoOrcamentoBrasil): {
    conteudoXml: string;
    nomeArquivoSugerido: string;
    mimeType: string;
  } {
    const conteudoXml = ExcelCaixaGenerator.gerarPlanilhaXml(projeto);
    const nomeLimpo = projeto.tituloProjeto
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9_-]/g, '_');

    return {
      conteudoXml,
      nomeArquivoSugerido: `${nomeLimpo}_orcamento_sinapi.xlsx`,
      mimeType: 'application/vnd.ms-excel',
    };
  }
}
