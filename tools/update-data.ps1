$ErrorActionPreference = 'Stop'
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
$Root = Split-Path $PSScriptRoot -Parent
$DataDir = Join-Path $Root 'data'
$CacheDir = Join-Path $Root 'data_cache'
New-Item -ItemType Directory -Force -Path $DataDir,$CacheDir | Out-Null
$Pdb = Join-Path $CacheDir 'playersdb.csv'
$Fc = Join-Path $CacheDir 'fc26_players.csv'
$Out = Join-Path $DataDir 'players_live.js'
$Log = Join-Path $CacheDir 'update.log'
"Atualizacao iniciada em $(Get-Date -Format s)" | Set-Content $Log -Encoding UTF8

function Download-File($Url,$Path){
  Write-Host "Baixando $Url" -ForegroundColor Cyan
  try { Invoke-WebRequest -UseBasicParsing -Uri $Url -OutFile $Path -Headers @{'User-Agent'='Aquino-Futebol-Manager/1.0'}; return $true }
  catch { "FALHA: $Url :: $($_.Exception.Message)" | Add-Content $Log; Write-Warning $_.Exception.Message; return $false }
}
function Find-Col($Headers,[string[]]$Patterns){
  foreach($p in $Patterns){$m=$Headers | Where-Object { $_ -match $p } | Select-Object -First 1;if($m){return $m}}
  return $null
}
function N($s){ if($null -eq $s){return ''}; return (($s.ToString().Normalize([Text.NormalizationForm]::FormD) -replace '\p{M}','').ToLowerInvariant().Trim()) }
function Num($s){ if($null -eq $s -or "$s" -eq ''){return $null};$z=("$s" -replace '[^0-9,.-]','').Replace(',','.');$v=0.0;if([double]::TryParse($z,[Globalization.NumberStyles]::Any,[Globalization.CultureInfo]::InvariantCulture,[ref]$v)){return $v};return $null }

$pdbOK=Download-File 'https://playersdb.app/download/csv' $Pdb
$fcOK=Download-File 'https://raw.githubusercontent.com/ismailoksuz/EAFC26-DataHub/main/data/players.csv' $Fc

$pesByFifa=@{}; $pesByName=@{}; $pdbRows=@()
if($pdbOK){
  Write-Host 'Lendo PlayersDB (PES/eFootball + IDs cruzados)...' -ForegroundColor Green
  $sample=Import-Csv $Pdb | Select-Object -First 1
  if($sample){
    $h=$sample.PSObject.Properties.Name
    "PlayersDB headers: $($h -join ' | ')" | Add-Content $Log
    $nameC=Find-Col $h @('(?i)^player name$','(?i)^player$','(?i)^name$')
    $teamC=Find-Col $h @('(?i)^team name\(s\)$','(?i)team.*name','(?i)^club$')
    $posC=Find-Col $h @('(?i)^position$','(?i)primary.*position','(?i)^pos$')
    $natC=Find-Col $h @('(?i)^nationality$','(?i)^country$')
    $ageC=Find-Col $h @('(?i)^age$','(?i)age.*years')
    $pesIdC=Find-Col $h @('(?i)^pes id$','(?i)konami.*id','(?i)pes.*id')
    $fifaIdC=Find-Col $h @('(?i)^fifa id$','(?i)ea.*id','(?i)fifa.*id')
    $pesOvrC=Find-Col $h @('(?i)efootball.*(overall|ovr)','(?i)(overall|ovr).*efootball','(?i)^overall$','(?i)^ovr$')
    $eaOvrC=Find-Col $h @('(?i)(ea|fc ?27|fifa).*(overall|ovr)','(?i)(overall_rating|overall).*ea')
    $potC=Find-Col $h @('(?i)(ea|fc|fifa).*potential','(?i)^potential$')
    $count=0
    Import-Csv $Pdb | ForEach-Object {
      $r=$_; $name=if($nameC){$r.$nameC}else{''}; $team=if($teamC){$r.$teamC}else{''}
      if($team -and $team -match ','){ $team=($team -split ',')[0].Trim() }
      if(!$name){return}
      $rec=[ordered]@{name="$name";club="$team";country=if($natC){"$($r.$natC)"}else{''};pos=if($posC){"$($r.$posC)"}else{''};age=if($ageC){Num $r.$ageC}else{$null};fc=if($eaOvrC){Num $r.$eaOvrC}else{$null};pes=if($pesOvrC){Num $r.$pesOvrC}else{$null};potential=if($potC){Num $r.$potC}else{$null};pesId=if($pesIdC){"$($r.$pesIdC)"}else{''};fifaId=if($fifaIdC){"$($r.$fifaIdC)"}else{''}}
      if($rec.fifaId -and $rec.fifaId -ne '-'){$pesByFifa[$rec.fifaId]=$rec}
      if($team){$pesByName[(N $name)+'|'+(N $team)]=$rec}
      if($team -and $rec.pes){$pdbRows += [pscustomobject]$rec}
      $count++; if($count%20000 -eq 0){Write-Host "  $count registros PlayersDB..."}
    }
  }
}

$final=New-Object System.Collections.Generic.List[object]
$seen=@{}
if($fcOK){
  Write-Host 'Lendo base EA FC...' -ForegroundColor Green
  $sample=Import-Csv $Fc | Select-Object -First 1
  if($sample){
    $h=$sample.PSObject.Properties.Name
    "EAFC headers: $($h -join ' | ')" | Add-Content $Log
    $nameC=Find-Col $h @('(?i)^short_name$','(?i)^long_name$','(?i)^name$','(?i)player.*name')
    $clubC=Find-Col $h @('(?i)^club_name$','(?i)^team_name$','(?i)^club$','(?i)^team$')
    $leagueC=Find-Col $h @('(?i)^league_name$','(?i)^league$')
    $natC=Find-Col $h @('(?i)^nationality_name$','(?i)^nationality$')
    $posC=Find-Col $h @('(?i)^player_positions$','(?i)^position$','(?i)^positions$')
    $ageC=Find-Col $h @('(?i)^age$')
    $ovrC=Find-Col $h @('(?i)^overall$','(?i)^overall_rating$','(?i)^rating$')
    $potC=Find-Col $h @('(?i)^potential$')
    $idC=Find-Col $h @('(?i)^sofifa_id$','(?i)^fifa_id$','(?i)^player_id$')
    $valC=Find-Col $h @('(?i)^value_eur$','(?i)market.*value','(?i)^value$')
    $paceC=Find-Col $h @('(?i)^pace$');$shoC=Find-Col $h @('(?i)^shooting$');$pasC=Find-Col $h @('(?i)^passing$');$driC=Find-Col $h @('(?i)^dribbling$');$defC=Find-Col $h @('(?i)^defending$');$phyC=Find-Col $h @('(?i)^physic$','(?i)^physical$')
    $count=0
    Import-Csv $Fc | ForEach-Object {
      $r=$_;$name=if($nameC){"$($r.$nameC)"}else{''};$club=if($clubC){"$($r.$clubC)"}else{''};if(!$name -or !$club){return}
      $fid=if($idC){"$($r.$idC)"}else{''};$pes=$null
      if($fid -and $pesByFifa.ContainsKey($fid)){$pes=$pesByFifa[$fid]}elseif($pesByName.ContainsKey((N $name)+'|'+(N $club))){$pes=$pesByName[(N $name)+'|'+(N $club)]}
      $pos=if($posC){("$($r.$posC)" -split ',')[0].Trim()}else{''}
      $value=if($valC){Num $r.$valC}else{$null};if($value -and $value -gt 10000){$value=$value/1000000}
      $obj=[pscustomobject][ordered]@{name=$name;club=$club;league=if($leagueC){"$($r.$leagueC)"}else{''};country=if($natC){"$($r.$natC)"}else{if($pes){$pes.country}else{''}};pos=$pos;age=if($ageC){Num $r.$ageC}else{if($pes){$pes.age}else{$null}};fc=if($ovrC){Num $r.$ovrC}else{if($pes){$pes.fc}else{$null}};pes=if($pes){$pes.pes}else{$null};potential=if($potC){Num $r.$potC}else{if($pes){$pes.potential}else{$null}};value=$value;fifaId=$fid;pesId=if($pes){$pes.pesId}else{''};pace=if($paceC){Num $r.$paceC}else{$null};shooting=if($shoC){Num $r.$shoC}else{$null};passing=if($pasC){Num $r.$pasC}else{$null};dribbling=if($driC){Num $r.$driC}else{$null};defending=if($defC){Num $r.$defC}else{$null};physical=if($phyC){Num $r.$phyC}else{$null}}
      $key=if($fid){'f'+$fid}else{(N $name)+'|'+(N $club)};if(!$seen.ContainsKey($key)){$seen[$key]=$true;$final.Add($obj)}
      $count++; if($count%5000 -eq 0){Write-Host "  $count jogadores EA FC..."}
    }
  }
}

# Acrescenta jogadores atuais do PlayersDB que nao apareceram na base EA.
foreach($p in $pdbRows){
  $key=if($p.fifaId -and $p.fifaId -ne '-'){'f'+$p.fifaId}else{(N $p.name)+'|'+(N $p.club)}
  if(!$seen.ContainsKey($key) -and $p.club){
    $seen[$key]=$true
    $final.Add([pscustomobject][ordered]@{name=$p.name;club=$p.club;league='';country=$p.country;pos=$p.pos;age=$p.age;fc=$p.fc;pes=$p.pes;potential=$p.potential;value=$null;fifaId=$p.fifaId;pesId=$p.pesId;pace=$null;shooting=$null;passing=$null;dribbling=$null;defending=$null;physical=$null})
  }
}

if($final.Count -lt 100){throw "Poucos jogadores foram extraidos ($($final.Count)). Veja data_cache\update.log e mantenha o banco offline anterior."}
Write-Host "Gerando arquivo local com $($final.Count) jogadores..." -ForegroundColor Yellow
$utf8 = New-Object System.Text.UTF8Encoding($false)
$sw = New-Object System.IO.StreamWriter($Out,$false,$utf8)
$sw.Write('window.LIVE_PLAYERS=[')
for($i=0;$i -lt $final.Count;$i++){
  if($i -gt 0){$sw.Write(',')}
  $sw.Write(($final[$i] | ConvertTo-Json -Compress -Depth 3))
}
$sw.Write('];')
$meta=[ordered]@{source='PlayersDB + EA FC dataset';updated=(Get-Date -Format 'yyyy-MM-dd');count=$final.Count;note='Atualizado localmente. EA atual vem do PlayersDB quando disponivel; dataset FC26 serve como complemento/fallback. PES/eFootball vem do PlayersDB.'} | ConvertTo-Json -Compress
$sw.Write("window.PLAYER_DB_META=$meta;")
$sw.Close()
"SUCESSO: $($final.Count) jogadores em $(Get-Date -Format s)" | Add-Content $Log
Write-Host "OK: $($final.Count) jogadores gravados em data\players_live.js" -ForegroundColor Green
