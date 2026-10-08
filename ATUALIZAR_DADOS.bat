@echo off
chcp 65001 >nul
cd /d "%~dp0"
title Aquino Futebol Manager - Atualizador de dados
echo =====================================================
echo   AQUINO FUTEBOL MANAGER - ATUALIZAR ELENCOS/RATINGS
echo =====================================================
echo.
echo Vai baixar bases publicas de jogadores. Pode usar dezenas de MB.
echo O save da carreira NAO sera apagado.
echo.
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0tools\update-data.ps1"
if errorlevel 1 (
  echo.
  echo ERRO: a atualizacao falhou. O banco anterior foi mantido se existia.
  echo Veja data_cache\update.log.
  pause
  exit /b 1
)
echo.
echo Atualizacao concluida. Agora execute JOGAR.bat.
pause
