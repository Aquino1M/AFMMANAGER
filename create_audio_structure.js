/**
 * ==============================================================================
 * AFM MANAGER 2027 — ESTRUTURAÇÃO FÍSICA E MANIFESTO DE ÁUDIOS
 * Arquivo: create_audio_structure.js
 * Execução: node create_audio_structure.js
 * 
 * Cria automaticamente toda a árvore de pastas em sounds/sfx/ e sounds/crowd/,
 * gera o manifesto sounds_manifest.json e o README.md explicativo.
 * ==============================================================================
 */

const fs = require('fs');
const path = require('path');

console.log('======================================================================');
console.log('🎵 AFM MANAGER 2027 — ESTRUTURAÇÃO DO SISTEMA DE ÁUDIO');
console.log('======================================================================\n');

const ROOT_DIR = __dirname;
const SOUNDS_DIR = path.join(ROOT_DIR, 'sounds');
const SFX_DIR = path.join(SOUNDS_DIR, 'sfx');
const CROWD_DIR = path.join(SOUNDS_DIR, 'crowd');

// 1. Árvore de Diretórios
const DIRECTORIES = [
  SOUNDS_DIR,
  SFX_DIR,
  CROWD_DIR,
  path.join(CROWD_DIR, 'bra_a'),
  path.join(CROWD_DIR, 'bra_b'),
  path.join(CROWD_DIR, 'bra_c'),
  path.join(CROWD_DIR, 'bra_d'),
  path.join(CROWD_DIR, 'arg_1'),
  path.join(CROWD_DIR, 'bra_estaduais')
];

DIRECTORIES.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`📁 Diretório criado: ${path.relative(ROOT_DIR, dir)}`);
  } else {
    console.log(`✓ Diretório existente: ${path.relative(ROOT_DIR, dir)}`);
  }
});

// 2. Manifesto de Áudio Completo com Fontes e Metadados
const SOUNDS_MANIFEST = {
  version: '1.0.0',
  description: 'Catálogo oficial de efeitos sonoros e cantos de torcida do AFM Manager 2027',
  updatedAt: new Date().toISOString(),
  sfx: [
    {
      id: 'whistle_start',
      filename: 'whistle_start.mp3',
      title: 'Apito Inicial / Reinício',
      description: 'Apito do árbitro autorizando o pontapé inicial e reinício de etapas.',
      source: 'Freesound / Wikimedia Commons (CC0)',
      recommendedUrl: 'https://freesound.org/search/?q=referee+whistle+start',
      durationExpected: '0.8s - 1.5s'
    },
    {
      id: 'whistle_foul',
      filename: 'whistle_foul.mp3',
      title: 'Apito de Falta Marcada',
      description: 'Apito curto e firme interrompendo a jogada por infração.',
      source: 'Freesound / Wikimedia Commons (CC0)',
      recommendedUrl: 'https://freesound.org/search/?q=referee+whistle+foul',
      durationExpected: '0.5s - 1.0s'
    },
    {
      id: 'whistle_card',
      filename: 'whistle_card.mp3',
      title: 'Apito de Advertência / Cartão',
      description: 'Apito enfático aplicado junto a cartões amarelos e vermelhos.',
      source: 'Freesound / Wikimedia Commons (CC0)',
      recommendedUrl: 'https://freesound.org/search/?q=referee+whistle+loud',
      durationExpected: '0.8s - 1.2s'
    },
    {
      id: 'whistle_halftime',
      filename: 'whistle_halftime.mp3',
      title: 'Apito de Encerramento do 1º Tempo',
      description: 'Dois silvos longos marcando os 45 minutos regulamentares.',
      source: 'Freesound / Wikimedia Commons (CC0)',
      recommendedUrl: 'https://freesound.org/search/?q=referee+whistle+half+time',
      durationExpected: '1.5s - 2.5s'
    },
    {
      id: 'whistle_end',
      filename: 'whistle_end.mp3',
      title: 'Apito Final de Partida',
      description: 'Três silvos característicos encerrando os 90 minutos de jogo.',
      source: 'Freesound / Wikimedia Commons (CC0)',
      recommendedUrl: 'https://freesound.org/search/?q=referee+whistle+match+end',
      durationExpected: '2.0s - 3.5s'
    },
    {
      id: 'goal_celebration',
      filename: 'goal_celebration.mp3',
      title: 'Explosão de Gol da Torcida',
      description: 'Grito coletivo e explosão ensurdecedora ao estufar a rede.',
      source: 'Freesound / Wikimedia Commons (CC0)',
      recommendedUrl: 'https://freesound.org/search/?q=stadium+goal+cheer',
      durationExpected: '3.0s - 6.0s'
    },
    {
      id: 'goal_post',
      filename: 'goal_post.mp3',
      title: 'Bola no Travessão / Trave',
      description: 'Impacto seco e metálico na trave ou travessão.',
      source: 'Freesound / OpenGameArt (CC0)',
      recommendedUrl: 'https://freesound.org/search/?q=metal+pole+impact',
      durationExpected: '0.6s - 1.2s'
    },
    {
      id: 'crowd_gasp',
      filename: 'crowd_gasp.mp3',
      title: 'Suspiro / Reação de Perigo',
      description: 'Reação de quase gol e espanto da torcida em finalizações perigosas.',
      source: 'Freesound / Wikimedia Commons (CC0)',
      recommendedUrl: 'https://freesound.org/search/?q=crowd+gasp+stadium',
      durationExpected: '1.0s - 2.0s'
    }
  ],
  crowdAmbientDefault: {
    filename: 'ambient_default.mp3',
    relativePath: 'sounds/crowd/ambient_default.mp3',
    title: 'Murmúrio Neutro de Estádio',
    description: 'Som ambiente contínuo de arquibancada com palmas e murmúrio suave.',
    source: 'Wikimedia Commons / Freesound (CC-BY / CC0)',
    recommendedUrl: 'https://commons.wikimedia.org/wiki/Category:Football_crowd_noise'
  },
  crowdClubs: {
    bra_a: [
      { club: 'Flamengo', slug: 'flamengo', filename: 'flamengo.mp3', chant: 'Mengo! / Em Dezembro de 81' },
      { club: 'Palmeiras', slug: 'palmeiras', filename: 'palmeiras.mp3', chant: 'Dá-lhe Palmeiras / Quando surge o Alviverde' },
      { club: 'Corinthians', slug: 'corinthians', filename: 'corinthians.mp3', chant: 'Aqui tem um bando de loucos' },
      { club: 'São Paulo', slug: 'sao_paulo', filename: 'sao_paulo.mp3', chant: 'Como eu te amo Tricolor' },
      { club: 'Vasco', slug: 'vasco', filename: 'vasco.mp3', chant: 'Camisas Negras / Vamos cantar de coração' },
      { club: 'Santos', slug: 'santos', filename: 'santos.mp3', chant: 'Santos, Santos, gol!' },
      { club: 'Fluminense', slug: 'fluminense', filename: 'fluminense.mp3', chant: 'Sou Tricolor de Coração' },
      { club: 'Grêmio', slug: 'gremio', filename: 'gremio.mp3', chant: 'Até a pé nós iremos' },
      { club: 'Internacional', slug: 'internacional', filename: 'internacional.mp3', chant: 'Glória do desporto nacional / Vamo Inter' },
      { club: 'Cruzeiro', slug: 'cruzeiro', filename: 'cruzeiro.mp3', chant: 'Existe um grande clube na cidade' },
      { club: 'Atlético-MG', slug: 'atletico_mg', filename: 'atletico_mg.mp3', chant: 'Galo Forte e Vingador' },
      { club: 'Bahia', slug: 'bahia', filename: 'bahia.mp3', chant: 'Bora Bahêa Minha Porra!' },
      { club: 'Botafogo', slug: 'botafogo', filename: 'botafogo.mp3', chant: 'Não se compara / Fogo eu te amo' },
      { club: 'Athletico-PR', slug: 'athletico_pr', filename: 'athletico_pr.mp3', chant: 'Furacão, Furacão!' },
      { club: 'Fortaleza', slug: 'fortaleza', filename: 'fortaleza.mp3', chant: 'Laion / Meu coração de Leão' },
      { club: 'Ceará', slug: 'ceara', filename: 'ceara.mp3', chant: 'Vozão, meu eterno amor' }
    ],
    bra_b: [
      { club: 'Goiás', slug: 'goias', filename: 'goias.mp3', chant: 'Eu sou Esmeraldino' },
      { club: 'Sport', slug: 'sport', filename: 'sport.mp3', chant: 'Cazá Cazá!' },
      { club: 'América-MG', slug: 'america_mg', filename: 'america_mg.mp3', chant: 'Coelho de Minas' },
      { club: 'Coritiba', slug: 'coritiba', filename: 'coritiba.mp3', chant: 'Coxa Branca' },
      { club: 'Vila Nova', slug: 'vila_nova', filename: 'vila_nova.mp3', chant: 'Tigrão da Vila' },
      { club: 'Ponte Preta', slug: 'ponte_preta', filename: 'ponte_preta.mp3', chant: 'Macaca Querida' }
    ],
    arg_1: [
      { club: 'River Plate', slug: 'river_plate', filename: 'river_plate.mp3', chant: 'Soy de River Plate' },
      { club: 'Boca Juniors', slug: 'boca_juniors', filename: 'boca_juniors.mp3', chant: 'Boca de mi vida / Dale Bo' },
      { club: 'Racing Club', slug: 'racing_club', filename: 'racing_club.mp3', chant: 'La Academia' },
      { club: 'Independiente', slug: 'independiente', filename: 'independiente.mp3', chant: 'Rey de Copas' }
    ]
  }
};

const MANIFEST_PATH = path.join(SOUNDS_DIR, 'sounds_manifest.json');
fs.writeFileSync(MANIFEST_PATH, JSON.stringify(SOUNDS_MANIFEST, null, 2), 'utf8');
console.log(`\n📄 Manifesto gerado com sucesso: sounds/sounds_manifest.json`);

// 3. README.md com Instruções Claras
const README_CONTENT = `# 🏟️ Sistema de Áudio & Cantos de Torcida — AFM Manager 2027

Este diretório contém a infraestrutura sonora oficial do AFM Manager, operando em **canais desacoplados**:
1. **Canal SFX (\`sounds/sfx/\`)**: Efeitos do motor de partida (apitos de arbitragem, bola na trave, explosão de gol e reações).
2. **Canal Ambient (\`sounds/crowd/\`)**: Áudios reais de estádio e cantos das torcidas por liga e clube.

---

## 📁 Estrutura de Diretórios

\`\`\`
sounds/
├── sounds_manifest.json          (Manifesto completo com links e metadados)
├── sfx/                          [Efeitos da partida]
│   ├── whistle_start.mp3         (Apito inicial / reinício)
│   ├── whistle_foul.mp3          (Apito de falta)
│   ├── whistle_card.mp3          (Apito com aplicação de cartão)
│   ├── whistle_halftime.mp3      (Apito de fim do primeiro tempo)
│   ├── whistle_end.mp3           (Apito final dos 90 minutos)
│   ├── goal_celebration.mp3      (Comemoração e explosão de gol)
│   ├── goal_post.mp3             (Bola na trave ou travessão)
│   └── crowd_gasp.mp3            (Reação de perigo / quase gol)
└── crowd/                        [Áudios de Torcida]
    ├── ambient_default.mp3       (Som neutro de caldeirão / fallback)
    ├── bra_a/                    (Série A: flamengo.mp3, palmeiras.mp3, etc.)
    ├── bra_b/                    (Série B: sport.mp3, ceara.mp3, etc.)
    ├── bra_c/                    (Série C: nautico.mp3, paysandu.mp3, etc.)
    ├── bra_d/                    (Série D: brasiliense.mp3, gama.mp3, etc.)
    ├── arg_1/                    (Argentina: boca_juniors.mp3, river_plate.mp3, etc.)
    └── bra_estaduais/            (Estaduais: real_brasilia.mp3, etc.)
\`\`\`

---

## 🛡️ Fallback Automático & Síntese Procedural (Zero Travamentos)

O motor de áudio (\`js/core/audio_engine.js\` - \`window.AFMAudioManager\`) opera com **resiliência tripla**:
1. Se o clube mandante possuir arquivo específico em \`sounds/crowd/<liga>/<clube>.mp3\`, o áudio tocará em loop com volume calibrado.
2. Se o arquivo do clube não existir, o sistema toca \`sounds/crowd/ambient_default.mp3\`.
3. Se o usuário estiver executando o jogo sem arquivos locais baixados, a **Web Audio API** sintetiza em tempo real apitos precisos (Fox 40), ruídos de estádio e impactos metálicos proceduralmente, sem gerar nenhum erro de console!

---

## 🔗 Onde Baixar Sons Livres de Royalties?

Consulte o arquivo \`sounds_manifest.json\` para a lista de termos e links recomendados:
- **Freesound.org**: Efeitos sonoros gratuitos com licença CC0 / Creative Commons.
- **Wikimedia Commons**: Gravações históricas de cantos de futebol de domínio público.
- **YouTube Audio Library**: Efeitos e multidões sob licença aberta.
`;

const README_PATH = path.join(SOUNDS_DIR, 'README.md');
fs.writeFileSync(README_PATH, README_CONTENT, 'utf8');
console.log(`📄 Documentação criada: sounds/README.md`);

console.log('\n======================================================================');
console.log('✅ Estrutura de áudio concluída com sucesso!');
console.log('======================================================================\n');
