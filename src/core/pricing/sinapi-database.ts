/**
 * Catálogo Canônico de Composições Unitárias SINAPI (Caixa Econômica Federal).
 * Base referencial para cálculo de custo direto desmembrado em Material e Mão de Obra.
 */

import { UnidadeMedida } from '../types/orcamento';

export interface ReferenciaSinapi {
  codigo: string;
  descricao: string;
  unidade: UnidadeMedida;
  custoMaterial: number;
  custoMaoDeObra: number;
  custoTotal: number;
  macroGrupo: 'PISO' | 'PAREDE' | 'TETO' | 'ESQUADRIA' | 'IMPERMEABILIZACAO' | 'INSTALACOES';
  padroesAtendidos: Array<'ECONOMICO' | 'MEDIO' | 'ALTO'>;
}

export const CATALOGO_SINAPI: Record<string, ReferenciaSinapi> = {
  // --- PISOS E REVESTIMENTOS DE PISO ---
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

  // --- PAREDES E REVESTIMENTOS VERTICAIS ---
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

  // --- TETO / FORRO ---
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

  // --- ESQUADRIAS E KITS ---
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
  public static buscarPorCodigo(codigo: string): ReferenciaSinapi | undefined {
    return Object.values(CATALOGO_SINAPI).find((item) => item.codigo === codigo);
  }

  public static buscarPorMacroGrupo(
    macroGrupo: ReferenciaSinapi['macroGrupo'],
    padrao: 'ECONOMICO' | 'MEDIO' | 'ALTO' = 'MEDIO'
  ): ReferenciaSinapi[] {
    return Object.values(CATALOGO_SINAPI).filter(
      (item) => item.macroGrupo === macroGrupo && item.padroesAtendidos.includes(padrao)
    );
  }
}
