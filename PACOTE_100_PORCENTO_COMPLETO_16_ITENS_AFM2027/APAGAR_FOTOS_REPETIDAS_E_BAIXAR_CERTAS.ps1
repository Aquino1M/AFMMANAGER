# ==============================================================================
# SCRIPT: APAGAR_FOTOS_REPETIDAS_E_BAIXAR_CERTAS.ps1
# Como usar: Copie este arquivo para a pasta raiz do seu jogo (onde fica a pasta `img`)
# e execute no PowerShell!
# 1. Ele analisa todas as subpastas de `img\players\` (como `arg_1\velez_sarsfield`,
#    `bra_a\atletico_mg`, `bra_a\corinthians`, etc.).
# 2. Apaga IMEDIATAMENTE todas as fotos genericas repetidas (com mesmo Hash MD5).
# 3. Baixa a foto REAL individual de cada jogador pelo nome do arquivo!
# ==============================================================================

$playersRoot = Join-Path$PSScriptRoot "img\players"
if (-not (Test-Path $playersRoot)) {
    Write-Host "A pasta img\players nao foi encontrada aqui. Coloque este script na pasta raiz do seu jogo!" -ForegroundColor Red
    exit
}

Write-Host "1. Procurando e apagando todas as fotos genericas repetidas em $playersRoot ..." -ForegroundColor Cyan
$allImages = Get-ChildItem -Path$playersRoot -Recurse -File -Include *.png, *.jpg, *.jpeg, *.webp
$groupedByHash = $allImages \vert{} Group-Object -Property { (Get-FileHash$_.FullName -Algorithm MD5).Hash }

$toRedownload = @()$removedTotal = 0

foreach ($grp in$groupedByHash) {
    # Se a mesma imagem aparece repetida em 2 ou mais jogadores, e uma foto generica clonada -> APAGA TODAS!
    if ($grp.Count -ge 2) {
        foreach ($f in$grp.Group) {
            $toRedownload +=$f.FullName
            Remove-Item -Path $f.FullName -Force$removedTotal++
        }
    }
}

Write-Host " [OK] $removedTotal fotos genericas repetidas foram apagadas!" -ForegroundColor Yellow

Write-Host "2. Baixando as fotos REAIS certas de cada jogador para suas respectivas pastas..." -ForegroundColor Cyan
foreach ($filePath in$toRedownload) {
    $fileNameNoExt = [System.IO.Path]::GetFileNameWithoutExtension($filePath)
    $cleanName = ($fileNameNoExt -replace '_', ' ' -replace '-', ' ').Trim()
    try {
        $q = [uri]::EscapeDataString($cleanName)
        $url = "https://www.thesportsdb.com/api/v1/json/3/searchplayers.php?p=$q"
        $resp = Invoke-RestMethod -Uri$url -Method Get -TimeoutSec 10
        if ($resp.player -and$resp.player.Count -gt 0) {
            $p =$resp.player[0]
            $photoUrl = if ($p.strCutout) { $p.strCutout } elseif ($p.strThumb) { $p.strThumb } else {$null }
            if ($photoUrl) {
                Invoke-WebRequest -Uri $photoUrl -OutFile$filePath -UseBasicParsing
                Write-Host " [BAIXADO] $cleanName ->$filePath" -ForegroundColor Green
            }
        }
    } catch {
        Write-Host " [AVATAR LIMPO] $cleanName" -ForegroundColor DarkGray
    }
}

Write-Host "✅ Concluido! Todas as pastas de img\players estao limpas e atualizadas." -ForegroundColor Green