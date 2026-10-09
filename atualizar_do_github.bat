@echo off
setlocal enabledelayedexpansion
title AFM MANAGER — ATUALIZAR DO GITHUB
color 0B

echo ======================================================================
echo   AQUINO FUTEBOL MANAGER — ATUALIZAR REPOSITORIO DO GITHUB
echo   Repositorio: origin/main (Aquino1M/AFMMANAGER)
echo ======================================================================
echo.

where git >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERRO] O comando 'git' nao foi encontrado no PATH do sistema.
    echo Certifique-se de que o Git para Windows esta instalado.
    pause
    exit /b 1
)

echo Escolha como deseja atualizar:
echo.
echo  [1] ATUALIZAR PRESERVANDO ALTERACOES LOCAIS (Recomendado)
echo      (Salva arquivos modificados, puxa a versao do GitHub e reaplica)
echo.
echo  [2] COMMITAR TUDO E ATUALIZAR (Git Add + Commit + Pull)
echo.
echo  [3] FORCAR ATUALIZACAO DO GITHUB (Descarta alteracoes locais nao salvas)
echo.
echo  [4] APENAS VER O STATUS ATUAL (git status)
echo.

set /p OPCAO="Digite a opcao desejada [1, 2, 3 ou 4]: "

if "%OPCAO%"=="1" goto OP_STASH_PULL
if "%OPCAO%"=="2" goto OP_COMMIT_PULL
if "%OPCAO%"=="3" goto OP_HARD_RESET
if "%OPCAO%"=="4" goto OP_STATUS

echo Opcao invalida. Saindo...
pause
exit /b 0

:OP_STASH_PULL
echo.
echo [1/3] Guardando alteracoes locais temporariamente (git stash)...
git stash
echo.
echo [2/3] Baixando novidades do GitHub (git pull origin main)...
git pull origin main
echo.
echo [3/3] Restaurando suas alteracoes locais (git stash pop)...
git stash pop
goto FIM

:OP_COMMIT_PULL
echo.
echo [1/3] Adicionando alteracoes locais ao stage...
git add .
set /p MSG_COMMIT="Digite a mensagem de commit (ou aperte ENTER para 'Atualizacao local'): "
if "!MSG_COMMIT!"=="" set MSG_COMMIT=Atualizacao local
git commit -m "!MSG_COMMIT!"
echo.
echo [2/3] Puxando novidades do GitHub (git pull origin main)...
git pull origin main
goto FIM

:OP_HARD_RESET
echo.
echo [ATENCAO] Esta opcao ira DESCARTAR alteracoes locais nao salvas no GitHub!
set /p CONFIRMA="Tem certeza? Digite 'S' para confirmar: "
if /I NOT "%CONFIRMA%"=="S" (
    echo Operacao cancelada pelo usuario.
    pause
    exit /b 0
)
echo.
echo Baixando dados remotos do GitHub...
git fetch origin main
echo Resetando para origin/main...
git reset --hard origin/main
goto FIM

:OP_STATUS
echo.
git status
goto FIM

:FIM
echo.
echo ======================================================================
echo   PROCESSO CONCLUIDO!
echo ======================================================================
pause
