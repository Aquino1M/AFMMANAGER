const fs = require('fs');

console.log('Iniciando aplicação do patch dos botões unificados e competições válidas da Central...');

let content = fs.readFileSync('js/game.js', 'utf8');

// 1. Unificar os botões na Central (de 2 botões para 1 botão "Meu Time & Tática")
const oldHeroButtons = `              <!-- BOTÕES RÁPIDOS LATERAIS: EQUIPA & TÁTICAS (SCREENSHOT 1) -->\r
              <div style="display:flex;flex-direction:column;gap:8px;justify-content:center;">\r
                <button type="button" class="btn" id="btnHeroQuickSquad" style="padding:7px 14px;font-size:11px;font-weight:900;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.15);border-radius:8px;color:#fff;cursor:pointer;white-space:nowrap;display:flex;align-items:center;gap:6px;">\r
                  <span>👥</span> Elenco\r
                </button>\r
                <button type="button" class="btn" id="btnHeroQuickTactics" style="padding:7px 14px;font-size:11px;font-weight:900;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.15);border-radius:8px;color:#fff;cursor:pointer;white-space:nowrap;display:flex;align-items:center;gap:6px;">\r
                  <span>📋</span> Táticas\r
                </button>\r
              </div>`;

const newHeroButtons = `              <!-- BOTÃO RÁPIDO LATERAL: MEU TIME & TÁTICA (UNIFICADO) -->\r
              <div style="display:flex;align-items:center;justify-content:center;">\r
                <button type="button" class="btn" id="btnHeroQuickTactics" title="Abrir Meu Time & Tática" style="padding:9px 16px;font-size:12px;font-weight:900;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.15);border-radius:10px;color:#fff;cursor:pointer;white-space:nowrap;display:flex;align-items:center;gap:7px;transition:all 0.2s ease;">\r
                  <span>📋</span> Meu Time & Tática\r
                </button>\r
              </div>`;

if (content.includes(oldHeroButtons)) {
  content = content.replace(oldHeroButtons, newHeroButtons);
  console.log('✅ Botões de Elenco & Táticas na Central unificados para 1 botão.');
} else {
  console.warn('⚠️ oldHeroButtons não encontrado com CRLF exato, tentando normalizado...');
  const normContent = content.replace(/\r\n/g, '\n');
  const normOld = oldHeroButtons.replace(/\r\n/g, '\n');
  const normNew = newHeroButtons.replace(/\r\n/g, '\n');
  if (normContent.includes(normOld)) {
    content = normContent.replace(normOld, normNew).replace(/\n/g, '\r\n');
    console.log('✅ Botões de Elenco & Táticas na Central unificados (normalizado).');
  } else {
    throw new Error('Falha ao localizar oldHeroButtons na Central');
  }
}

// 2. Preparação de dados das competições válidas do usuário na Central
const targetDataPrep = `  // Dados do Torneio Continental (Libertadores / Sul-Americana) para alternância na Central`;
const idxDataPrep = content.indexOf(targetDataPrep);
if (idxDataPrep === -1) {
  throw new Error('targetDataPrep não encontrado no game.js');
}

const targetReturnCentral = `  return \`\r\n    <div class="central-dashboard-grid"`;
let idxReturnCentral = content.indexOf(targetReturnCentral, idxDataPrep);
if (idxReturnCentral === -1) {
  idxReturnCentral = content.indexOf(`  return \`\n    <div class="central-dashboard-grid"`, idxDataPrep);
}
if (idxReturnCentral === -1) {
  throw new Error('idxReturnCentral não encontrado');
}

const oldDataBlock = content.substring(idxDataPrep, idxReturnCentral);

const newDataBlock = `  // Dados do Torneio Continental (Libertadores / Sul-Americana) para alternância na Central\r
  let contCompId = 'lib';\r
  const libTourney = (typeof getContinentalTournament === 'function') ? getContinentalTournament('lib') : null;\r
  const sudTourney = (typeof getContinentalTournament === 'function') ? getContinentalTournament('sud') : null;\r
  let activeTourney = libTourney;\r
  let isUserInTournament = false;\r
  let userLibGroup = null;\r
\r
  if (libTourney?.standings) {\r
    for (const [grp, rows] of Object.entries(libTourney.standings)) {\r
      if (Array.isArray(rows) && rows.some(r => norm(r.name) === norm(state.club))) {\r
        userLibGroup = grp;\r
        isUserInTournament = true;\r
        activeTourney = libTourney;\r
        contCompId = 'lib';\r
        break;\r
      }\r
    }\r
  }\r
  if (!isUserInTournament && sudTourney?.standings) {\r
    for (const [grp, rows] of Object.entries(sudTourney.standings)) {\r
      if (Array.isArray(rows) && rows.some(r => norm(r.name) === norm(state.club))) {\r
        userLibGroup = grp;\r
        isUserInTournament = true;\r
        activeTourney = sudTourney;\r
        contCompId = 'sud';\r
        break;\r
      }\r
    }\r
  }\r
  if (!userLibGroup) {\r
    userLibGroup = 'A';\r
    activeTourney = libTourney;\r
    contCompId = 'lib';\r
  }\r
\r
  const continentalCompName = contCompId === 'lib' ? 'COPA LIBERTADORES' : 'COPA SUL-AMERICANA';\r
  const continentalGroupStandings = ((activeTourney?.standings?.[userLibGroup] || [])).slice().sort((a,b) => (Number(b.points ?? b.p ?? 0) - Number(a.points ?? a.p ?? 0)) || (((b.gf||0)-(b.ga||0)) - ((a.gf||0)-(a.ga||0))) || ((b.gf||0) - (a.gf||0)));\r
\r
  const userLibMatches = (activeTourney?.matches || []).filter(m => norm(m.home) === norm(state.club) || norm(m.away) === norm(state.club));\r
  let myLibFixture = userLibMatches.find(m => !m.played && !m.score);\r
  if (!myLibFixture && userLibMatches.length > 0) myLibFixture = userLibMatches[userLibMatches.length - 1];\r
  if (!myLibFixture) {\r
    const grpMatches = (activeTourney?.matches || []).filter(m => m.group === userLibGroup);\r
    myLibFixture = grpMatches.find(m => !m.played && !m.score) || grpMatches[0] || { home: 'Flamengo', away: 'River Plate', date: '2026-04-01', round: 1 };\r
  }\r
\r
  let libCountdownHtml = '';\r
  if (myLibFixture.score) {\r
    libCountdownHtml = \`<b style="color:#4ade80">PARTIDA FINALIZADA: \${myLibFixture.score[0]} x \${myLibFixture.score[1]}</b>\`;\r
  } else if (myLibFixture.date === state.date) {\r
    libCountdownHtml = \`<b style="color:#22c55e">🔥 HOJE É DIA DE JOGO NA LIBERTADORES!</b>\`;\r
  } else if (myLibFixture.date > state.date) {\r
    const d1 = new Date(state.date + 'T12:00:00');\r
    const d2 = new Date(myLibFixture.date + 'T12:00:00');\r
    const diffD = Math.max(1, Math.round((d2 - d1) / 86400000));\r
    libCountdownHtml = \`<b style="color:#f59e0b">Faltam \${diffD} \${diffD === 1 ? 'dia' : 'dias'} para a partida.</b>\`;\r
  } else {\r
    libCountdownHtml = \`<b style="color:#94a3b8">Confronto agendado: \${formatDatePtBr(myLibFixture.date)}</b>\`;\r
  }\r
\r
  const otherLibFixtures = (activeTourney?.matches || []).filter(m => m !== myLibFixture && m.group === userLibGroup).slice(0, 3);\r
\r
  // Resolução dinâmica de Campeonatos que o usuário PODE JOGAR (Estadual, Copa ou Torneio Continental)\r
  const myClubKey = norm(state.club);\r
  const memberships = (typeof getSavedSeasonMemberships === 'function') ? getSavedSeasonMemberships(state.club) : { stateId: null };\r
  const stateCompId = memberships?.stateId;\r
  const stateComp = stateCompId && typeof compById === 'function' ? compById(stateCompId) : null;\r
  const hasState = Boolean(stateCompId && stateComp && stateCompId.startsWith('bra-est-'));\r
\r
  let myEstFixture = null;\r
  let otherEstFixtures = [];\r
  let estStandings = [];\r
  let estCountdownHtml = '';\r
\r
  if (hasState && stateCompId) {\r
    const estData = (typeof getStateCompData === 'function') ? getStateCompData(stateCompId) : null;\r
    if (estData) {\r
      if ((stateCompId === state.compId || (state.compId && state.compId.startsWith('bra-est-'))) && Array.isArray(state.teams) && state.teams.length > 0) {\r
        estStandings = state.teams.slice().sort((a,b) => (Number(b.p||0) - Number(a.p||0)) || (Number(b.sg||0) - Number(a.sg||0)) || (Number(b.gp||0) - Number(a.gp||0)));\r
      } else if (Array.isArray(estData.teams) && estData.teams.length > 0) {\r
        estStandings = estData.teams.slice().sort((a,b) => (Number(b.p||0) - Number(a.p||0)) || (Number(b.sg||0) - Number(a.sg||0)) || (Number(b.gp||0) - Number(a.gp||0)));\r
      }\r
\r
      const myEstMatches = (estData.fixtures || []).filter(f => norm(f.home) === myClubKey || norm(f.away) === myClubKey);\r
      myEstFixture = myEstMatches.find(f => !f.played && !f.result && (!f.isoDate || f.isoDate >= state.date))\r
        || myEstMatches.find(f => !f.played && !f.result)\r
        || myEstMatches[myEstMatches.length - 1]\r
        || null;\r
\r
      if (myEstFixture) {\r
        const estDate = myEstFixture.isoDate || (typeof getDateForRound === 'function' ? getDateForRound(myEstFixture.roundIndex || 0, state.season) : state.date);\r
        if (myEstFixture.result || myEstFixture.score) {\r
          const sc = myEstFixture.result || myEstFixture.score;\r
          estCountdownHtml = \`<b style="color:#4ade80">PARTIDA FINALIZADA: \${sc[0]} x \${sc[1]}</b>\`;\r
        } else if (estDate === state.date) {\r
          estCountdownHtml = \`<b style="color:#22c55e">🔥 HOJE É DIA DE JOGO NO ESTADUAL!</b>\`;\r
        } else if (estDate > state.date) {\r
          const d1 = new Date(state.date + 'T12:00:00');\r
          const d2 = new Date(estDate + 'T12:00:00');\r
          const diffD = Math.max(1, Math.round((d2 - d1) / 86400000));\r
          estCountdownHtml = \`<b style="color:#10b981">Faltam \${diffD} \${diffD === 1 ? 'dia' : 'dias'} para a partida.</b>\`;\r
        } else {\r
          estCountdownHtml = \`<b style="color:#94a3b8">Confronto agendado: \${formatDatePtBr(estDate)}</b>\`;\r
        }\r
\r
        const targetRound = myEstFixture.roundIndex ?? 0;\r
        otherEstFixtures = (estData.fixtures || []).filter(f => f !== myEstFixture && (f.roundIndex === targetRound)).slice(0, 3);\r
      }\r
    }\r
  }\r
\r
  // Monta as abas secundárias permitidas APENAS para os campeonatos que o usuário PODE JOGAR\r
  const userCentralCupTabs = [];\r
  if (hasState) {\r
    userCentralCupTabs.push({\r
      id: 'estadual',\r
      label: '🏟️ ESTADUAL',\r
      shortName: stateComp.name,\r
      title: stateComp.name\r
    });\r
  }\r
\r
  let userInCopa = false;\r
  if (copa?.phases) {\r
    for (const phase of Object.values(copa.phases)) {\r
      if (Array.isArray(phase.fixtures) && phase.fixtures.some(f => norm(f.home) === myClubKey || norm(f.away) === myClubKey)) {\r
        userInCopa = true;\r
        break;\r
      }\r
    }\r
  }\r
  if (userInCopa || (stateCompId && stateCompId.startsWith('bra-'))) {\r
    userCentralCupTabs.push({\r
      id: 'copa',\r
      label: '🇧🇷 COPA',\r
      shortName: 'Copa do Brasil',\r
      title: 'COPA DO BRASIL'\r
    });\r
  }\r
\r
  // Adiciona Libertadores ou Sul-Americana SOMENTE se o usuário for participante real\r
  if (isUserInTournament) {\r
    userCentralCupTabs.push({\r
      id: contCompId === 'lib' ? 'libertadores' : 'sulamericana',\r
      label: contCompId === 'lib' ? '🏆 LIBERTADORES' : '🥈 SUL-AMERICANA',\r
      shortName: contCompId === 'lib' ? 'Libertadores' : 'Sul-Americana',\r
      title: contCompId === 'lib' ? 'COPA LIBERTADORES' : 'COPA SUL-AMERICANA'\r
    });\r
  }\r
\r
  if (userCentralCupTabs.length === 0) {\r
    userCentralCupTabs.push({\r
      id: 'copa',\r
      label: '🇧🇷 COPA',\r
      shortName: 'Copa do Brasil',\r
      title: 'COPA DO BRASIL'\r
    });\r
  }\r
\r
  if (!state.centralCupTab || !userCentralCupTabs.some(t => t.id === state.centralCupTab)) {\r
    state.centralCupTab = userCentralCupTabs[0].id;\r
  }\r
  const activeCentralTabId = state.centralCupTab;\r
\r
  const curAvatar = MANAGER_AVATARS[currentManagerAvatarIdx % MANAGER_AVATARS.length];\r
  const curBoardScore = clamp(Number(state.boardConfidence ?? state.trust?.board ?? 75), 0, 100);\r
  const boardStatus = getBoardConfidenceStatus(curBoardScore);\r
  const h2h = getHeadToHeadRecord(state.club, opp);\r
  const altInfo = isHighAltitudeVenue(opp);\r
\r
`;

content = content.substring(0, idxDataPrep) + newDataBlock + content.substring(idxReturnCentral);
console.log('✅ Bloco de dados de competições do usuário atualizado na Central.');

// 3. Substituir o Widget 2 na Central
const targetWidget2Start = `        <!-- Widget 2: Copa do Brasil ou Libertadores com Botão de Troca (Screenshot da Central) -->`;
const idxWidget2 = content.indexOf(targetWidget2Start);
if (idxWidget2 === -1) {
  throw new Error('targetWidget2Start não encontrado');
}

const targetWidget3 = `        <!-- Widget 3: Voz da Torcida (#AFM2027) -->`;
const idxWidget3 = content.indexOf(targetWidget3, idxWidget2);
if (idxWidget3 === -1) {
  throw new Error('targetWidget3 não encontrado');
}

const newWidget2Block = `        <!-- Widget 2: Campeonatos que o Usuário Pode Jogar (Estadual, Copa ou Continental) -->\r
        \${(() => {\r
          const currentTabObj = userCentralCupTabs.find(t => t.id === activeCentralTabId) || userCentralCupTabs[0];\r
          const isEstTab = currentTabObj.id === 'estadual';\r
          const isCopaTab = currentTabObj.id === 'copa';\r
          const isContTab = currentTabObj.id === 'libertadores' || currentTabObj.id === 'sulamericana';\r
\r
          const widgetCardTitle = isEstTab ? esc(stateComp?.name?.toUpperCase() || 'CAMPEONATO ESTADUAL') : (isCopaTab ? 'COPA DO BRASIL' : esc(continentalCompName));\r
          const widgetCardSub = isEstTab ? 'FASE REGIONAL • ESTADUAL' : (isCopaTab ? \`MATA-MATA • \${esc(activeCopaPhaseKey.toUpperCase())}\` : \`FASE DE GRUPOS • GRUPO \${userLibGroup}\`);\r
          const widgetCardBorder = isEstTab ? 'rgba(16,185,129,0.35)' : (isCopaTab ? 'rgba(139,92,246,0.3)' : 'rgba(245,158,11,0.35)');\r
\r
          return \`\r
            <div class="card" style="padding:18px;background:#100d1e;border:1px solid \${widgetCardBorder};border-radius:18px">\r
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">\r
                <div>\r
                  <div style="font-size:13px;font-weight:900;color:#fff;letter-spacing:0.5px">\r
                    \${widgetCardTitle}\r
                  </div>\r
                  <div style="font-size:9px;font-weight:800;color:rgba(255,255,255,0.4);letter-spacing:1px;text-transform:uppercase;margin-top:2px">\r
                    \${widgetCardSub}\r
                  </div>\r
                </div>\r
\r
                <!-- Botões para Alternar entre os Campeonatos que o Clube Disputa -->\r
                <div style="display:flex;gap:4px;align-items:center;background:#161228;padding:3px;border-radius:10px;border:1px solid rgba(255,255,255,0.08)">\r
                  \${userCentralCupTabs.map(tab => {\r
                    const isActive = activeCentralTabId === tab.id;\r
                    let activeStyle = '';\r
                    if (isActive) {\r
                      if (tab.id === 'estadual') activeStyle = 'background:linear-gradient(135deg,#059669,#10b981);color:#fff;border:none;box-shadow:0 0 10px rgba(16,185,129,0.5)';\r
                      else if (tab.id === 'copa') activeStyle = 'background:linear-gradient(135deg,#7c3aed,#9333ea);color:#fff;border:none;box-shadow:0 0 10px rgba(124,58,237,0.5)';\r
                      else activeStyle = 'background:linear-gradient(135deg,#f59e0b,#d97706);color:#000;border:none;box-shadow:0 0 10px rgba(245,158,11,0.5)';\r
                    } else {\r
                      activeStyle = 'background:transparent;color:rgba(255,255,255,0.6);border:none';\r
                    }\r
                    const btnId = tab.id === 'estadual' ? 'btnCentralTabEstadual' : (tab.id === 'copa' ? 'btnCentralTabCopa' : 'btnCentralTabLib');\r
                    return \`\r
                      <button type="button" class="btn btn-central-cup-tab" id="\${btnId}" data-tab-id="\${tab.id}" title="Ver \${esc(tab.title)}" style="padding:4px 9px;font-size:10px;font-weight:900;border-radius:8px;cursor:pointer;transition:all 0.2s;\${activeStyle}">\r
                        \${tab.label}\r
                      </button>\r
                    \`;\r
                  }).join('')}\r
                </div>\r
              </div>\r
\r
              \${isEstTab ? \`\r
                <!-- CONTEÚDO DO CAMPEONATO ESTADUAL -->\r
                <!-- Seu Confronto -->\r
                \${myEstFixture ? \`\r
                  <div style="margin-top:12px;background:#13261e;border:1px solid #10b981;border-radius:12px;padding:12px">\r
                    <div style="font-size:10px;font-weight:800;color:#34d399;letter-spacing:0.5px">RODADA \${(Number(myEstFixture.roundIndex ?? 0)) + 1} • SEU CONFRONTO</div>\r
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-top:8px">\r
                      <div style="display:flex;align-items:center;gap:6px">\r
                        \${clubBadge(myEstFixture.home, 18)}\r
                        <span style="font-size:12px;font-weight:900;color:#fff">\${esc(myEstFixture.home)}</span>\r
                      </div>\r
                      <span style="font-size:10px;color:rgba(255,255,255,0.4);font-weight:900">x</span>\r
                      <div style="display:flex;align-items:center;gap:6px">\r
                        <span style="font-size:12px;font-weight:900;color:#fff">\${esc(myEstFixture.away)}</span>\r
                        \${clubBadge(myEstFixture.away, 18)}\r
                      </div>\r
                    </div>\r
                    <div style="font-size:9px;color:rgba(255,255,255,0.5);margin-top:6px;text-align:center">\r
                      RODADA \${(Number(myEstFixture.roundIndex ?? 0)) + 1} • \${esc(formatDatePtBr(myEstFixture.isoDate || state.date)).toUpperCase()}<br>\r
                      \${estCountdownHtml}\r
                    </div>\r
                  </div>\r
                \` : ''}\r
\r
                <!-- Tabela de Classificação do Estadual -->\r
                <div style="margin-top:12px">\r
                  <div style="font-size:10px;font-weight:800;color:rgba(255,255,255,0.4);margin-bottom:8px">CLASSIFICAÇÃO • \${esc(stateComp?.name?.toUpperCase() || 'ESTADUAL')}</div>\r
                  <div class="tablewrap" style="max-height:160px">\r
                    <table style="width:100%;font-size:10px">\r
                      <thead>\r
                        <tr style="color:rgba(255,255,255,0.4)">\r
                          <th>#</th>\r
                          <th>CLUBE</th>\r
                          <th style="text-align:center">P</th>\r
                          <th style="text-align:center">J</th>\r
                          <th style="text-align:center">SG</th>\r
                        </tr>\r
                      </thead>\r
                      <tbody>\r
                        \${estStandings.map((t, idx) => {\r
                          const pos = idx + 1;\r
                          const isMy = norm(t.name) === norm(state.club);\r
                          const pts = Number(t.points ?? t.p ?? 0);\r
                          const j = Number(t.played ?? t.j ?? 0);\r
                          const sg = Number(t.sg ?? ((t.gp ?? t.gf ?? 0) - (t.gc ?? t.ga ?? 0)));\r
                          return \`\r
                            <tr style="\${isMy ? 'background:rgba(16,185,129,0.25);font-weight:900;' : ''}font-size:10px">\r
                              <td style="font-weight:800;color:\${pos <= 4 ? '#4ade80' : '#fff'}">\${pos}</td>\r
                              <td>\r
                                <div style="display:flex;align-items:center;gap:5px">\r
                                  \${clubBadge(t.name, 14)}\r
                                  <span style="color:\${isMy ? '#34d399' : '#fff'}">\${esc(t.name)}</span>\r
                                </div>\r
                              </td>\r
                              <td style="text-align:center;font-weight:900">\${pts}</td>\r
                              <td style="text-align:center">\${j}</td>\r
                              <td style="text-align:center">\${sg > 0 ? '+' : ''}\${sg}</td>\r
                            </tr>\r
                          \`;\r
                        }).join('')}\r
                      </tbody>\r
                    </table>\r
                  </div>\r
                </div>\r
\r
                <!-- Outros Jogos da Rodada do Estadual -->\r
                \${otherEstFixtures.length > 0 ? \`\r
                  <div style="margin-top:10px">\r
                    <div style="font-size:10px;font-weight:800;color:rgba(255,255,255,0.4);margin-bottom:6px">OUTROS JOGOS DA RODADA</div>\r
                    <div style="display:flex;flex-direction:column;gap:5px">\r
                      \${otherEstFixtures.map(f => \`\r
                        <div style="background:#161324;padding:5px 8px;border-radius:6px;font-size:10px;display:flex;justify-content:space-between;align-items:center">\r
                          <span style="display:flex;align-items:center;gap:4px">\${clubBadge(f.home, 12)} <span>\${esc(f.home)}</span></span>\r
                          <span style="color:rgba(255,255,255,0.4);font-weight:700">\${(f.score || f.result) ? \`\${(f.score || f.result)[0]} - \${(f.score || f.result)[1]}\` : esc(formatDatePtBr(f.isoDate || state.date))}</span>\r
                          <span style="display:flex;align-items:center;gap:4px"><span>\${esc(f.away)}</span> \${clubBadge(f.away, 12)}</span>\r
                        </div>\r
                      \`).join('')}\r
                    </div>\r
                  </div>\r
                \` : ''}\r
\r
                <!-- Link para Tabela Completa do Estadual -->\r
                <div style="text-align:center;margin-top:12px;padding-top:10px;border-top:1px solid rgba(255,255,255,0.06)">\r
                  <button class="btn" id="btnGoToEstadualTableFromCentral" style="background:none;border:none;color:#34d399;font-size:11px;font-weight:800;cursor:pointer">\r
                    Tabela completa do \${esc(stateComp?.name || 'Estadual')} &gt;\r
                  </button>\r
                </div>\r
              \` : isCopaTab ? \`\r
                <!-- CONTEÚDO DA COPA DO BRASIL -->\r
                <!-- Seu Confronto -->\r
                <div style="margin-top:12px;background:#241945;border:1px solid #7c3aed;border-radius:12px;padding:12px">\r
                  <div style="font-size:10px;font-weight:800;color:#c084fc;letter-spacing:0.5px">\${esc(activeCopaPhaseKey.toUpperCase())} • SEU CONFRONTO</div>\r
                  <div style="display:flex;justify-content:space-between;align-items:center;margin-top:8px">\r
                    <div style="display:flex;align-items:center;gap:6px">\r
                      \${clubBadge(myCopaFixture.home, 18)}\r
                      <span style="font-size:12px;font-weight:900;color:#fff">\${esc(myCopaFixture.home)}</span>\r
                    </div>\r
                    <span style="font-size:10px;color:rgba(255,255,255,0.4);font-weight:900">x</span>\r
                    <div style="display:flex;align-items:center;gap:6px">\r
                      <span style="font-size:12px;font-weight:900;color:#fff">\${esc(myCopaFixture.away)}</span>\r
                      \${clubBadge(myCopaFixture.away, 18)}\r
                    </div>\r
                  </div>\r
                  <div style="font-size:9px;color:rgba(255,255,255,0.5);margin-top:6px;text-align:center">\r
                    JOGO ÚNICO • \${esc((myCopaFixture.date || curPhaseObj.dateStr)).toUpperCase()}<br>\r
                    \${copaCountdownHtml}\r
                  </div>\r
                </div>\r
\r
                <!-- Outros Confrontos -->\r
                <div style="margin-top:12px">\r
                  <div style="font-size:10px;font-weight:800;color:rgba(255,255,255,0.4);margin-bottom:8px">OUTROS CONFRONTOS (\${esc(activeCopaPhaseKey)})</div>\r
                  <div style="display:flex;flex-direction:column;gap:6px">\r
                    \${otherCopaFixtures.map(f => \`\r
                      <div style="background:#161324;padding:6px 10px;border-radius:8px;font-size:10px;display:flex;justify-content:space-between;align-items:center">\r
                        <span style="display:flex;align-items:center;gap:5px">\${clubBadge(f.home, 14)} <span>\${esc(f.home)}</span></span>\r
                        <span style="color:rgba(255,255,255,0.4);font-weight:700">\${f.score ? \`\${f.score[0]} - \${f.score[1]}\` : esc(f.date || curPhaseObj.dateStr)}</span>\r
                        <span style="display:flex;align-items:center;gap:5px"><span>\${esc(f.away)}</span> \${clubBadge(f.away, 14)}</span>\r
                      </div>\r
                    \`).join('')}\r
                  </div>\r
                </div>\r
\r
                <!-- Link para Tabela e Chaveamento Completo da Copa -->\r
                <div style="text-align:center;margin-top:12px;padding-top:10px;border-top:1px solid rgba(255,255,255,0.06)">\r
                  <button class="btn" id="btnGoToCopaTableFromCentral" style="background:none;border:none;color:#c084fc;font-size:11px;font-weight:800;cursor:pointer">\r
                    Chaveamento completo da Copa do Brasil &gt;\r
                  </button>\r
                </div>\r
              \` : \`\r
                <!-- CONTEÚDO DO TORNEIO CONTINENTAL (LIBERTADORES / SUL-AMERICANA) -->\r
                <!-- Seu Confronto -->\r
                <div style="margin-top:12px;background:#2b2014;border:1px solid #f59e0b;border-radius:12px;padding:12px">\r
                  <div style="font-size:10px;font-weight:800;color:#facc15;letter-spacing:0.5px">GRUPO \${userLibGroup} • SEU CONFRONTO</div>\r
                  <div style="display:flex;justify-content:space-between;align-items:center;margin-top:8px">\r
                    <div style="display:flex;align-items:center;gap:6px">\r
                      \${clubBadge(myLibFixture.home, 18)}\r
                      <span style="font-size:12px;font-weight:900;color:#fff">\${esc(myLibFixture.home)}</span>\r
                    </div>\r
                    <span style="font-size:10px;color:rgba(255,255,255,0.4);font-weight:900">x</span>\r
                    <div style="display:flex;align-items:center;gap:6px">\r
                      <span style="font-size:12px;font-weight:900;color:#fff">\${esc(myLibFixture.away)}</span>\r
                      \${clubBadge(myLibFixture.away, 18)}\r
                    </div>\r
                  </div>\r
                  <div style="font-size:9px;color:rgba(255,255,255,0.5);margin-top:6px;text-align:center">\r
                    RODADA \${myLibFixture.round || 1} • \${esc(formatDatePtBr(myLibFixture.date)).toUpperCase()}<br>\r
                    \${libCountdownHtml}\r
                  </div>\r
                </div>\r
\r
                <!-- Tabela de Classificação do Grupo -->\r
                <div style="margin-top:12px">\r
                  <div style="font-size:10px;font-weight:800;color:rgba(255,255,255,0.4);margin-bottom:8px">CLASSIFICAÇÃO • GRUPO \${userLibGroup}</div>\r
                  <div class="tablewrap" style="max-height:160px">\r
                    <table style="width:100%;font-size:10px">\r
                      <thead>\r
                        <tr style="color:rgba(255,255,255,0.4)">\r
                          <th>#</th>\r
                          <th>CLUBE</th>\r
                          <th style="text-align:center">P</th>\r
                          <th style="text-align:center">J</th>\r
                          <th style="text-align:center">SG</th>\r
                        </tr>\r
                      </thead>\r
                      <tbody>\r
                        \${continentalGroupStandings.map((t, idx) => {\r
                          const pos = idx + 1;\r
                          const isMy = norm(t.name) === norm(state.club);\r
                          const pts = Number(t.points ?? t.p ?? 0);\r
                          const j = Number(t.played ?? t.j ?? 0);\r
                          const sg = Number((t.gf ?? 0) - (t.ga ?? 0));\r
                          return \`\r
                            <tr style="\${isMy ? 'background:rgba(245,158,11,0.25);font-weight:900;' : ''}font-size:10px">\r
                              <td style="font-weight:800;color:\${pos <= 2 ? '#4ade80' : '#fff'}">\${pos}</td>\r
                              <td>\r
                                <div style="display:flex;align-items:center;gap:5px">\r
                                  \${clubBadge(t.name, 14)}\r
                                  <span style="color:\${isMy ? '#facc15' : '#fff'}">\${esc(t.name)}</span>\r
                                </div>\r
                              </td>\r
                              <td style="text-align:center;font-weight:900">\${pts}</td>\r
                              <td style="text-align:center">\${j}</td>\r
                              <td style="text-align:center">\${sg > 0 ? '+' : ''}\${sg}</td>\r
                            </tr>\r
                          \`;\r
                        }).join('')}\r
                      </tbody>\r
                    </table>\r
                  </div>\r
                </div>\r
\r
                <!-- Outros Jogos do Grupo -->\r
                \${otherLibFixtures.length > 0 ? \`\r
                  <div style="margin-top:10px">\r
                    <div style="font-size:10px;font-weight:800;color:rgba(255,255,255,0.4);margin-bottom:6px">OUTROS JOGOS DO GRUPO</div>\r
                    <div style="display:flex;flex-direction:column;gap:5px">\r
                      \${otherLibFixtures.map(f => \`\r
                        <div style="background:#161324;padding:5px 8px;border-radius:6px;font-size:10px;display:flex;justify-content:space-between;align-items:center">\r
                          <span style="display:flex;align-items:center;gap:4px">\${clubBadge(f.home, 12)} <span>\${esc(f.home)}</span></span>\r
                          <span style="color:rgba(255,255,255,0.4);font-weight:700">\${f.score ? \`\${f.score[0]} - \${f.score[1]}\` : esc(formatDatePtBr(f.date))}</span>\r
                          <span style="display:flex;align-items:center;gap:4px"><span>\${esc(f.away)}</span> \${clubBadge(f.away, 12)}</span>\r
                        </div>\r
                      \`).join('')}\r
                    </div>\r
                  </div>\r
                \` : ''}\r
\r
                <!-- Link para Tabela Completa da Libertadores -->\r
                <div style="text-align:center;margin-top:12px;padding-top:10px;border-top:1px solid rgba(255,255,255,0.06)">\r
                  <button class="btn" id="btnGoToLibertadoresTableFromCentral" style="background:none;border:none;color:#facc15;font-size:11px;font-weight:800;cursor:pointer">\r
                    Tabela completa e grupos da \${esc(continentalCompName)} &gt;\r
                  </button>\r
                </div>\r
              \`}\r
            </div>\r
          \`;\r
        })()}\r
\r
`;

content = content.substring(0, idxWidget2) + newWidget2Block + content.substring(idxWidget3);
console.log('✅ Widget 2 atualizado na Central.');

// 4. Atualizar o binding dos eventos em bind()
const targetBindCopa = `    const bCentCopa = $('#btnCentralTabCopa');\r
    if(bCentCopa) bCentCopa.onclick = () => {\r
      state.centralCupTab = 'copa';\r
      render();\r
    };\r
    const bCentLib = $('#btnCentralTabLib');\r
    if(bCentLib) bCentLib.onclick = () => {\r
      state.centralCupTab = 'libertadores';\r
      render();\r
    };`;

const newBindCopa = `    $$('.btn-central-cup-tab').forEach(b => {\r
      b.onclick = (e) => {\r
        e.preventDefault();\r
        state.centralCupTab = b.dataset.tabId;\r
        render();\r
      };\r
    });\r
    const bCentEstadual = $('#btnCentralTabEstadual');\r
    if(bCentEstadual) bCentEstadual.onclick = () => {\r
      state.centralCupTab = 'estadual';\r
      render();\r
    };\r
    const bCentCopa = $('#btnCentralTabCopa');\r
    if(bCentCopa) bCentCopa.onclick = () => {\r
      state.centralCupTab = 'copa';\r
      render();\r
    };\r
    const bCentLib = $('#btnCentralTabLib');\r
    if(bCentLib) bCentLib.onclick = () => {\r
      state.centralCupTab = 'libertadores';\r
      render();\r
    };\r
    const bGoEstadual = $('#btnGoToEstadualTableFromCentral');\r
    if(bGoEstadual) bGoEstadual.onclick = () => {\r
      const mShips = (typeof getSavedSeasonMemberships === 'function') ? getSavedSeasonMemberships(state.club) : null;\r
      view = 'calendario';\r
      calendarFilter = mShips?.stateId || 'ALL';\r
      render();\r
    };`;

if (content.includes(targetBindCopa)) {
  content = content.replace(targetBindCopa, newBindCopa);
  console.log('✅ Eventos de alternância de campeonatos vinculados em bind().');
} else {
  // normalizado
  const normC = content.replace(/\r\n/g, '\n');
  const normTarget = targetBindCopa.replace(/\r\n/g, '\n');
  const normNew = newBindCopa.replace(/\r\n/g, '\n');
  if (normC.includes(normTarget)) {
    content = normC.replace(normTarget, normNew).replace(/\n/g, '\r\n');
    console.log('✅ Eventos vinculados em bind() (normalizado).');
  } else {
    console.warn('⚠️ targetBindCopa não localizado em bind()');
  }
}

fs.writeFileSync('js/game.js', content, 'utf8');
console.log('🎉 js/game.js gravado com sucesso!');
