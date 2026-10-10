@echo off
setlocal
chcp 65001 >nul
cd /d "%~dp0"
title AFM Manager - Enviar commits ao GitHub

where git >nul 2>nul || (echo ERRO: Git nao encontrado.& pause & exit /b 1)
git rev-parse --show-toplevel >nul 2>nul || (echo ERRO: esta pasta nao e um repositorio Git.& pause & exit /b 1)

for /f "delims=" %%I in ('git status --porcelain') do set "DIRTY=1"
if defined DIRTY (
  echo Envio cancelado: ha arquivos modificados ou sem commit.
  echo Nenhum arquivo foi adicionado ou alterado. Revise e crie o commit primeiro.
  git status --short
  pause
  exit /b 1
)

for /f "delims=" %%I in ('git branch --show-current') do set "BRANCH=%%I"
if not defined BRANCH (echo ERRO: nao foi possivel identificar a branch atual.& pause & exit /b 1)

echo Enviando somente commits ja existentes da branch "%BRANCH%".
echo O Git recusara o envio se a branch remota tiver avancado; nenhum rebase ou reset sera feito.
git push -u origin HEAD
if errorlevel 1 (
  echo ERRO: envio recusado ou indisponivel. Seu trabalho local foi mantido.
  pause
  exit /b 1
)

echo Envio concluido.
pause
