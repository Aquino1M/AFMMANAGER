/**
 * Teste Automatizado: Modal de Ação da Partida no Botão CONTINUAR e Atalhos da Fita (Tarefas)
 */
const assert = require('assert');
const fs = require('fs');

console.log('🧪 Iniciando testes de CONTINUAR, Modal de Partida e Fita de Tarefas...\n');

// 1. Verificação estática dos botões da fita (sm-task-ribbon) em js/game.js
const gameCode = fs.readFileSync('js/game.js', 'utf8');

console.log('1. Verificando labels e data-views da sm-task-ribbon...');
assert(gameCode.includes('data-view="meutime">📋 Meu Time & Tática</button>'), 'Falta atalho Meu Time & Tática');
assert(gameCode.includes('data-view="mercado">🔄 Mercado & Transferências</button>'), 'Falta atalho Mercado & Transferências');
assert(gameCode.includes('data-view="escritorio">🏢 Escritório & Finanças</button>'), 'Falta atalho Escritório & Finanças');
assert(gameCode.includes('data-view="carreira">🎯 Carreira</button>'), 'Falta atalho Carreira');
assert(gameCode.includes('data-view="noticias">📰 Notícias & Mídia</button>'), 'Falta atalho Notícias & Mídia');
assert(!gameCode.includes('data-view="noticias">📰 Relatórios</button>'), 'Ainda existe 📰 Relatórios nos atalhos');
assert(!gameCode.includes('data-view="carreira">🎯 Objetivos</button>'), 'Ainda existe 🎯 Objetivos nos atalhos');
console.log('  ✅ Todos os 5 atalhos da fita têm os nomes e ícones corretos dos menus!');

// 2. Verificação de Botão Unificado Meu Time & Tática (substituindo botões duplicados)
console.log('2. Verificando botão unificado Meu Time & Tática...');
assert(gameCode.includes('<span>📋</span> Meu Time & Tática'), 'Falta <span>📋</span> Meu Time & Tática');
assert(!gameCode.includes('<span>👥</span> Equipa'), 'Ainda existe <span>👥</span> Equipa');
console.log('  ✅ Botão unificado "Meu Time & Tática" verificado com sucesso!');

// 3. Verificação das funções do modal
console.log('3. Verificando presença e exportação de openMatchActionModal e handleHeaderContinueAction...');
assert(gameCode.includes('function openMatchActionModal('), 'openMatchActionModal ausente');
assert(gameCode.includes('function closeMatchActionModal('), 'closeMatchActionModal ausente');
assert(gameCode.includes('function handleHeaderContinueAction('), 'handleHeaderContinueAction ausente');
assert(gameCode.includes('window.openMatchActionModal = openMatchActionModal'), 'openMatchActionModal não exportado para window');
assert(gameCode.includes('window.handleHeaderContinueAction = handleHeaderContinueAction'), 'handleHeaderContinueAction não exportado para window');
console.log('  ✅ Funções do modal e ação do header devidamente definidas e exportadas!');

// 4. Verificação dos botões de ação dentro de openMatchActionModal
console.log('4. Verificando botões no HTML gerado pelo modal...');
assert(gameCode.includes('id="btnMatchModalPlayLive"'), 'Falta botão btnMatchModalPlayLive');
assert(gameCode.includes('▶ JOGAR AO VIVO'), 'Falta texto ▶ JOGAR AO VIVO');
assert(gameCode.includes('id="btnMatchModalSimulate"'), 'Falta botão btnMatchModalSimulate');
assert(gameCode.includes('⚡ SIMULAR'), 'Falta texto ⚡ SIMULAR');
assert(gameCode.includes('id="btnMatchModalPreview"'), 'Falta botão btnMatchModalPreview');
assert(gameCode.includes('📋 PRÉVIA'), 'Falta texto 📋 PRÉVIA');
assert(gameCode.includes('id="btnMatchModalClose"'), 'Falta botão de fechar ✕');
console.log('  ✅ Os 3 botões de ação (JOGAR AO VIVO, SIMULAR, PRÉVIA) e o botão fechar estão presentes!');

// 5. Verificação da amarração do botão #btnHeaderContinue em bind()
console.log('5. Verificando amarração do botão #btnHeaderContinue em bind()...');
assert(gameCode.includes("const btnHeaderCont=$('#btnHeaderContinue'); if(btnHeaderCont) btnHeaderCont.onclick=(e)=>{e.preventDefault();e.stopPropagation();handleHeaderContinueAction();};"), 'Binding do btnHeaderContinue em bind() ausente');
console.log('  ✅ Amarração direta em bind() para #btnHeaderContinue confirmada!');

// 6. Verificação do delegated handler em pwa_and_landscape_enforcer.js
console.log('6. Verificando fallback em pwa_and_landscape_enforcer.js...');
const pwaCode = fs.readFileSync('js/ui/pwa_and_landscape_enforcer.js', 'utf8');
assert(pwaCode.includes('window.handleHeaderContinueAction()'), 'Fallback em pwa_and_landscape_enforcer.js ausente');
console.log('  ✅ Fallback delegado em pwa_and_landscape_enforcer.js confirmado!');

// 7. Simulação DOM para execução de openMatchActionModal
console.log('7. Testando execução funcional simulada do openMatchActionModal...');
const mockDOM = {
  elements: {},
  appended: [],
  createElement(tag) {
    const el = {
      tagName: tag,
      className: '',
      id: '',
      innerHTML: '',
      children: [],
      style: {},
      querySelector(sel) {
        if (sel === '#btnMatchModalPlayLive') return { id: 'btnMatchModalPlayLive', onclick: null };
        if (sel === '#btnMatchModalSimulate') return { id: 'btnMatchModalSimulate', onclick: null };
        if (sel === '#btnMatchModalPreview') return { id: 'btnMatchModalPreview', onclick: null };
        if (sel === '#btnMatchModalClose') return { id: 'btnMatchModalClose', onclick: null };
        if (sel === '#btnMatchModalSquad') return { id: 'btnMatchModalSquad', onclick: null };
        if (sel === '#btnMatchModalTactics') return { id: 'btnMatchModalTactics', onclick: null };
        if (sel === '#matchModalMental') return { id: 'matchModalMental', onchange: null, value: 'Equilibrada' };
        return null;
      },
      remove() {
        const idx = mockDOM.appended.indexOf(this);
        if (idx !== -1) mockDOM.appended.splice(idx, 1);
      }
    };
    return el;
  },
  getElementById(id) {
    return mockDOM.appended.find(el => el.id === id) || null;
  },
  body: {
    appendChild(child) {
      mockDOM.appended.push(child);
    }
  }
};

global.document = mockDOM;
global.window = {};
global.state = {
  club: 'Criciúma',
  manager: 'Aquino',
  date: '2026-02-22',
  season: 2026,
  round: 1,
  competition: 'Campeonato Catarinense',
  formation: '4-3-3',
  mentality: 'Equilibrada',
  squad: [
    { name: 'Goleiro', pos: 'GK', ovr: 72 },
    { name: 'Zagueiro 1', pos: 'CB', ovr: 71 },
    { name: 'Zagueiro 2', pos: 'CB', ovr: 70 },
    { name: 'Lateral E', pos: 'LB', ovr: 69 },
    { name: 'Lateral D', pos: 'RB', ovr: 70 },
    { name: 'Volante', pos: 'DM', ovr: 71 },
    { name: 'Meia 1', pos: 'CM', ovr: 73 },
    { name: 'Meia 2', pos: 'CM', ovr: 72 },
    { name: 'Ponta E', pos: 'LW', ovr: 74 },
    { name: 'Atacante', pos: 'ST', ovr: 75 },
    { name: 'Ponta D', pos: 'RW', ovr: 73 }
  ],
  teams: [
    { name: 'Criciúma', p: 3, sg: 2, gp: 2 },
    { name: 'Chapecoense', p: 3, sg: 1, gp: 2 },
    { name: 'Avaí', p: 0, sg: -1, gp: 1 }
  ]
};

global.esc = (s) => String(s || '');
global.norm = (s) => String(s || '').toLowerCase();
global.formatDatePtBr = (d) => d || '22/02/2026';
global.curComp = () => ({ id: 'bra-est-sc', name: 'Campeonato Catarinense' });
global.overallSquad = () => 72;
global.teamStrengthByName = () => 68;
global.clubByName = (name) => ({ name, stadium: 'Estádio Heriberto Hülse' });
global.getMatchWeather = () => ({ icon: '🌧️', condition: 'Chuva Forte & Gramado Pesado', temp: 21, impact: 'Gramado Pesado', drain: 1.2 });
global.getHeadToHeadRecord = () => ({ winsA: 12, draws: 6, winsB: 6, total: 24 });
global.getCaldeiraoData = () => ({ caldeiraoPercent: 15 });
global.canStartMatch = () => ({ canStart: true, status: 'playable' });
global.getActualCurrentMatch = () => ({
  type: 'estadual',
  competitionName: 'Campeonato Catarinense',
  roundLabel: 'Rodada 2',
  date: '2026-02-22',
  home: 'Santa Catarina',
  away: 'Criciúma',
  opponent: 'Santa Catarina',
  isHome: false,
  fixture: ['Santa Catarina', 'Criciúma']
});
global.save = () => true;
global.render = () => true;
global.toast = (msg) => console.log('  [Toast]', msg);

// Avalia a função openMatchActionModal extraída de js/game.js
const fnExtract = gameCode.match(/function closeMatchActionModal[\s\S]*?window\.handleHeaderContinueAction = handleHeaderContinueAction;/);
assert(fnExtract, 'Não foi possível extrair openMatchActionModal de js/game.js');
eval(fnExtract[0]);

// Executa openMatchActionModal()
openMatchActionModal();

const modalEl = mockDOM.getElementById('appMatchActionModal');
assert(modalEl, 'Modal #appMatchActionModal não foi inserido no DOM');
assert(modalEl.innerHTML.includes('CAMPEONATO CATARINENSE'), 'Título da competição ausente no modal');
assert(modalEl.innerHTML.includes('Santa Catarina'), 'Mandante ausente no modal');
assert(modalEl.innerHTML.includes('Criciúma'), 'Visitante ausente no modal');
assert(modalEl.innerHTML.includes('JOGAR AO VIVO'), 'Botão JOGAR AO VIVO ausente');
assert(modalEl.innerHTML.includes('SIMULAR'), 'Botão SIMULAR ausente');
assert(modalEl.innerHTML.includes('PRÉVIA'), 'Botão PRÉVIA ausente');
assert(modalEl.innerHTML.includes('Chuva Forte &amp; Gramado Pesado') || modalEl.innerHTML.includes('Chuva Forte & Gramado Pesado'), 'Clima ausente no modal');

console.log('  ✅ Modal criado no DOM com dados completos do confronto e os 3 botões de ação!');

// Testa fechamento do modal
closeMatchActionModal();
assert.strictEqual(mockDOM.getElementById('appMatchActionModal'), null, 'Modal ainda presente após closeMatchActionModal()');
console.log('  ✅ Fechamento do modal verificado com sucesso!');

// Testa handleHeaderContinueAction
assert.strictEqual(mockDOM.getElementById('appMatchActionModal'), null, 'Modal deve estar fechado antes');
handleHeaderContinueAction();
assert(mockDOM.getElementById('appMatchActionModal') !== null, 'handleHeaderContinueAction deve abrir o modal no dia do jogo');
console.log('  ✅ handleHeaderContinueAction abriu o modal no dia do jogo!');

console.log('\n🎉 TODOS OS TESTES PASSARAM COM 100% DE SUCESSO!\n');
