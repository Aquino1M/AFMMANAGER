@echo off
setlocal enabledelayedexpansion
title AFM MANAGER — ENVIAR CORRECAO PARA O GITHUB & VERCEL
color 0A

echo ======================================================================
echo   AQUINO FUTEBOL MANAGER — ENVIAR CORRECAO DEPLOY VERCEL
echo   Correcao: "ReferenceError: esc is not defined" e Icones PWA
echo ======================================================================
echo.

where git >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERRO] Git nao encontrado no PATH do sistema.
    pause
    exit /b 1
)

echo [1/3] Adicionando alteracoes corrigidas...
git add .

echo [2/3] Criando commit da correcao...
git commit -m "fix: resolve ReferenceError esc is not defined e corrige icones PWA"

echo.
echo [3/3] Enviando para o GitHub (git push origin main)...
git push origin main

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [AVISO] Ocorreu uma falha no git push.
    echo Se o repositorio remoto tiver commits novos, tente rodar:
    echo git pull --rebase origin main
    echo e depois rode este arquivo novamente.
) else (
    echo.
    echo ======================================================================
    echo   SUCESSO! COMMIT ENVIADO PARA O GITHUB!
    echo   A Vercel ja iniciou o novo deploy automatico.
    echo   Em menos de 1 minuto o site estara no ar sem a tela azul!
    echo ======================================================================
)

echo.
pause
