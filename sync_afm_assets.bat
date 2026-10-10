@echo off
setlocal
chcp 65001 > nul
cd /d "%~dp0"
title AFM MANAGER 2027 - Verificar assets locais
echo ======================================================================
echo VERIFICACAO LOCAL DE ESCUDOS E FOTOS
echo Os baixadores antigos foram removidos porque misturavam imagens.
echo ======================================================================
where node >nul 2>nul || (echo ERRO: Node.js nao encontrado no PATH.& pause & exit /b 1)
if not exist "%~dp0scan_missing_assets.js" (echo ERRO: scan_missing_assets.js nao foi encontrado.& pause & exit /b 1)
node "%~dp0scan_missing_assets.js"
if errorlevel 1 (echo A verificacao encontrou erro; veja o relatorio acima.& pause & exit /b 1)
pause
