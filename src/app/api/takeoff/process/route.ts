import { NextRequest, NextResponse } from 'next/server';
import { OrcamentoService } from '@/core/services/orcamento-service';
import { ConfiguracaoOrcamento } from '@/core/types/orcamento';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/takeoff/process
 * Recebe o arquivo da planta baixa (PDF/Imagem) ou parâmetros de medição,
 * executa a extração geométrica via MCP e calcula o orçamento SINAPI com BDI.
 */
export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || '';

    let nomeArquivo = 'planta_baixa.pdf';
    let bufferOuCaminho: Buffer | string = '';
    let configuracao: Partial<ConfiguracaoOrcamento> = {};
    let tituloProjeto = 'Orçamento Residencial Automatizado';

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const file = formData.get('file') as File | null;
      const configJson = formData.get('config') as string | null;
      const titulo = formData.get('titulo') as string | null;

      if (!file) {
        return NextResponse.json(
          { error: 'Nenhum arquivo enviado no campo "file".' },
          { status: 400 }
        );
      }

      nomeArquivo = file.name;
      const arrayBuffer = await file.arrayBuffer();
      bufferOuCaminho = Buffer.from(arrayBuffer);

      if (configJson) {
        try {
          configuracao = JSON.parse(configJson);
        } catch {
          // Mantém valores padrão
        }
      }

      if (titulo) {
        tituloProjeto = titulo;
      }
    } else {
      // Suporte para requisições JSON diretas (modo teste/demonstração)
      const body = await request.json().catch(() => ({}));
      nomeArquivo = body.nomeArquivo || 'planta_demonstrativa.pdf';
      bufferOuCaminho = 'demo_path';
      configuracao = body.configuracao || {};
      tituloProjeto = body.tituloProjeto || tituloProjeto;
    }

    const service = new OrcamentoService();
    const resultado = await service.processarPlantaEOrcar({
      nomeArquivo,
      bufferOuCaminho,
      configuracaoOrcamento: configuracao,
      tituloProjeto,
    });

    return NextResponse.json(
      {
        sucesso: true,
        projeto: resultado.projeto,
        geometria: resultado.extracaoMCP,
      },
      { status: 200 }
    );
  } catch (error) {
    const mensagem = error instanceof Error ? error.message : 'Erro interno ao processar a planta.';
    console.error('Erro em /api/takeoff/process:', error);
    return NextResponse.json({ sucesso: false, error: mensagem }, { status: 500 });
  }
}
