/**
 * Tipos e esquemas para a camada de medição e geometria (OpenTakeoff MCP).
 * Representa os dados brutos de geometria e a normalização técnica.
 */

export interface Point2D {
  x: number;
  y: number;
}

export type TipoAbertura = 'PORTA' | 'JANELA' | 'PASSAGEM_LIVRE';

export interface SimboloDetectado {
  id: string;
  tipo: TipoAbertura;
  larguraM: number;
  alturaM: number;
  posicao: Point2D;
  rotacaoGraus?: number;
}

export type CategoriaAmbiente =
  | 'SALA'
  | 'DORMITORIO'
  | 'SUITE'
  | 'COZINHA'
  | 'BANHEIRO'
  | 'LAVABO'
  | 'AREA_SERVICO'
  | 'CIRCULACAO'
  | 'VARANDA'
  | 'GARAGEM'
  | 'OUTRO';

export interface PoligonoAmbienteMCP {
  id: string;
  rotuloOriginal: string; // Ex: "BEDROOM 1", "LIVING", "WC"
  categoriaSugerida: CategoriaAmbiente;
  vertices: Point2D[];
  areaM2: number;
  perimetroM: number;
  simbolos: SimboloDetectado[];
}

export interface MetadadosPrancha {
  nomeArquivo: string;
  escalaIdentificada: string; // Ex: "1:50", "1:100"
  pixelsPorMetro: number;
  larguraPixels: number;
  alturaPixels: number;
  dataProcessamento: string;
}

export interface ResultadoExtracaoMCP {
  sucesso: boolean;
  metadados: MetadadosPrancha;
  ambientes: PoligonoAmbienteMCP[];
  avisosOuLimitacoes: string[];
}
