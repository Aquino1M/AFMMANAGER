@echo off
chcp 65001 > nul
title AFM MANAGER 2027 — SINCRONIZADOR & ORGANIZADOR DE ASSETS
color 0B

cls
echo ==============================================================================
echo       AFM MANAGER 2027 — SINCRONIZADOR E ORGANIZADOR DE ASSETS OFICIAIS
echo ==============================================================================
echo.

:: 1. VERIFICA SE O NODE.JS ESTÁ INSTALADO
echo [1/3] Verificando ambiente Node.js...
node -v > nul 2>&1
if %errorlevel% neq 0 (
    color 0C
    echo [ERRO CRITICO] Node.js nao foi encontrado no sistema!
    echo Por favor, instale o Node.js atraves do site oficial: https://nodejs.org
    echo Apos a instalacao, reinicie este script.
    echo.
    pause
    exit /b 1
)
for /f "tokens=*" %%v in ('node -v') do set NODE_VER=%%v
echo       Node.js detectado com sucesso: %NODE_VER%
echo.

:: 2. CRIA TODA A ESTRUTURA FISICA DE PASTAS
echo [2/3] Criando e validando estrutura de pastas fisica...
if not exist "img\badges\bra_a" mkdir "img\badges\bra_a"
if not exist "img\badges\bra_b" mkdir "img\badges\bra_b"
if not exist "img\badges\bra_c" mkdir "img\badges\bra_c"
if not exist "img\badges\bra_d" mkdir "img\badges\bra_d"
if not exist "img\badges\bra_estaduais" mkdir "img\badges\bra_estaduais"
if not exist "img\badges\arg_1" mkdir "img\badges\arg_1"
if not exist "img\badges\europe" mkdir "img\badges\europe"
if not exist "img\badges\asia" mkdir "img\badges\asia"
if not exist "img\players" mkdir "img\players"
echo       Estrutura de diretorios OK.
echo.

:: 3. EXECUTA O SCANNER DE ASSETS
echo [3/3] Escaneando integridade de escudos e fotos...
node scan_missing_assets.js

:MENU
echo ==============================================================================
echo                            MENU DE OPERACOES
echo ==============================================================================
echo  [1] Baixar escudos faltantes via FootyLogos (Serie A e B)
echo  [2] Baixar escudos de todas as divisoes e ligas mundiais (FootyLogos Full)
echo  [3] Baixar fotos de jogadores do Transfermarkt
echo  [4] Corrigir e organizar arquivos no destino correto
echo  [5] Sair
echo ==============================================================================
set /p OPCAO="Escolha uma opcao [1-5]: "

if "%OPCAO%"=="1" goto OP_SERIE_AB
if "%OPCAO%"=="2" goto OP_FULL_LEAGUES
if "%OPCAO%"=="3" goto OP_PHOTOS
if "%OPCAO%"=="4" goto OP_ORGANIZE
if "%OPCAO%"=="5" goto OP_SAIR

echo Opcao invalida. Tente novamente.
echo.
goto MENU

:OP_SERIE_AB
echo.
echo ==============================================================================
echo BAIXANDO ESCUDOS DA SERIE A E SERIE B (FOOTYLOGOS)...
echo ==============================================================================
node download_footylogos.js --league=bra_a
node download_footylogos.js --league=bra_b
echo.
echo Concluido!
pause
cls
goto MENU

:OP_FULL_LEAGUES
echo.
echo ==============================================================================
echo BAIXANDO ESCUDOS DE TODAS AS LIGAS (FOOTYLOGOS FULL)...
echo ==============================================================================
node download_footylogos.js --all
echo.
echo Concluido!
pause
cls
goto MENU

:OP_PHOTOS
echo.
echo ==============================================================================
echo BAIXANDO FOTOS DO TRANSFERMARKT...
echo ==============================================================================
if exist "fetch_transfermarkt_photos.js" (
    node fetch_transfermarkt_photos.js
) else (
    echo Script fetch_transfermarkt_photos.js nao localizado.
)
echo.
pause
cls
goto MENU

:OP_ORGANIZE
echo.
echo ==============================================================================
echo ORGANIZANDO E CORRIGINDO ARQUIVOS...
echo ==============================================================================
if exist "organize_and_split.js" (
    node organize_and_split.js
) else (
    echo Script organize_and_split.js nao localizado.
)
echo.
pause
cls
goto MENU

:OP_SAIR
echo.
echo Obrigado por utilizar o AFM Manager 2027! Bom jogo!
exit /b 0
