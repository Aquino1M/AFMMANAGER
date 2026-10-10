@echo off
chcp 65001 >nul
cd /d "%~dp0"
call "%~dp0sync_afm_assets.bat"
exit /b %ERRORLEVEL%
