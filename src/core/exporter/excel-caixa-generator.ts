/**
 * Gerador de Planilha Orçamentária padrão Caixa Econômica Federal / ABNT.
 * Produz documentos no padrão SpreadsheetML (XML do Excel) ou dados estruturados para ExcelJS,
 * com 2 abas técnicas:
 *   Aba 1: Resumo de Quantitativos por Ambiente
 *   Aba 2: Planilha Orçamentária Detalhada (SINAPI com Material, Mão de Obra e BDI)
 */

import { ProjetoOrcamentoBrasil } from '../types/orcamento';

export class ExcelCaixaGenerator {
  /**
   * Escapa caracteres reservados do XML para prevenir corrupção e injeção no SpreadsheetML.
   */
  public static escapeXml(texto: string | null | undefined): string {
    if (!texto) return '';
    return String(texto)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  /**
   * Formata números para o padrão monetário brasileiro.
   */
  private static formatarMoeda(valor: number): string {
    return valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  /**
   * Gera o conteúdo XML completo no formato Microsoft Excel SpreadsheetML.
   * Totalmente compatível com Microsoft Excel, LibreOffice Calc e Google Planilhas.
   */
  public static gerarPlanilhaXml(projeto: ProjetoOrcamentoBrasil): string {
    const { resumoFinanceiro, configuracao, ambientes } = projeto;

    return `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
 <Styles>
  <Style ss:ID="Default" ss:Name="Normal">
   <Alignment ss:Vertical="Center"/>
   <Borders/>
   <Font ss:FontName="Calibri" x:Family="Swiss" ss:Size="11" ss:Color="#000000"/>
   <Interior/>
   <NumberFormat/>
   <Protection/>
  </Style>
  <!-- Estilos de Cabeçalho Corporativo -->
  <Style ss:ID="HeaderPrincipal">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Font ss:FontName="Calibri" ss:Size="14" ss:Color="#FFFFFF" ss:Bold="1"/>
   <Interior ss:Color="#1B365D" ss:Pattern="Solid"/>
  </Style>
  <Style ss:ID="HeaderSecundario">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Font ss:FontName="Calibri" ss:Size="11" ss:Color="#FFFFFF" ss:Bold="1"/>
   <Interior ss:Color="#2C5282" ss:Pattern="Solid"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#A0AEC0"/>
   </Borders>
  </Style>
  <!-- Estilos de Dados e Moeda -->
  <Style ss:ID="CelulaTexto">
   <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>
  </Style>
  <Style ss:ID="CelulaCentro">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
  </Style>
  <Style ss:ID="CelulaNumero">
   <Alignment ss:Horizontal="Right" ss:Vertical="Center"/>
   <NumberFormat ss:Format="#,##0.00"/>
  </Style>
  <Style ss:ID="CelulaMoeda">
   <Alignment ss:Horizontal="Right" ss:Vertical="Center"/>
   <NumberFormat ss:Format="&quot;R$&quot;\ #,##0.00"/>
  </Style>
  <!-- Estilos de Totais -->
  <Style ss:ID="LinhaTotal">
   <Alignment ss:Horizontal="Right" ss:Vertical="Center"/>
   <Font ss:FontName="Calibri" ss:Size="11" ss:Bold="1" ss:Color="#1A202C"/>
   <Interior ss:Color="#E2E8F0" ss:Pattern="Solid"/>
   <NumberFormat ss:Format="&quot;R$&quot;\ #,##0.00"/>
   <Borders>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#718096"/>
    <Border ss:Position="Bottom" ss:LineStyle="Double" ss:Weight="3" ss:Color="#718096"/>
   </Borders>
  </Style>
  <Style ss:ID="LinhaTotalTexto">
   <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>
   <Font ss:FontName="Calibri" ss:Size="11" ss:Bold="1" ss:Color="#1A202C"/>
   <Interior ss:Color="#E2E8F0" ss:Pattern="Solid"/>
   <Borders>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#718096"/>
    <Border ss:Position="Bottom" ss:LineStyle="Double" ss:Weight="3" ss:Color="#718096"/>
   </Borders>
  </Style>
 </Styles>

 <!-- ================= ABA 1: RESUMO DE QUANTITATIVOS ================= -->
 <Worksheet ss:Name="Resumo de Quantitativos">
  <Table ss:DefaultRowHeight="20">
   <Column ss:Width="60"/>
   <Column ss:Width="150"/>
   <Column ss:Width="110"/>
   <Column ss:Width="90"/>
   <Column ss:Width="90"/>
   <Column ss:Width="80"/>
   <Column ss:Width="110"/>
   <Column ss:Width="60"/>
   <Column ss:Width="60"/>
   <Column ss:Width="120"/>
   <Column ss:Width="120"/>

   <!-- Título -->
   <Row ss:Height="30">
    <Cell ss:MergeAcross="10" ss:StyleID="HeaderPrincipal">
     <Data ss:Type="String">QUADRO GERAL DE QUANTITATIVOS POR AMBIENTE - ${ExcelCaixaGenerator.escapeXml(projeto.tituloProjeto.toUpperCase())}</Data>
    </Cell>
   </Row>

   <!-- Cabeçalho das Colunas -->
   <Row ss:Height="24">
    <Cell ss:StyleID="HeaderSecundario"><Data ss:Type="String">Item</Data></Cell>
    <Cell ss:StyleID="HeaderSecundario"><Data ss:Type="String">Ambiente</Data></Cell>
    <Cell ss:StyleID="HeaderSecundario"><Data ss:Type="String">Categoria</Data></Cell>
    <Cell ss:StyleID="HeaderSecundario"><Data ss:Type="String">Área Piso (m²)</Data></Cell>
    <Cell ss:StyleID="HeaderSecundario"><Data ss:Type="String">Perímetro (m)</Data></Cell>
    <Cell ss:StyleID="HeaderSecundario"><Data ss:Type="String">Pé-Direito (m)</Data></Cell>
    <Cell ss:StyleID="HeaderSecundario"><Data ss:Type="String">Paredes Líq. (m²)</Data></Cell>
    <Cell ss:StyleID="HeaderSecundario"><Data ss:Type="String">Portas (un)</Data></Cell>
    <Cell ss:StyleID="HeaderSecundario"><Data ss:Type="String">Janelas (un)</Data></Cell>
    <Cell ss:StyleID="HeaderSecundario"><Data ss:Type="String">Custo Direto (R$)</Data></Cell>
    <Cell ss:StyleID="HeaderSecundario"><Data ss:Type="String">Preço Final (R$)</Data></Cell>
   </Row>

   <!-- Linhas de Dados -->
   ${ambientes
     .map(
       (amb, index) => `
   <Row>
    <Cell ss:StyleID="CelulaCentro"><Data ss:Type="String">${(index + 1).toString().padStart(2, '0')}</Data></Cell>
    <Cell ss:StyleID="CelulaTexto"><Data ss:Type="String">${ExcelCaixaGenerator.escapeXml(amb.nome)}</Data></Cell>
    <Cell ss:StyleID="CelulaCentro"><Data ss:Type="String">${ExcelCaixaGenerator.escapeXml(amb.categoria)}</Data></Cell>
    <Cell ss:StyleID="CelulaNumero"><Data ss:Type="Number">${amb.areaPisoM2}</Data></Cell>
    <Cell ss:StyleID="CelulaNumero"><Data ss:Type="Number">${amb.perimetroM}</Data></Cell>
    <Cell ss:StyleID="CelulaNumero"><Data ss:Type="Number">${amb.peDireitoM}</Data></Cell>
    <Cell ss:StyleID="CelulaNumero"><Data ss:Type="Number">${amb.areaParedesLiquidaM2}</Data></Cell>
    <Cell ss:StyleID="CelulaCentro"><Data ss:Type="Number">${amb.vaos.portasQuantidade}</Data></Cell>
    <Cell ss:StyleID="CelulaCentro"><Data ss:Type="Number">${amb.vaos.janelasQuantidade}</Data></Cell>
    <Cell ss:StyleID="CelulaMoeda"><Data ss:Type="Number">${amb.subtotalCustoDireto}</Data></Cell>
    <Cell ss:StyleID="CelulaMoeda"><Data ss:Type="Number">${amb.subtotalComBdi}</Data></Cell>
   </Row>`
     )
     .join('')}

   <!-- Linha de Totais -->
   <Row ss:Height="22">
    <Cell ss:MergeAcross="2" ss:StyleID="LinhaTotalTexto"><Data ss:Type="String">TOTAIS CONSOLIDADOS</Data></Cell>
    <Cell ss:StyleID="LinhaTotal"><Data ss:Type="Number">${resumoFinanceiro.areaTotalConstruidaM2}</Data></Cell>
    <Cell ss:StyleID="LinhaTotal"><Data ss:Type="String">-</Data></Cell>
    <Cell ss:StyleID="LinhaTotal"><Data ss:Type="String">-</Data></Cell>
    <Cell ss:StyleID="LinhaTotal"><Data ss:Type="String">-</Data></Cell>
    <Cell ss:StyleID="LinhaTotal"><Data ss:Type="String">-</Data></Cell>
    <Cell ss:StyleID="LinhaTotal"><Data ss:Type="String">-</Data></Cell>
    <Cell ss:StyleID="LinhaTotal"><Data ss:Type="Number">${resumoFinanceiro.custoDiretoTotal}</Data></Cell>
    <Cell ss:StyleID="LinhaTotal"><Data ss:Type="Number">${resumoFinanceiro.precoFinalVenda}</Data></Cell>
   </Row>
  </Table>
 </Worksheet>

 <!-- ================= ABA 2: PLANILHA ORÇAMENTÁRIA SINAPI ================= -->
 <Worksheet ss:Name="Planilha Orçamentária CAIXA">
  <Table ss:DefaultRowHeight="20">
   <Column ss:Width="50"/>
   <Column ss:Width="80"/>
   <Column ss:Width="300"/>
   <Column ss:Width="50"/>
   <Column ss:Width="70"/>
   <Column ss:Width="90"/>
   <Column ss:Width="90"/>
   <Column ss:Width="100"/>
   <Column ss:Width="100"/>
   <Column ss:Width="90"/>
   <Column ss:Width="110"/>

   <!-- Cabeçalho Institucional -->
   <Row ss:Height="26">
    <Cell ss:MergeAcross="10" ss:StyleID="HeaderPrincipal">
     <Data ss:Type="String">ORÇAMENTO DISCRIMINADO DE SERVIÇOS (TABELA SINAPI / CEF)</Data>
    </Cell>
   </Row>
   <Row>
    <Cell ss:MergeAcross="1" ss:StyleID="CelulaTexto"><Data ss:Type="String">Projeto:</Data></Cell>
    <Cell ss:MergeAcross="4" ss:StyleID="CelulaTexto"><Data ss:Type="String">${ExcelCaixaGenerator.escapeXml(projeto.tituloProjeto)}</Data></Cell>
    <Cell ss:MergeAcross="1" ss:StyleID="CelulaTexto"><Data ss:Type="String">Taxa BDI Aplicada:</Data></Cell>
    <Cell ss:MergeAcross="2" ss:StyleID="CelulaNumero"><Data ss:Type="Number">${resumoFinanceiro.taxaBdiEfetivaPercentual}</Data></Cell>
   </Row>
   <Row>
    <Cell ss:MergeAcross="1" ss:StyleID="CelulaTexto"><Data ss:Type="String">Área Construída:</Data></Cell>
    <Cell ss:MergeAcross="4" ss:StyleID="CelulaTexto"><Data ss:Type="String">${resumoFinanceiro.areaTotalConstruidaM2} m²</Data></Cell>
    <Cell ss:MergeAcross="1" ss:StyleID="CelulaTexto"><Data ss:Type="String">Padrão de Acabamento:</Data></Cell>
    <Cell ss:MergeAcross="2" ss:StyleID="CelulaTexto"><Data ss:Type="String">${ExcelCaixaGenerator.escapeXml(configuracao.padraoAcabamento)}</Data></Cell>
   </Row>

   <!-- Cabeçalho das Colunas Técnicas -->
   <Row ss:Height="24">
    <Cell ss:StyleID="HeaderSecundario"><Data ss:Type="String">Item</Data></Cell>
    <Cell ss:StyleID="HeaderSecundario"><Data ss:Type="String">Código</Data></Cell>
    <Cell ss:StyleID="HeaderSecundario"><Data ss:Type="String">Descrição do Serviço</Data></Cell>
    <Cell ss:StyleID="HeaderSecundario"><Data ss:Type="String">Unid.</Data></Cell>
    <Cell ss:StyleID="HeaderSecundario"><Data ss:Type="String">Qtd.</Data></Cell>
    <Cell ss:StyleID="HeaderSecundario"><Data ss:Type="String">Unit. Mat. (R$)</Data></Cell>
    <Cell ss:StyleID="HeaderSecundario"><Data ss:Type="String">Unit. M.O. (R$)</Data></Cell>
    <Cell ss:StyleID="HeaderSecundario"><Data ss:Type="String">Preço Unit. (R$)</Data></Cell>
    <Cell ss:StyleID="HeaderSecundario"><Data ss:Type="String">Total Sem BDI (R$)</Data></Cell>
    <Cell ss:StyleID="HeaderSecundario"><Data ss:Type="String">BDI Rateado (R$)</Data></Cell>
    <Cell ss:StyleID="HeaderSecundario"><Data ss:Type="String">Total Com BDI (R$)</Data></Cell>
   </Row>

   <!-- Linhas de Itens por Ambiente -->
   ${this.gerarLinhasItensSinapi(ambientes)}

   <!-- Linha de Resumo Financeiro Final -->
   <Row ss:Height="24">
    <Cell ss:MergeAcross="7" ss:StyleID="LinhaTotalTexto"><Data ss:Type="String">CUSTO DIRETO TOTAL (MATERIAL + MÃO DE OBRA)</Data></Cell>
    <Cell ss:StyleID="LinhaTotal"><Data ss:Type="Number">${resumoFinanceiro.custoDiretoTotal}</Data></Cell>
    <Cell ss:StyleID="LinhaTotal"><Data ss:Type="Number">${resumoFinanceiro.valorTotalBdi}</Data></Cell>
    <Cell ss:StyleID="LinhaTotal"><Data ss:Type="Number">${resumoFinanceiro.precoFinalVenda}</Data></Cell>
   </Row>
  </Table>
 </Worksheet>
</Workbook>`;
  }

  private static gerarLinhasItensSinapi(ambientes: ProjetoOrcamentoBrasil['ambientes']): string {
    let linhas = '';
    let itemContadorGeral = 1;

    for (let i = 0; i < ambientes.length; i++) {
      const amb = ambientes[i];
      // Linha separadora do ambiente
      linhas += `
   <Row ss:Height="22">
    <Cell ss:MergeAcross="10" ss:StyleID="HeaderSecundario">
     <Data ss:Type="String">${(i + 1).toString().padStart(2, '0')}. AMBIENTE: ${ExcelCaixaGenerator.escapeXml(amb.nome.toUpperCase())} (${amb.areaPisoM2} m²)</Data>
    </Cell>
   </Row>`;

      for (let j = 0; j < amb.composicoes.length; j++) {
        const comp = amb.composicoes[j];
        const itemNumero = `${i + 1}.${j + 1}`;

        linhas += `
   <Row>
    <Cell ss:StyleID="CelulaCentro"><Data ss:Type="String">${itemNumero}</Data></Cell>
    <Cell ss:StyleID="CelulaCentro"><Data ss:Type="String">${ExcelCaixaGenerator.escapeXml(comp.codigoSinapi)}</Data></Cell>
    <Cell ss:StyleID="CelulaTexto"><Data ss:Type="String">${ExcelCaixaGenerator.escapeXml(comp.descricao)}</Data></Cell>
    <Cell ss:StyleID="CelulaCentro"><Data ss:Type="String">${ExcelCaixaGenerator.escapeXml(comp.unidade)}</Data></Cell>
    <Cell ss:StyleID="CelulaNumero"><Data ss:Type="Number">${comp.quantidade}</Data></Cell>
    <Cell ss:StyleID="CelulaMoeda"><Data ss:Type="Number">${comp.custoUnitarioMaterial}</Data></Cell>
    <Cell ss:StyleID="CelulaMoeda"><Data ss:Type="Number">${comp.custoUnitarioMaoDeObra}</Data></Cell>
    <Cell ss:StyleID="CelulaMoeda"><Data ss:Type="Number">${comp.custoUnitarioDireto}</Data></Cell>
    <Cell ss:StyleID="CelulaMoeda"><Data ss:Type="Number">${comp.subtotalSemBdi}</Data></Cell>
    <Cell ss:StyleID="CelulaMoeda"><Data ss:Type="Number">${comp.valorBdiItem}</Data></Cell>
    <Cell ss:StyleID="CelulaMoeda"><Data ss:Type="Number">${comp.precoTotalComBdi}</Data></Cell>
   </Row>`;
        itemContadorGeral++;
      }
    }

    return linhas;
  }
}
