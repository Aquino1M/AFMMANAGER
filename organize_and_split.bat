@echo off
chcp 65001 > nul
title AFM MANAGER 2027 - Reorganização de Mídias e Modularização de Dados
echo ======================================================================
echo 🚀 EXECUTANDO REORGANIZAÇÃO FÍSICA E MODULARIZAÇÃO DE DADOS AFM MANAGER
echo ======================================================================
node "%~dp0organize_and_split.js"
echo.
pause
