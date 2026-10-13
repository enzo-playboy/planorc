import { NextRequest, NextResponse } from 'next/server';
import { OrcamentoService } from '@/core/services/orcamento-service';
import { ProjetoOrcamentoBrasil } from '@/core/types/orcamento';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/takeoff/export-excel
 * Recebe o objeto do projeto de orçamento calculado e devolve a planilha
 * pronta no padrão Caixa/ABNT com duas abas formatadas.
 */
export async function POST(request: NextRequest) {
  try {
    const projeto = (await request.json()) as ProjetoOrcamentoBrasil;

    if (!projeto || !projeto.ambientes || !Array.isArray(projeto.ambientes)) {
      return NextResponse.json(
        { error: 'Dados do projeto inválidos ou incompletos para geração de planilha.' },
        { status: 400 }
      );
    }

    const service = new OrcamentoService();
    const { conteudoXml, nomeArquivoSugerido } = service.gerarPlanilhaExcel(projeto);

    return new NextResponse(conteudoXml, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.ms-excel; charset=utf-8',
        'Content-Disposition': `attachment; filename="${nomeArquivoSugerido}"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    const mensagem = error instanceof Error ? error.message : 'Falha ao gerar planilha Excel.';
    console.error('Erro em /api/takeoff/export-excel:', error);
    return NextResponse.json({ error: mensagem }, { status: 500 });
  }
}
