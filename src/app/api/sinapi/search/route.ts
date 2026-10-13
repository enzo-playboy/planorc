import { NextRequest, NextResponse } from 'next/server';
import { CATALOGO_SINAPI, ReferenciaSinapi } from '@/core/pricing/sinapi-database';

export const runtime = 'nodejs';

/**
 * GET /api/sinapi/search?q=porcelanato&grupo=PISO
 * Retorna composições unitárias SINAPI correspondentes.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const termo = (searchParams.get('q') || '').toLowerCase().trim();
    const grupo = searchParams.get('grupo') as ReferenciaSinapi['macroGrupo'] | null;

    let resultados = Object.values(CATALOGO_SINAPI);

    if (grupo) {
      resultados = resultados.filter((item) => item.macroGrupo === grupo);
    }

    if (termo) {
      resultados = resultados.filter(
        (item) =>
          item.codigo.includes(termo) ||
          item.descricao.toLowerCase().includes(termo)
      );
    }

    return NextResponse.json({
      total: resultados.length,
      dados: resultados,
    });
  } catch (error) {
    const mensagem = error instanceof Error ? error.message : 'Erro na pesquisa SINAPI.';
    return NextResponse.json({ error: mensagem }, { status: 500 });
  }
}
