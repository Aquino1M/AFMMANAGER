@echo off
chcp 65001 > nul
title AFM MANAGER 2027 - Download de Fotos de Jogadores (Transfermarkt)
echo ======================================================================
echo 📸 DOWNLOAD AUTOMÁTICO DE FOTOS REAIS DE JOGADORES (TRANSFERMARKT)
echo ======================================================================
node "%~dp0fetch_transfermarkt_photos.js"
echo.
pause
