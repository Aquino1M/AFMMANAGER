@echo off
setlocal EnableDelayedExpansion
chcp 65001 >nul
cd /d "%~dp0"
title AFM Manager - Enviar para o GitHub

echo ======================================================
echo          AFM MANAGER - ENVIAR PARA O GITHUB
echo ======================================================
echo.

:: 1. Garantir permissao do diretorio no Git (evita erro de 'dubious ownership')
git config --global --add safe.directory "E:/PROJETOS SAAS/VSCODE PROJETOS/Aquino_Futebol_Manager_2026" >nul 2>&1
git config --global --add safe.directory "%~dp0" >nul 2>&1
git config --global --add safe.directory "%CD%" >nul 2>&1

:: 2. Verificar se o Git esta instalado
where git >nul 2>nul || (
    echo [ERRO] Git nao encontrado no sistema.
    echo Instale o Git ou adicione-o ao PATH.
    echo.
    pause
    exit /b 1
)

:: 3. Verificar se e um repositorio Git
git rev-parse --show-toplevel >nul 2>nul || (
    echo [ERRO] Esta pasta nao e um repositorio Git valido.
    echo.
    pause
    exit /b 1
)

:: 4. Identificar a branch atual
for /f "delims=" %%I in ('git branch --show-current') do set "BRANCH=%%I"
if not defined BRANCH (
    echo [ERRO] Nao foi possivel identificar a branch atual.
    pause
    exit /b 1
)
echo Branch atual: %BRANCH%
echo.

:: 5. Verificar se ha alteracoes pendentes para commit
set "HAS_CHANGES="
for /f "delims=" %%I in ('git status --porcelain') do set "HAS_CHANGES=1"

if defined HAS_CHANGES (
    echo Alteracoes detectadas no projeto:
    git status --short
    echo.
    set /p "COMMIT_MSG=Digite a mensagem do commit (Enter para padrao): "
    if "!COMMIT_MSG!"=="" (
        set "COMMIT_MSG=Atualizacao do projeto"
    )
    
    echo.
    echo Adicionando arquivos...
    git add .
    
    echo Criando commit com a mensagem: "!COMMIT_MSG!"
    git commit -m "!COMMIT_MSG!"
    echo.
) else (
    echo Nenhuma nova alteracao para commitar.
    echo Verificando se ha commits locais pendentes para envio...
    echo.
)

:: 6. Enviar para o GitHub
echo Enviando para o GitHub (origin %BRANCH%)...
git push -u origin HEAD

if errorlevel 1 (
    echo.
    echo [ERRO] Falha ao enviar para o GitHub.
    echo Verifique sua conexao ou permissoes do repositorio.
    echo Seu trabalho local foi preservado com seguranca.
) else (
    echo.
    echo ======================================================
    echo   [SUCESSO] Projeto enviado ao GitHub com sucesso!
    echo ======================================================
)

echo.
pause
