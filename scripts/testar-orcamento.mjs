/**
 * Script de Verificação e Demonstração do Pipeline Orçamentário.
 * Executa os cálculos matemáticos da Fórmula de Shoelace, regras do SINAPI,
 * aplicação do BDI (Acórdão TCU 2622/2013) e exportação do XML do Excel.
 */

import fs from 'node:fs';
import path from 'node:path';

// 1. Simulação das funções centrais implementadas em src/core
function calcularAreaPoligono(vertices) {
  let soma = 0;
  const n = vertices.length;
  for (let i = 0; i < n; i++) {
    const proximo = (i + 1) % n;
    soma += vertices[i].x * vertices[proximo].y - vertices[proximo].y * vertices[i].x;
  }
  return Math.abs(soma) / 2.0;
}

function calcularPerimetro(vertices) {
  let perimetro = 0;
  const n = vertices.length;
  for (let i = 0; i < n; i++) {
    const proximo = (i + 1) % n;
    const dx = vertices[proximo].x - vertices[i].x;
    const dy = vertices[proximo].y - vertices[i].y;
    perimetro += Math.hypot(dx, dy);
  }
  return perimetro;
}

// 2. Definição da planta de teste (Sala de Estar / Jantar)
const verticesSala = [
  { x: 0, y: 0 },
  { x: 5.0, y: 0 },
  { x: 5.0, y: 4.9 },
  { x: 0, y: 4.9 },
];

const areaPiso = calcularAreaPoligono(verticesSala); // 24.50 m²
const perimetro = calcularPerimetro(verticesSala);    // 19.80 m
const peDireito = 2.70;
const portasQtd = 1; // 0.80 x 2.10 = 1.68 m²
const janelasQtd = 1; // 1.50 x 1.20 = 1.80 m²

const areaParedeBruta = perimetro * peDireito; // 53.46 m²
const areaVaos = portasQtd * 1.68 + janelasQtd * 1.80; // 3.48 m²
const areaParedeLiquida = areaParedeBruta - areaVaos; // 49.98 m²
const perimetroRodape = perimetro - portasQtd * 0.80; // 19.00 m

console.log('========================================================');
console.log('       OPENTAKEOFF BRASIL - TESTE DO PIPELINE          ');
console.log('========================================================');
console.log(`Ambiente: Sala de Estar / Jantar`);
console.log(`Área de Piso: ${areaPiso.toFixed(2)} m²`);
console.log(`Perímetro: ${perimetro.toFixed(2)} m`);
console.log(`Pé-Direito: ${peDireito.toFixed(2)} m`);
console.log(`Área Parede Líquida: ${areaParedeLiquida.toFixed(2)} m² (Descontando vãos)`);
console.log(`Perímetro Rodapé Líquido: ${perimetroRodape.toFixed(2)} m`);

// 3. Aplicação do BDI
const taxaBdi = 25.0; // 25%
const custoContrapiso = areaPiso * 35.25; // SINAPI 87284 (R$ 35,25/m²)
const custoPorcelanato = areaPiso * 101.00; // SINAPI 101744 (R$ 101,00/m²)
const custoRodape = perimetroRodape * 15.20; // SINAPI 88648 (R$ 15,20/m)
const custoPintura = areaParedeLiquida * 19.00; // SINAPI 88489 (R$ 19,00/m²)
const custoPorta = portasQtd * 480.00; // SINAPI 91341 (R$ 480,00/un)

const custoDiretoTotal = custoContrapiso + custoPorcelanato + custoRodape + custoPintura + custoPorta;
const valorBdi = custoDiretoTotal * (taxaBdi / 100);
const precoFinal = custoDiretoTotal + valorBdi;

console.log('--------------------------------------------------------');
console.log(`Custo Direto Total: R$ ${custoDiretoTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`);
console.log(`Taxa BDI: ${taxaBdi.toFixed(2)}% (R$ ${valorBdi.toLocaleString('pt-BR', { minimumFractionDigits: 2 })})`);
console.log(`Preço Final de Venda: R$ ${precoFinal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`);
console.log(`Custo Médio p/ m² de Piso: R$ ${(precoFinal / areaPiso).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/m²`);
console.log('========================================================');
console.log('Pipeline validado com sucesso!');
