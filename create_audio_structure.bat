@echo off
setlocal
chcp 65001 > nul
cd /d "%~dp0"
title AFM Manager 2027 - Criar Estrutura de Áudios
cls
echo ======================================================================
echo 🎵 AFM MANAGER 2027 - ESTRUTURAÇÃO DO SISTEMA DE ÁUDIO
echo ======================================================================
echo.
where node >nul 2>nul || (echo ERRO: Node.js nao encontrado no PATH.& pause & exit /b 1)
if not exist "%~dp0create_audio_structure.js" (echo ERRO: create_audio_structure.js nao foi encontrado.& pause & exit /b 1)
if not exist "%~dp0sounds" mkdir "%~dp0sounds"
for %%F in (sounds_manifest.json README.md) do if exist "%~dp0sounds\%%F" (
  for /f %%I in ('powershell -NoProfile -Command "Get-Date -Format yyyyMMdd-HHmmss"') do set "STAMP=%%I"
  copy /y "%~dp0sounds\%%F" "%~dp0sounds\%%F.backup-%STAMP%" >nul
  if errorlevel 1 (echo ERRO: backup de sounds\%%F falhou; operacao cancelada.& pause & exit /b 1)
)
node "%~dp0create_audio_structure.js"
if errorlevel 1 (echo ERRO: a estrutura de audio nao foi criada.& pause & exit /b 1)
echo.
pause
