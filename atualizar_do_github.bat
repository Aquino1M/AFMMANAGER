@echo off
setlocal
chcp 65001 >nul
cd /d "%~dp0"
title AFM Manager - Atualizar com seguranca
:: Garantir permissao do diretorio no Git (evita dubious ownership)
git config --global --add safe.directory "E:/PROJETOS SAAS/VSCODE PROJETOS/Aquino_Futebol_Manager_2026" >nul 2>&1
git config --global --add safe.directory "%~dp0" >nul 2>&1
git config --global --add safe.directory "%CD%" >nul 2>&1

where git >nul 2>nul || (echo ERRO: Git nao encontrado.& pause & exit /b 1)
git rev-parse --show-toplevel >nul 2>nul || (echo ERRO: esta pasta nao e um repositorio Git.& pause & exit /b 1)

for /f "delims=" %%I in ('git status --porcelain') do set "DIRTY=1"
if defined DIRTY (
  echo Atualizacao cancelada: existem alteracoes locais.
  echo Salve e envie seu trabalho antes de atualizar. Nenhum arquivo foi alterado.
  git status --short
  pause
  exit /b 1
)

for /f "delims=" %%I in ('git rev-parse --abbrev-ref --symbolic-full-name "@{upstream}" 2^>nul') do set "UPSTREAM=%%I"
if not defined UPSTREAM (
  echo ERRO: esta branch nao tem uma branch remota configurada.
  pause
  exit /b 1
)

echo Buscando referencias remotas. Os arquivos locais nao serao sobrescritos.
git fetch || (echo ERRO: nao foi possivel buscar atualizacoes.& pause & exit /b 1)
git merge-base --is-ancestor HEAD "%UPSTREAM%"
if errorlevel 1 (
  echo Atualizacao cancelada: o historico local e remoto divergiu ou esta adiantado.
  echo Nenhum arquivo foi alterado. Envie ou revise os commits antes de atualizar.
  pause
  exit /b 1
)

for /f %%I in ('powershell -NoProfile -Command "Get-Date -Format yyyyMMdd-HHmmss"') do set "STAMP=%%I"
git branch "backup/pre-atualizacao-%STAMP%" HEAD || (echo ERRO ao criar a referencia de seguranca.& pause & exit /b 1)
git merge --ff-only "%UPSTREAM%"
if errorlevel 1 (
  echo ERRO: atualizacao nao aplicada. Sua versao anterior esta na branch backup/pre-atualizacao-%STAMP%.
  pause
  exit /b 1
)

echo Atualizacao segura concluida. Backup local: backup/pre-atualizacao-%STAMP%.
pause
