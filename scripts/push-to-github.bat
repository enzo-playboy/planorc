@echo off
chcp 65001 >nul
echo ========================================================
echo      PlanOrc - Sincronização Oficial com o GitHub
echo      Repositório: https://github.com/enzo-playboy/planorc.git
echo ========================================================
echo.

cd /d "D:\reverse"

echo [1/5] Executando bateria de testes pesados (Heavy Stress Tests)...
node scripts/heavy-stress-test.mjs
if %errorlevel% neq 0 (
    echo.
    echo ERRO CRITICO: Os testes pesados falharam! O envio para o GitHub foi cancelado.
    pause
    exit /b %errorlevel%
)
echo.
echo TESTES APROVADOS COM SUCESSO!
echo.

echo [2/5] Configurando autor do Git e remote...
git config user.name "enzo-playboy"
git config user.email "enzo@planorc.com.br"
git remote set-url origin https://github.com/enzo-playboy/planorc.git

echo.
echo [3/5] Adicionando todos os arquivos limpos do PlanOrc...
git add -A

echo.
echo [4/5] Criando o commit do PlanOrc...
git commit -m "feat(tests): suite de testes pesados (Shoelace, BDI TCU, SINAPI, Caixa Excel & 1k comodos)"

git branch -M main

echo.
echo [5/5] Enviando para o GitHub (sobrescrevendo com o PlanOrc)...
git push -u origin main --force

echo.
echo ========================================================
echo ✅ CONCLUÍDO! O GitHub agora reflete 100%% o PlanOrc!
echo Acesse para conferir: https://github.com/enzo-playboy/planorc
echo ========================================================
pause
