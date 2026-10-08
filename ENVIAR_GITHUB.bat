@echo off
chcp 65001 >nul
cd /d "%~dp0"
title Aquino Futebol Manager - Enviar para o GitHub
echo =====================================================
echo   ENVIANDO ATUALIZACOES PARA O GITHUB (AFMMANAGER)
echo =====================================================
echo.
git status
echo.
echo Adicionando arquivos modificados...
git add .
echo Criando commit com as novas funcionalidades...
git commit -m "feat: atualiza vercel.json com no-cache e build script para deploy no vercel"
echo Enviando para https://github.com/Aquino1M/AFMMANAGER.git...
git push origin main
echo.
if errorlevel 1 (
  echo ERRO: O push falhou. Verifique sua conexao ou permissoes do Git.
) else (
  echo =====================================================
  echo   TUDO ENVIADO COM SUCESSO PARA O GITHUB!
  echo =====================================================
)
echo.
pause
