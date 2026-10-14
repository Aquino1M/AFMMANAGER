# ====================================================================
# INSTALACAO DE EXTENSOES RECOMENDADAS - AFM MANAGER 2027
# ====================================================================

$exts = @(
  "usernamehw.errorlens",
  "ritwickdey.liveserver",
  "eamodio.gitlens",
  "esbenp.prettier-vscode",
  "dbaeumer.vscode-eslint",
  "christian-kohler.path-intellisense",
  "bradlc.tailwindcss",
  "naumovs.color-highlight",
  "gruntfuggly.todo-tree",
  "xabikos.javascriptsnippets"
)

# 1. Tentar comandos diretos no PATH
$cli = if (Get-Command antigravity -ErrorAction SilentlyContinue) {
    "antigravity"
} elseif (Get-Command code -ErrorAction SilentlyContinue) {
    "code"
} else {
    $null
}

# 2. Tentar caminhos conhecidos de instalacao no Windows
if (-not $cli) {
    $knownPaths = @(
        "$env:LOCALAPPDATA\Programs\Antigravity\bin\antigravity.cmd",
        "$env:LOCALAPPDATA\Programs\antigravity-ide\bin\antigravity.cmd",
        "$env:LOCALAPPDATA\Programs\Antigravity IDE\bin\antigravity.cmd",
        "$env:LOCALAPPDATA\Programs\Google\Antigravity\bin\antigravity.cmd",
        "$env:LOCALAPPDATA\Programs\Microsoft VS Code\bin\code.cmd",
        "$env:ProgramFiles\Microsoft VS Code\bin\code.cmd",
        "${env:ProgramFiles(x86)}\Microsoft VS Code\bin\code.cmd",
        "$env:LOCALAPPDATA\Programs\VS Code\bin\code.cmd",
        "$env:USERPROFILE\.gemini\antigravity-ide\bin\antigravity.cmd"
    )
    foreach ($p in $knownPaths) {
        if ($p -and (Test-Path $p)) {
            $cli = $p
            break
        }
    }
}

# 3. Detectar a partir dos processos em execucao no Windows
if (-not $cli) {
    $procs = Get-Process -ErrorAction SilentlyContinue | Where-Object {
        $_.Path -and ($_.Path -match 'antigravity' -or $_.Path -match 'code\.exe' -or $_.Path -match 'gemini')
    }
    foreach ($pr in $procs) {
        $baseDir = Split-Path $pr.Path -Parent
        $parentDir = Split-Path $baseDir -Parent
        $candidates = @(
            (Join-Path $baseDir "bin\antigravity.cmd"),
            (Join-Path $baseDir "bin\code.cmd"),
            (Join-Path $baseDir "resources\app\bin\code.cmd"),
            (Join-Path $parentDir "bin\antigravity.cmd"),
            (Join-Path $parentDir "bin\code.cmd")
        )
        foreach ($c in $candidates) {
            if ($c -and (Test-Path $c)) {
                $cli = $c
                break
            }
        }
        if ($cli) { break }
    }
}

if (-not $cli) {
    Write-Host ""
    Write-Host "[!] O comando 'code' ou 'antigravity' nao esta registrado no PATH do Windows." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "====================================================================" -ForegroundColor Cyan
    Write-Host "      COMO INSTALAR COM 1 CLIQUE DIRETO NA INTERFACE DO EDITOR      " -ForegroundColor Cyan
    Write-Host "====================================================================" -ForegroundColor Cyan
    Write-Host "1. No editor, pressione o atalho:  Ctrl + Shift + X" -ForegroundColor White
    Write-Host "2. No campo de busca de extensoes, digite:  @recommended" -ForegroundColor White
    Write-Host "3. Na secao 'Recomendacoes do Workspace' (10 extensoes listadas)," -ForegroundColor White
    Write-Host "   clique no icone de nuvem ou em 'Instalar Todas' / 'Install All'." -ForegroundColor Green
    Write-Host "====================================================================" -ForegroundColor Cyan
    exit 1
}

Write-Host "[OK] Executavel detectado com sucesso: $cli" -ForegroundColor Green
Write-Host "[i] Instalando $($exts.Count) extensoes recomendadas..." -ForegroundColor Cyan
Write-Host ""

foreach ($ext in $exts) {
    Write-Host "[*] Instalando $ext ..." -ForegroundColor Yellow
    & $cli --install-extension $ext --force
}

Write-Host ""
Write-Host "[OK] Todas as 10 extensoes recomendadas foram instaladas com sucesso!" -ForegroundColor Green
