# Script PowerShell para publicar o PlanOrc no GitHub
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "     PlanOrc - Sincronizacao Oficial com o GitHub" -ForegroundColor Cyan
Write-Host "     Repositorio: https://github.com/enzo-playboy/planorc.git" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""

Set-Location -Path "D:\reverse"

Write-Host "[1/5] Executando bateria de testes pesados (Heavy Stress Tests)..." -ForegroundColor Yellow
node scripts/heavy-stress-test.mjs
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERRO CRITICO: Os testes pesados falharam! Envio para o GitHub abortado." -ForegroundColor Red
    exit 1
}
Write-Host "TESTES APROVADOS COM SUCESSO!" -ForegroundColor Green
Write-Host ""

Write-Host "[2/5] Configurando autor do Git e remote..." -ForegroundColor Yellow
git config user.name "enzo-playboy"
git config user.email "enzo@planorc.com.br"
git remote set-url origin https://github.com/enzo-playboy/planorc.git

Write-Host "[3/5] Adicionando arquivos limpos do PlanOrc..." -ForegroundColor Yellow
git add -A

Write-Host "[4/5] Criando commit do PlanOrc..." -ForegroundColor Yellow
git commit -m "feat(tests): suite de testes pesados (Shoelace, BDI TCU, SINAPI, Caixa Excel & 1k comodos)"
git branch -M main

Write-Host "[5/5] Enviando para o GitHub (sobrescrevendo o conteudo antigo)..." -ForegroundColor Yellow
git push -u origin main --force

Write-Host ""
Write-Host "========================================================" -ForegroundColor Green
Write-Host " SUCESSO! O GitHub agora reflete 100% o PlanOrc!" -ForegroundColor Green
Write-Host " Acesse: https://github.com/enzo-playboy/planorc" -ForegroundColor Green
Write-Host "========================================================" -ForegroundColor Green
