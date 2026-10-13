/**
 * Normalizador Geométrico para processamento de polígonos e conversão de escala.
 * Implementa a Fórmula de Shoelace (Área de Gauss) e rotulagem arquitetônica em português.
 */

import { CategoriaAmbiente, Point2D, PoligonoAmbienteMCP, SimboloDetectado } from '../types/takeoff';

export class GeometryNormalizer {
  /**
   * Mapeamento ordenado por especificidade e prioridade arquitetônica.
   * Ambientes específicos (sanitários, varandas, circulações) têm precedência
   * sobre qualificadores gerais (ex.: 'bwc suite' -> BANHEIRO, 'circulação dos quartos' -> CIRCULACAO).
   */
  private static readonly REGRAS_CATEGORIAS: [string, CategoriaAmbiente][] = [
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
   */
  public static calcularAreaPoligono(vertices: Point2D[]): number {
    if (vertices.length < 3) return 0;

    let soma = 0;
    const n = vertices.length;

    for (let i = 0; i < n; i++) {
      const proximo = (i + 1) % n;
      soma += vertices[i].x * vertices[proximo].y - vertices[proximo].x * vertices[i].y;
    }

    return Math.abs(soma) / 2.0;
  }

  /**
   * Calcula o perímetro euclidiano linear de um polígono 2D fechado.
   */
  public static calcularPerimetroPoligono(vertices: Point2D[]): number {
    if (vertices.length < 2) return 0;

    let perimetro = 0;
    const n = vertices.length;

    for (let i = 0; i < n; i++) {
      const proximo = (i + 1) % n;
      const dx = vertices[proximo].x - vertices[i].x;
      const dy = vertices[proximo].y - vertices[i].y;
      perimetro += Math.sqrt(dx * dx + dy * dy);
    }

    return perimetro;
  }

  /**
   * Converte coordenadas em pixels para metros no mundo real utilizando o fator pixelsPorMetro.
   */
  public static converterVerticesParaMetros(verticesEmPixels: Point2D[], pixelsPorMetro: number): Point2D[] {
    if (pixelsPorMetro <= 0) {
      throw new Error('Fator de escala (pixelsPorMetro) inválido.');
    }

    return verticesEmPixels.map((p) => ({
      x: Number((p.x / pixelsPorMetro).toFixed(4)),
      y: Number((p.y / pixelsPorMetro).toFixed(4)),
    }));
  }

  /**
   * Normaliza um polígono com cálculo automático de m² e m linear.
   */
  public static normalizarAmbiente(
    id: string,
    rotuloOriginal: string,
    verticesEmMetros: Point2D[],
    simbolos: SimboloDetectado[] = []
  ): PoligonoAmbienteMCP {
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
   * Infere a categoria do ambiente a partir do texto detectado na planta.
   */
  public static inferirCategoria(texto: string): CategoriaAmbiente {
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
