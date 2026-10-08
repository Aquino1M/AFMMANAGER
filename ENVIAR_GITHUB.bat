@echo off
chcp 65001 >nul
cd /d "%~dp0"
title Aquino Futebol Manager - Enviar para o GitHub
echo =====================================================
echo   ENVIANDO ATUALIZACOES PARA O GITHUB (AFMMANAGER)
echo =====================================================
echo.
echo [1/4] Configurando autor oficial do GitHub...
git config user.name "Aquino1M"
git config user.email "243838973+Aquino1M@users.noreply.github.com"

echo [2/4] Verificando arquivos modificados...
git status
echo.
echo [3/4] Adicionando arquivos e gerando commit validado...
git add .
git commit --author="Aquino1M <243838973+Aquino1M@users.noreply.github.com>" -m "feat(v3.0): AFM Next-Gen - Prancheta 2.5D, Base Pro, Treino XP, WebAudio SFX, Multiplayer Cloud, Capitao e Bolas Paradas"

echo.
echo [4/4] Enviando para https://github.com/Aquino1M/AFMMANAGER.git...
git push origin main
echo.
if errorlevel 1 (
  echo ERRO: O push falhou. Verifique sua conexao ou permissoes do Git.
) else (
  echo =====================================================
  echo   TUDO ENVIADO COM SUCESSO PARA O GITHUB!
  echo   O Vercel iniciara o deploy automaticamente com autor validado.
  echo =====================================================
)
echo.
pause
