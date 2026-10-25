@echo off
chcp 65001 >nul
echo ===================================================
echo   INSTALANDO EXTENSOES DE JOGOS, 3D E UI/UX...
echo ===================================================

set EXTENSIONS=cesium.gltf-vscode slevesque.vscode-3dviewer slevesque.shader stevensona.shader-toy JacquesLucke.blender-development nerohoop.threejs-snippets jock.svg kisstkondoros.vscode-gutter-preview Tyriar.luna-paint bradlc.vscode-tailwindcss figma.figma-vscode-extension webhint.vscode-webhint wix.vscode-import-cost naumovs.color-highlight

for %%e in (%EXTENSIONS%) do (
    echo [INSTALANDO] %%e ...
    call code --install-extension %%e --force
)

echo.
echo ===================================================
echo   [SUCESSO] Todas as extensoes foram instaladas!
echo ===================================================
pause
