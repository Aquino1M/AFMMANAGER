@echo off
setlocal
chcp 65001 >nul
cd /d "%~dp0"
title Aquino Futebol Manager - Atualizador de dados
echo =====================================================
echo   AQUINO FUTEBOL MANAGER - ATUALIZAR ELENCOS/RATINGS
echo =====================================================
echo.
echo Vai baixar bases publicas de jogadores. Pode usar dezenas de MB.
echo O save da carreira nao sera alterado. O banco anterior sera copiado antes da troca.
echo.
if not exist "%~dp0tools\update-data.ps1" (
  echo ERRO: tools\update-data.ps1 nao foi encontrado.
  pause
  exit /b 1
)
if not exist "%~dp0data_cache" mkdir "%~dp0data_cache"
if exist "%~dp0data\players_live.js" (
  for /f %%I in ('powershell -NoProfile -Command "Get-Date -Format yyyyMMdd-HHmmss"') do set "STAMP=%%I"
  copy /y "%~dp0data\players_live.js" "%~dp0data_cache\players_live.backup-%STAMP%.js" >nul
  if errorlevel 1 (
    echo ERRO: nao foi possivel criar o backup. Atualizacao cancelada.
    pause
    exit /b 1
  )
  echo Backup salvo em data_cache\players_live.backup-%STAMP%.js
)
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
