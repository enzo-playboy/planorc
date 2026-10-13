@echo off
chcp 65001 >nul
echo ========================================================
echo      PlanOrc - Sincronização Oficial com o GitHub
echo      Repositório: https://github.com/enzo-playboy/planorc.git
echo ========================================================
echo.

cd /d "D:\reverse"

echo [1/4] Configurando autor do Git e remote...
git config user.name "enzo-playboy"
git config user.email "enzo@planorc.com.br"
git remote set-url origin https://github.com/enzo-playboy/planorc.git

echo.
echo [2/4] Adicionando todos os arquivos limpos do PlanOrc...
git add -A

echo.
echo [3/4] Criando o commit inicial oficial do PlanOrc...
git commit -m "feat: inicializacao oficial do PlanOrc - Medicao de Plantas & Orcamento Civil (OpenTakeoff MCP + SINAPI + Caixa Excel)"

git branch -M main

echo.
echo [4/4] Enviando para o GitHub (sobrescrevendo com o PlanOrc)...
git push -u origin main --force

echo.
echo ========================================================
echo ✅ CONCLUÍDO! O GitHub agora reflete 100%% o PlanOrc!
echo Acesse para conferir: https://github.com/enzo-playboy/planorc
echo ========================================================
pause
