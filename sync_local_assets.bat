@echo off
chcp 65001 > nul
title AFM MANAGER 2027 — SINCRONIZADOR 100%% OFFLINE-FIRST
color 0A

cls
echo ==============================================================================
echo       AFM MANAGER 2027 — AUTOMAÇÃO DE ASSETS FÍSICOS LOCAIS (OFFLINE-FIRST)
echo ==============================================================================
echo.

:: 1. VERIFICA SE O NODE.JS ESTÁ INSTALADO
echo [1/3] Verificando ambiente Node.js...
node -v > nul 2>&1
if %errorlevel% neq 0 (
    color 0C
    echo [ERRO CRITICO] Node.js nao foi detectado no sistema!
    echo Por favor, instale o Node.js atraves do site oficial: https://nodejs.org
    echo Apos a instalacao, execute este script novamente.
    echo.
    pause
    exit /b 1
)
for /f "tokens=*" %%v in ('node -v') do set NODE_VER=%%v
echo       Node.js ativo: %NODE_VER%
echo.

:: 2. CRIA A ESTRUTURA FÍSICA COMPLETA DE DIRETÓRIOS
echo [2/3] Criando a arvore de pastas local fisica (img/ e data/)...
if not exist "img\badges\bra_a" mkdir "img\badges\bra_a"
if not exist "img\badges\bra_b" mkdir "img\badges\bra_b"
if not exist "img\badges\bra_c" mkdir "img\badges\bra_c"
if not exist "img\badges\bra_d" mkdir "img\badges\bra_d"
if not exist "img\badges\bra_estaduais" mkdir "img\badges\bra_estaduais"
if not exist "img\badges\arg_1" mkdir "img\badges\arg_1"
if not exist "img\badges\europe" mkdir "img\badges\europe"
if not exist "img\badges\asia" mkdir "img\badges\asia"
if not exist "img\competitions" mkdir "img\competitions"
if not exist "img\players\bra_a\corinthians" mkdir "img\players\bra_a\corinthians"
if not exist "img\players\bra_a\flamengo" mkdir "img\players\bra_a\flamengo"
if not exist "img\players\bra_a\palmeiras" mkdir "img\players\bra_a\palmeiras"
if not exist "img\players\bra_a\sao_paulo" mkdir "img\players\bra_a\sao_paulo"
if not exist "img\players\bra_a\vasco" mkdir "img\players\bra_a\vasco"
if not exist "img\players\bra_b\sport" mkdir "img\players\bra_b\sport"
if not exist "img\players\bra_b\america_mg" mkdir "img\players\bra_b\america_mg"
if not exist "img\players\bra_b\vila_nova" mkdir "img\players\bra_b\vila_nova"
if not exist "img\players\bra_b\ceara" mkdir "img\players\bra_b\ceara"
if not exist "img\players\bra_b\goias" mkdir "img\players\bra_b\goias"
if not exist "data\badges" mkdir "data\badges"
if not exist "js\core" mkdir "js\core"
echo       Estrutura de diretorios validada.
echo.

:: 3. SCANNER DE INTEGRIDADE LOCAL
echo [3/3] Escaneando arquivos ausentes no disco local...
node scan_missing_assets.js

:MENU
echo ==============================================================================
echo                            OPCOES DE SINCRONIZACAO
echo ==============================================================================
echo  [1] Executar Download Completo e Gerar Mapeamentos Offline (Recomendado)
echo  [2] Baixar apenas escudos via FootyLogos (Serie A e B)
echo  [3] Baixar todos os escudos mundiais (FootyLogos Full)
echo  [4] Baixar fotos de jogadores do elenco atual
echo  [5] Sair
echo ==============================================================================
set /p OPCAO="Escolha uma opcao [1-5]: "

if "%OPCAO%"=="1" goto OP_FULL_LOCAL
if "%OPCAO%"=="2" goto OP_BADGES_AB
if "%OPCAO%"=="3" goto OP_BADGES_ALL
if "%OPCAO%"=="4" goto OP_PLAYERS
if "%OPCAO%"=="5" goto OP_SAIR

echo Opcao invalida. Tente novamente.
echo.
goto MENU

:OP_FULL_LOCAL
echo.
echo ==============================================================================
echo BAIXANDO ASSETS OFICIAIS E GERANDO ARQUIVOS LOCAIS...
echo ==============================================================================
node download_and_organize_local.js
echo.
echo Concluido com sucesso! Todos os assets estao salvos no disco local.
pause
cls
goto MENU

:OP_BADGES_AB
echo.
echo ==============================================================================
echo BAIXANDO ESCUDOS DA SERIE A E B (FOOTYLOGOS)...
echo ==============================================================================
node download_footylogos.js --league=bra_a
node download_footylogos.js --league=bra_b
echo.
echo Concluido!
pause
cls
goto MENU

:OP_BADGES_ALL
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

:OP_PLAYERS
echo.
echo ==============================================================================
echo BAIXANDO FOTOS DO TRANSFERMARKT...
echo ==============================================================================
if exist "fetch_transfermarkt_photos.js" (
    node fetch_transfermarkt_photos.js
) else (
    node download_and_organize_local.js
)
echo.
pause
cls
goto MENU

:OP_SAIR
echo.
echo O AFM Manager esta 100%% configurado para rodar offline. Bom jogo!
exit /b 0
