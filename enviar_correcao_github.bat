@echo off
setlocal enabledelayedexpansion
title AFM MANAGER — ENVIAR CORRECAO PARA O GITHUB & VERCEL
color 0A

echo ======================================================================
echo   AQUINO FUTEBOL MANAGER — ENVIAR CORRECAO DEPLOY VERCEL
echo ======================================================================
echo.

where git >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERRO] Git nao encontrado no PATH do sistema.
    pause
    exit /b 1
)

echo [1/4] Adicionando alteracoes pendentes...
git add .

echo [2/4] Criando commit das correcoes (se houver alteracoes)...
git commit -m "fix: resolve ReferenceError esc is not defined e corrige icones PWA" >nul 2>nul

echo.
echo [3/4] Sincronizando com o commit de merge do GitHub (git pull --rebase origin main)...
git pull --rebase origin main

echo.
echo [4/4] Enviando tudo para o GitHub (git push origin main)...
git push origin main

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [Tentativa 2] Tentando sincronizar com merge padrao...
    git pull origin main --no-edit
    git push origin main
)

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ======================================================================
    echo   SUCESSO TOTAL! ATUALIZACOES ENVIADAS COM EXITO PARA O GITHUB!
    echo   A Vercel ja iniciou o novo deploy automatico.
    echo   Em menos de 1 minuto acesse o site e pressione Ctrl + F5!
    echo ======================================================================
) else (
    echo.
    echo [ERRO] O push falhou. Veja a mensagem de erro acima.
)

echo.
pause
