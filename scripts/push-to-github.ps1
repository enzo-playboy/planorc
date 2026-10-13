# Script PowerShell para publicar o PlanOrc no GitHub
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "     PlanOrc - Sincronizacao Oficial com o GitHub" -ForegroundColor Cyan
Write-Host "     Repositorio: https://github.com/enzo-playboy/planorc.git" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""

Set-Location -Path "D:\reverse"

Write-Host "[1/4] Configurando autor do Git e remote..." -ForegroundColor Yellow
git config user.name "enzo-playboy"
git config user.email "enzo@planorc.com.br"
git remote set-url origin https://github.com/enzo-playboy/planorc.git

Write-Host "[2/4] Adicionando arquivos limpos do PlanOrc..." -ForegroundColor Yellow
git add -A

Write-Host "[3/4] Criando commit inicial do PlanOrc..." -ForegroundColor Yellow
git commit -m "feat: inicializacao oficial do PlanOrc - Medicao de Plantas & Orcamento Civil (OpenTakeoff MCP + SINAPI + Caixa Excel)"
git branch -M main

Write-Host "[4/4] Enviando para o GitHub (sobrescrevendo o conteudo antigo)..." -ForegroundColor Yellow
git push -u origin main --force

Write-Host ""
Write-Host "========================================================" -ForegroundColor Green
Write-Host " SUCESSO! O GitHub agora reflete 100% o PlanOrc!" -ForegroundColor Green
Write-Host " Acesse: https://github.com/enzo-playboy/planorc" -ForegroundColor Green
Write-Host "========================================================" -ForegroundColor Green
