@echo off
setlocal enabledelayedexpansion
chcp 65001 >nul 2>&1
cd /d "%~dp0"
title AFM Manager - Instalar Extensoes Recomendadas

echo ====================================================================
echo        INSTALADOR DE EXTENSOES RECOMENDADAS - AFM MANAGER 2027
echo ====================================================================
echo.

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0instalar_extensoes.ps1"

echo.
echo Pressione qualquer tecla para fechar esta janela...
pause >nul
