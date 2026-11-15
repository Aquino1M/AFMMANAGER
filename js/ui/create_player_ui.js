/**
 * AFM MANAGER 2026 / 2027 — MODO CARREIRA JOGADOR (BE A PRO)
 * Interface do Fluxo de Criação do Atleta (Wizard Multietapas com Boneco 3D Interativo, Retratos Jovens e Catálogos Embutidos)
 */

(function(window){
  'use strict';

  function esc(str){
    return String(str ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // =========================================================================
  // 1. CATÁLOGO EMBUTIDO INDESTRUTÍVEL (window.AFM_CREATOR_CATALOG)
  // =========================================================================
  window.AFM_CREATOR_CATALOG = {
    statesCities: {
      "DF": ["Brasília", "Taguatinga", "Ceilândia", "Gama", "Sobradinho"],
      "SP": ["São Paulo", "Santos", "Campinas", "Ribeirão Preto", "Sorocaba", "Bragança Paulista"],
      "RJ": ["Rio de Janeiro", "Niterói", "Volta Redonda", "Nova Iguaçu", "Campos"],
      "MG": ["Belo Horizonte", "Uberlândia", "Juiz de Fora", "Varginha", "Tombos"],
      "RS": ["Porto Alegre", "Caxias do Sul", "Pelotas", "Erechim", "Novo Hamburgo"],
      "PR": ["Curitiba", "Londrina", "Maringá", "Cascavel", "Ponta Grossa"],
      "SC": ["Florianópolis", "Chapecó", "Criciúma", "Joinville", "Brusque"],
      "BA": ["Salvador", "Feira de Santana", "Vitória da Conquista", "Ilhéus", "Juazeiro"],
      "PE": ["Recife", "Caruaru", "Petrolina", "Olinda"],
      "CE": ["Fortaleza", "Juazeiro do Norte", "Sobral"],
      "GO": ["Goiânia", "Aparecida de Goiânia", "Anápolis", "Catalão"],
      "PA": ["Belém", "Santarém", "Marabá"],
      "AM": ["Manaus", "Parintins"],
      "MT": ["Cuiabá", "Várzea Grande", "Rondonópolis"],
      "MS": ["Campo Grande", "Dourados"],
      "ES": ["Vitória", "Vila Velha", "Cariacica"],
      "RN": ["Natal", "Mossoró"],
      "PB": ["João Pessoa", "Campina Grande"],
      "AL": ["Maceió", "Arapiraca"],
      "SE": ["Aracaju", "Itabaiana"],
      "PI": ["Teresina", "Parnaíba"],
      "MA": ["São Luís", "Imperatriz"],
      "TO": ["Palmas", "Araguaína"],
      "RO": ["Porto Velho", "Ji-Paraná"],
      "AC": ["Rio Branco"],
      "AP": ["Macapá"],
      "RR": ["Boa Vista"]
    },

    appearanceOptions: {
      skinTones: [
        { id: "skin_1", label: "Clara Rosada", hex: "#f5cba7", shadow: "#d4a373" },
        { id: "skin_2", label: "Clara Dourada", hex: "#e0ac69", shadow: "#b58347" },
        { id: "skin_3", label: "Morena Clara", hex: "#c68642", shadow: "#8d5524" },
        { id: "skin_4", label: "Morena Média", hex: "#a05e2b", shadow: "#6b3e1b" },
        { id: "skin_5", label: "Negra Retinta", hex: "#6f3f1d", shadow: "#44250f" },
        { id: "skin_6", label: "Negra Profunda", hex: "#4a2912", shadow: "#2a1608" }
      ],
      hairStyles: [
        { id: "fade_quiff", label: "Topete Degradê" },
        { id: "buzzcut", label: "Raspado / Buzzcut" },
        { id: "mohawk", label: "Moicano" },
        { id: "afro", label: "Black Power" },
        { id: "dreads", label: "Tranças / Dreads" },
        { id: "medium_flow", label: "Liso Médio" },
        { id: "samurai", label: "Coque Samurai" },
        { id: "bald", label: "Careca" }
      ],
      hairColors: [
        { id: "hc_black", label: "Preto", hex: "#111827" },
        { id: "hc_darkbrown", label: "Castanho Escuro", hex: "#3f2314" },
        { id: "hc_brown", label: "Castanho Claro", hex: "#6f4518" },
        { id: "hc_blonde", label: "Loiro", hex: "#eab308" },
        { id: "hc_platinum", label: "Nevou / Platinado", hex: "#f8fafc" },
        { id: "hc_red", label: "Ruivo", hex: "#b91c1c" },
        { id: "hc_blue", label: "Azul Neon", hex: "#0284c7" },
        { id: "hc_purple", label: "Roxo Craque", hex: "#7c3aed" }
      ],
      eyeColors: [
        { id: "ec_dark", label: "Castanho Escuro", hex: "#2c1810" },
        { id: "ec_amber", label: "Mel / Âmbar", hex: "#92400e" },
        { id: "ec_green", label: "Verde Esmeralda", hex: "#15803d" },
        { id: "ec_blue", label: "Azul Claro", hex: "#0284c7" },
        { id: "ec_gray", label: "Cinza Aço", hex: "#64748b" },
        { id: "ec_black", label: "Preto Ônix", hex: "#090d16" }
      ],
      faces: [
        { id: "focused", label: "Focado", brow: "normal", mouth: "focused" },
        { id: "smile", label: "Sorriso Maroto", brow: "raised", mouth: "smile" },
        { id: "cocky", label: "Marrento", brow: "cocky", mouth: "smirk" },
        { id: "fierce", label: "Raçudo", brow: "angry", mouth: "grit" },
        { id: "calm", label: "Tranquilo", brow: "soft", mouth: "calm" },
        { id: "captain", label: "Líder Nato", brow: "normal", mouth: "confident" }
      ]
    },

    origins: [
      { id: "terrao", label: "Criado no Terrão", bonusStat: "dribbling", bonusVal: 2, desc: "+2 Drible · Controle absurdo em campo irregular." },
      { id: "futsal", label: "Prodígio do Futsal", bonusStat: "passing", bonusVal: 2, desc: "+2 Passe · Raciocínio rápido em espaço curto." },
      { id: "legacy", label: "Filho de Ex-Atleta", bonusStat: "shooting", bonusVal: 2, desc: "+2 Finalização · Técnica apurada desde criança." },
      { id: "school", label: "Destaque Escolar", bonusStat: "pace", bonusVal: 2, desc: "+2 Velocidade · Explosão física acima da média." }
    ],

    biotypes: {
      "Magro": {
        scaleX: 0.90,
        scaleY: 1.03,
        pros: ["+4 Velocidade & Aceleração", "+3 Agilidade & Drible", "-15% Consumo de Estamina"],
        cons: ["-4 Força Física & Equilíbrio", "-3 Jogo Aéreo / Cabeceio"]
      },
      "Médio": {
        scaleX: 1.0,
        scaleY: 1.0,
        pros: ["+2 Equilíbrio Geral", "+2 Controle de Bola", "Adaptação rápida a qualquer esquema tático"],
        cons: ["Sem bônus extremo de força bruta ou arrancada"]
      },
      "Forte": {
        scaleX: 1.13,
        scaleY: 0.98,
        pros: ["+5 Força Física & Proteção", "+4 Cabeceio & Impulsão", "+2 Potência de Chute"],
        cons: ["-3 Agilidade & Arrancada", "+10% Consumo de Estamina"]
      }
    },

    starterBoots: [
      { id: "boot_classic", name: "Clássica Couro Preto", color: "#111827", stripe: "#94a3b8", bonusLabel: "+1 Passe Curto", stat: "passing" },
      { id: "boot_neon", name: "Velocidade Neon Lime", color: "#84cc16", stripe: "#111827", bonusLabel: "+1 Velocidade", stat: "pace" },
      { id: "boot_crimson", name: "Artilheiro Carmesim", color: "#ef4444", stripe: "#fef08a", bonusLabel: "+1 Finalização", stat: "shooting" },
      { id: "boot_royal", name: "Maestro Azul Royal", color: "#2563eb", stripe: "#38bdf8", bonusLabel: "+1 Drible", stat: "dribbling" }
    ],

    archetypesByPos: {
      "GOL": [
        { id: "gk_reflex", name: "Goleiro de Reflexo", desc: "Defesas à queima-roupa e especialista em pênaltis.", stats: { pace: 32, shooting: 22, passing: 34, dribbling: 30, defending: 42, physical: 38 } },
        { id: "gk_sweeper", name: "Goleiro-Líbero", desc: "Sai bem do gol e inicia contra-ataques rápidos.", stats: { pace: 36, shooting: 25, passing: 40, dribbling: 35, defending: 39, physical: 36 } },
        { id: "gk_wall", name: "Muralha Aérea", desc: "Domina cruzamentos e bolas paradas na área.", stats: { pace: 29, shooting: 22, passing: 32, dribbling: 28, defending: 41, physical: 44 } }
      ],
      "ZAG": [
        { id: "cb_stopper", name: "Xerife de Contenção", desc: "Marcação implacável, desarme firme e jogo aéreo.", stats: { pace: 33, shooting: 25, passing: 31, dribbling: 30, defending: 41, physical: 42 } },
        { id: "cb_ballplaying", name: "Zagueiro Construtor", desc: "Saída de bola limpa e passes longos precisos.", stats: { pace: 35, shooting: 27, passing: 39, dribbling: 35, defending: 39, physical: 37 } },
        { id: "cb_fast", name: "Zagueiro de Cobertura", desc: "Velocidade alta para recuperar bolas nas costas.", stats: { pace: 40, shooting: 24, passing: 33, dribbling: 33, defending: 39, physical: 38 } }
      ],
      "LAT": [
        { id: "fb_offensive", name: "Ala Ofensivo", desc: "Apoia o ataque com velocidade, dribles e cruzamentos.", stats: { pace: 41, shooting: 31, passing: 37, dribbling: 38, defending: 34, physical: 34 } },
        { id: "fb_defensive", name: "Lateral Defensivo", desc: "Fecha o corredor e neutraliza pontas rápidos.", stats: { pace: 37, shooting: 27, passing: 34, dribbling: 33, defending: 40, physical: 38 } },
        { id: "fb_inverted", name: "Lateral Construtor", desc: "Entra por dentro para armar o jogo no meio-campo.", stats: { pace: 36, shooting: 30, passing: 40, dribbling: 38, defending: 36, physical: 34 } }
      ],
      "VOL": [
        { id: "cdm_destroyer", name: "Cão de Guarda", desc: "Interceptações, desarmes e proteção total à zaga.", stats: { pace: 34, shooting: 28, passing: 35, dribbling: 33, defending: 41, physical: 41 } },
        { id: "cdm_regista", name: "Primeiro Volante Armador", desc: "Dita o ritmo do jogo com lançamentos e visão.", stats: { pace: 33, shooting: 31, passing: 42, dribbling: 37, defending: 37, physical: 35 } },
        { id: "cdm_box", name: "Volante Box-to-Box", desc: "Fôlego incansável para defender e pisar na área.", stats: { pace: 37, shooting: 34, passing: 37, dribbling: 36, defending: 37, physical: 39 } }
      ],
      "MEI": [
        { id: "cam_maestro", name: "Camisa 10 Clássico", desc: "Passes decisivos, visão de jogo e bolas paradas.", stats: { pace: 34, shooting: 37, passing: 43, dribbling: 41, defending: 26, physical: 31 } },
        { id: "cam_shadow", name: "Segundo Atacante", desc: "Infiltra na área para finalizar e criar tabelas.", stats: { pace: 38, shooting: 40, passing: 37, dribbling: 40, defending: 25, physical: 32 } },
        { id: "cam_dribbler", name: "Meia Driblador", desc: "Quebra linhas no 1x1 com agilidade e condução curta.", stats: { pace: 39, shooting: 35, passing: 38, dribbling: 44, defending: 25, physical: 30 } }
      ],
      "PON": [
        { id: "rw_speedster", name: "Ponta Velocista", desc: "Explosão pura na linha de fundo e contra-ataques letais.", stats: { pace: 44, shooting: 36, passing: 35, dribbling: 41, defending: 24, physical: 31 } },
        { id: "rw_inside", name: "Ponta Corta-pra-Dentro", desc: "Corta para o pé bom e busca finalizações colocadas.", stats: { pace: 40, shooting: 41, passing: 36, dribbling: 42, defending: 24, physical: 31 } },
        { id: "rw_playmaker", name: "Ponta Criador", desc: "Especialista em assistências, cruzamentos e drible curto.", stats: { pace: 39, shooting: 35, passing: 41, dribbling: 42, defending: 26, physical: 30 } }
      ],
      "ATA": [
        { id: "st_poacher", name: "Matador de Área", desc: "Faro de gol, posicionamento e finalização letal.", stats: { pace: 37, shooting: 43, passing: 32, dribbling: 37, defending: 22, physical: 38 } },
        { id: "st_false9", name: "Falso 9 Técnico", desc: "Recua para armar jogadas, driblar e servir os pontas.", stats: { pace: 37, shooting: 38, passing: 40, dribbling: 42, defending: 24, physical: 33 } },
        { id: "st_target", name: "Centroavante Pivô", desc: "Força física, jogo aéreo dominante e proteção de bola.", stats: { pace: 33, shooting: 41, passing: 33, dribbling: 33, defending: 23, physical: 44 } }
      ]
    },

    playstyles: [
      { id: "frieza_letal", name: "Frieza Letal", icon: "❄️", desc: "+5% de conversão de gols cara a cara." },
      { id: "motorzinho", name: "Motorzinho 90 Min", icon: "🔋", desc: "-20% de perda de estamina nas partidas." },
      { id: "visao_raiox", name: "Visão de Raio-X", icon: "👁️", desc: "+5% de chance de passe decisivo virar assistência." },
      { id: "rei_1x1", name: "Rei do 1x1", icon: "⚡", desc: "+5% de sucesso em dribles e quebra de linhas." },
      { id: "muralha_aerea", name: "Muralha Aérea", icon: "🛡️", desc: "+10% em divididas e disputas aéreas de bola." }
    ],

    inspirations: [
      { id: "ronaldo", name: "Ronaldo Fenômeno", perk: "+10% XP em Treino de Finalização", icon: "🇧🇷" },
      { id: "neymar", name: "Neymar Jr", perk: "+10% XP em Treino de Drible / Falta", icon: "⚡" },
      { id: "kaka", name: "Kaká", perk: "+10% XP em Treino de Condução e Arrancada", icon: "🎩" },
      { id: "ronaldinho", name: "Ronaldinho Gaúcho", perk: "+10% XP em Treino de Passe / Criatividade", icon: "🤙" },
      { id: "casemiro", name: "Casemiro", perk: "+10% XP em Treino de Desarme e Físico", icon: "🛡️" },
      { id: "alisson", name: "Alisson Becker", perk: "+10% XP em Treino de Goleiro e Reflexo", icon: "🧤" }
    ],

    tryouts: [
      {
        id: "varzea_local",
        badge: "FÁCIL · BASE REGIONAL",
        icon: "🏘️",
        title: "Peneira de Várzea & Clube Local",
        subtitle: "Clubes Estaduais / Série D · Alta chance de aprovação",
        desc: "Teste aberto na sua cidade natal. Basta participar bem do coletivo de 30 minutos para receber até 3 propostas de times regionais.",
        minRating: 5.5,
        rewardXp: 80,
        salaryRange: "R$ 950 a R$ 1.350/mês",
        tier: "regional"
      },
      {
        id: "estadual_federada",
        badge: "MODERADA · VITRINE ESTADUAL",
        icon: "🏟️",
        title: "Peneira Federada Estadual",
        subtitle: "1ª Divisão Estadual & Série D · Exige Nota 6.5+",
        desc: "Olheiros de clubes tradicionais do seu estado estarão na arquibancada. Marque gol, dê assistência ou mantenha nota acima de 6.5.",
        minRating: 6.5,
        rewardXp: 150,
        salaryRange: "R$ 1.400 a R$ 2.400/mês",
        tier: "state"
      },
      {
        id: "nacional_cb",
        badge: "DIFÍCIL · SÉRIES C E B",
        icon: "⭐",
        title: "Seletiva Nacional Séries C & B",
        subtitle: "Clubes Nacionais · Exige Nota 7.2+ no Coletivo",
        desc: "Peneira altamente disputada com jovens promessas de todo o país. Exige atuação decisiva para conquistar contrato.",
        minRating: 7.2,
        rewardXp: 260,
        salaryRange: "R$ 2.800 a R$ 5.200/mês",
        tier: "national"
      },
      {
        id: "elite_serie_a",
        badge: "EXTREMA · GIGANTES DA SÉRIE A",
        icon: "🔥",
        title: "Peneira de Gigantes (Série A)",
        subtitle: "Clubes da Elite Nacional · Exige Nota 8.0+ (MVP)",
        desc: "Apenas os melhores talentos da base passam. Se brilhar no jogo-treino, você já inicia a carreira na base de um gigante do Brasil!",
        minRating: 8.0,
        rewardXp: 450,
        salaryRange: "R$ 6.000 a R$ 12.000/mês",
        tier: "elite"
      }
    ]
  };

  // =========================================================================
  // 2. GERADOR DINÂMICO DE RETRATOS DE JOVENS ATLETAS (ANTI-404 DATA URI)
  // =========================================================================
  window.generateYoungAthletePortraitUri = function(draft) {
    const cat = window.AFM_CREATOR_CATALOG?.appearanceOptions;
    if(!cat) return "";
    const skinToneId = draft?.skinTone || draft?.appearance?.skinTone || "skin_3";
    const hairColorId = draft?.hairColor || draft?.appearance?.hairColor || "hc_black";
    const eyeColorId = draft?.eyeColor || draft?.appearance?.eyeColor || "ec_dark";
    const hairStyleId = draft?.hairStyle || draft?.appearance?.hairStyle || "fade_quiff";

    const skin = cat.skinTones.find(s => s.id === skinToneId || s.hex === skinToneId) || cat.skinTones[2];
    const hairCol = cat.hairColors.find(h => h.id === hairColorId || h.hex === hairColorId) || cat.hairColors[0];
    const eyeCol = cat.eyeColors.find(e => e.id === eyeColorId || e.hex === eyeColorId) || cat.eyeColors[0];

    const isBald = hairStyleId === "bald" || hairStyleId === "Careca";
    const isAfro = hairStyleId === "afro" || hairStyleId === "Black power";
    const isDreads = hairStyleId === "dreads" || hairStyleId === "Tranças";
    const isMohawk = hairStyleId === "mohawk" || hairStyleId === "Moicano";
    const isSamurai = hairStyleId === "samurai" || hairStyleId === "Coque Samurai";
    const isBuzzcut = hairStyleId === "buzzcut" || hairStyleId === "Raspado";
    const isMediumFlow = hairStyleId === "medium_flow" || hairStyleId === "Franja" || hairStyleId === "Liso Médio";

    let hairSvg = "";
    if(!isBald){
      if(isAfro){
        hairSvg = `<circle cx="50" cy="30" r="26" fill="${hairCol.hex}"/><circle cx="32" cy="36" r="12" fill="${hairCol.hex}"/><circle cx="68" cy="36" r="12" fill="${hairCol.hex}"/>`;
      } else if(isDreads){
        hairSvg = `<path d="M26 36 Q50 10 74 36 L78 64 L71 64 L68 42 L32 42 L29 64 L22 64 Z" fill="${hairCol.hex}"/>`;
      } else if(isMohawk){
        hairSvg = `<path d="M44 14 Q50 8 56 14 L56 36 L44 36 Z" fill="${hairCol.hex}"/><path d="M42 22 L58 22" stroke="${hairCol.hex}" stroke-width="4"/>`;
      } else if(isSamurai){
        hairSvg = `<path d="M30 36 Q50 16 70 36 Z" fill="${hairCol.hex}"/><circle cx="50" cy="14" r="8" fill="${hairCol.hex}"/><rect x="47" y="18" width="6" height="3" fill="#ef4444"/>`;
      } else if(isBuzzcut){
        hairSvg = `<path d="M30 38 Q50 18 70 38 Z" fill="${hairCol.hex}" opacity="0.85"/>`;
      } else if(isMediumFlow){
        hairSvg = `<path d="M26 38 Q50 12 74 38 L76 56 Q66 50 50 50 Q34 50 24 56 Z" fill="${hairCol.hex}"/>`;
      } else { // Topete Degradê / fade_quiff / padrão
        hairSvg = `<path d="M27 38 Q50 12 73 38 Q68 24 50 24 Q32 24 27 38 Z" fill="${hairCol.hex}"/>`;
      }
    }

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <defs>
        <linearGradient id="bg_${skin.id}" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#1e1b4b"/><stop offset="100%" stop-color="#0f172a"/>
        </linearGradient>
      </defs>
      <rect width="100" height="100" fill="url(#bg_${skin.id})"/>
      <circle cx="50" cy="88" r="32" fill="#7c3aed"/>
      <path d="M36 68 L64 68 L68 100 L32 100 Z" fill="#ffffff"/>
      <rect x="43" y="56" width="14" height="16" rx="5" fill="${skin.shadow}"/>
      ${hairSvg}
      <ellipse cx="50" cy="43" rx="18" ry="21" fill="${skin.hex}"/>
      <circle cx="43" cy="42" r="2.3" fill="${eyeCol.hex}"/>
      <circle cx="57" cy="42" r="2.3" fill="${eyeCol.hex}"/>
      <path d="M39 37 Q43 35 47 37 M53 37 Q57 35 61 37" stroke="${hairCol.hex}" stroke-width="1.8" fill="none" stroke-linecap="round"/>
      <path d="M45 52 Q50 56 55 52" stroke="${skin.shadow}" stroke-width="2" fill="none" stroke-linecap="round"/>
    </svg>`;
    return "data:image/svg+xml;utf8," + encodeURIComponent(svg);
  };

  // 12 Promessas Jovens Brasileiras geradas dinamicamente
  const PRESET_YOUTH_ROSTER = [
    { id: "y_01", name: "Joia 1 (Equilibrado)", age: 15, skinTone: "skin_3", hairStyle: "fade_quiff", hairColor: "hc_black", eyeColor: "ec_dark", face: "smile" },
    { id: "y_02", name: "Joia 2 (Velocista)", age: 15, skinTone: "skin_5", hairStyle: "buzzcut", hairColor: "hc_black", eyeColor: "ec_black", face: "focused" },
    { id: "y_03", name: "Joia 3 (Finalizador)", age: 16, skinTone: "skin_4", hairStyle: "afro", hairColor: "hc_black", eyeColor: "ec_dark", face: "fierce" },
    { id: "y_04", name: "Joia 4 (Maestro)", age: 15, skinTone: "skin_2", hairStyle: "medium_flow", hairColor: "hc_brown", eyeColor: "ec_amber", face: "cocky" },
    { id: "y_05", name: "Joia 5 (Xerife)", age: 16, skinTone: "skin_6", hairStyle: "dreads", hairColor: "hc_black", eyeColor: "ec_black", face: "captain" },
    { id: "y_06", name: "Joia 6 (Nevou)", age: 15, skinTone: "skin_1", hairStyle: "fade_quiff", hairColor: "hc_platinum", eyeColor: "ec_blue", face: "smile" },
    { id: "y_07", name: "Joia 7 (Driblador)", age: 15, skinTone: "skin_3", hairStyle: "mohawk", hairColor: "hc_black", eyeColor: "ec_green", face: "cocky" },
    { id: "y_08", name: "Joia 8 (Samurai)", age: 16, skinTone: "skin_2", hairStyle: "samurai", hairColor: "hc_darkbrown", eyeColor: "ec_dark", face: "calm" },
    { id: "y_09", name: "Joia 9 (Artilheiro)", age: 15, skinTone: "skin_4", hairStyle: "buzzcut", hairColor: "hc_blonde", eyeColor: "ec_dark", face: "smile" },
    { id: "y_10", name: "Joia 10 (Craque Roxo)", age: 17, skinTone: "skin_5", hairStyle: "fade_quiff", hairColor: "hc_purple", eyeColor: "ec_dark", face: "fierce" },
    { id: "y_11", name: "Joia 11 (Aspirante)", age: 15, skinTone: "skin_1", hairStyle: "medium_flow", hairColor: "hc_red", eyeColor: "ec_green", face: "focused" },
    { id: "y_12", name: "Joia 12 (Tranças Neon)", age: 16, skinTone: "skin_3", hairStyle: "dreads", hairColor: "hc_blue", eyeColor: "ec_gray", face: "smile" }
  ];

  // Estado temporário completo da criação do jogador
  let wizardState = {
    step: 1, // 1 a 6
    name: 'Carlos Henrique',
    nickname: 'Juninho',
    nationality: 'Brasil',
    shirtNumber: 10,
    stateUf: 'DF',
    city: 'Brasília',
    clubName: 'Brasília',
    origin: 'terrao',
    playstyle: 'frieza_letal',
    inspiration: 'ronaldo',
    appearance: {
      skinTone: 'skin_3',
      hairStyle: 'fade_quiff',
      hairColor: 'hc_black',
      eyeColor: 'ec_dark',
      face: 'smile',
      avatarMode: 'mirror', // 'mirror' | 'preset' | 'upload'
      presetId: 'y_01',
      facePhoto: null,
      customFacePhoto: null,
      starterBoot: 'boot_classic',
      sockStyle: 'Meião baixo'
    },
    height: 1.78,
    bodyBuild: 'Médio',
    preferredFoot: 'Direito',
    position: 'ATA',
    archetype: 'st_poacher',
    pointsAvailable: 5,
    pointsDistributed: {
      pace: 0,
      shooting: 0,
      passing: 0,
      dribbling: 0,
      defending: 0,
      physical: 0
    },
    peneiraTier: 'varzea_local',
    tryoutResult: null,
    rotationYaw: 0, // -180° a 180°
    cameraAngle: 'front' // 'front' | 'threeQuarter' | 'back'
  };

  // Helper para obter cidades de um estado
  function getCitiesForUf(uf){
    const cat = window.AFM_CREATOR_CATALOG.statesCities;
    return cat[uf] || cat['DF'] || ["Brasília"];
  }

  // Helper para obter modificadores de atributos do biotipo
  function getBodyModifiers(height, build){
    const bio = window.AFM_CREATOR_CATALOG.biotypes[build] || window.AFM_CREATOR_CATALOG.biotypes['Médio'];
    let deltaPace = 0, deltaShooting = 0, deltaPassing = 0, deltaDribbling = 0, deltaDefending = 0, deltaPhysical = 0;
    if(build === 'Magro'){
      deltaPace = 4; deltaDribbling = 3; deltaPhysical = -4;
    } else if(build === 'Forte'){
      deltaPhysical = 5; deltaShooting = 2; deltaPace = -3;
    } else {
      deltaPassing = 2; deltaDribbling = 2;
    }
    // Altura: >1.85 penaliza aceleração e bonifica cabeceio/físico
    if(height >= 1.88){
      deltaPhysical += 2; deltaPace -= 2;
    } else if(height <= 1.70){
      deltaPace += 2; deltaDribbling += 1; deltaPhysical -= 1;
    }
    return {
      pace: deltaPace,
      shooting: deltaShooting,
      passing: deltaPassing,
      dribbling: deltaDribbling,
      defending: deltaDefending,
      physical: deltaPhysical,
      pros: bio.pros,
      cons: bio.cons
    };
  }

  // Retorna os atributos totais atuais do atleta
  function getCurrentAttributes(){
    const posArchetypes = window.AFM_CREATOR_CATALOG.archetypesByPos[wizardState.position] || window.AFM_CREATOR_CATALOG.archetypesByPos['ATA'];
    const activeArch = posArchetypes.find(a => a.id === wizardState.archetype) || posArchetypes[0];
    const mods = getBodyModifiers(wizardState.height, wizardState.bodyBuild);
    const originObj = window.AFM_CREATOR_CATALOG.origins.find(o => o.id === wizardState.origin);
    const bootObj = window.AFM_CREATOR_CATALOG.starterBoots.find(b => b.id === wizardState.appearance.starterBoot);
    const dist = wizardState.pointsDistributed;

    const base = activeArch.stats;
    const attrs = {
      pace: Math.max(20, Math.min(99, base.pace + mods.pace + (dist.pace || 0) + (originObj?.bonusStat === 'pace' ? originObj.bonusVal : 0) + (bootObj?.stat === 'pace' ? 1 : 0))),
      shooting: Math.max(20, Math.min(99, base.shooting + mods.shooting + (dist.shooting || 0) + (originObj?.bonusStat === 'shooting' ? originObj.bonusVal : 0) + (bootObj?.stat === 'shooting' ? 1 : 0))),
      passing: Math.max(20, Math.min(99, base.passing + mods.passing + (dist.passing || 0) + (originObj?.bonusStat === 'passing' ? originObj.bonusVal : 0) + (bootObj?.stat === 'passing' ? 1 : 0))),
      dribbling: Math.max(20, Math.min(99, base.dribbling + mods.dribbling + (dist.dribbling || 0) + (originObj?.bonusStat === 'dribbling' ? originObj.bonusVal : 0) + (bootObj?.stat === 'dribbling' ? 1 : 0))),
      defending: Math.max(20, Math.min(99, base.defending + mods.defending + (dist.defending || 0) + (originObj?.bonusStat === 'defending' ? originObj.bonusVal : 0) + (bootObj?.stat === 'defending' ? 1 : 0))),
      physical: Math.max(20, Math.min(99, base.physical + mods.physical + (dist.physical || 0) + (originObj?.bonusStat === 'physical' ? originObj.bonusVal : 0) + (bootObj?.stat === 'physical' ? 1 : 0)))
    };
    return attrs;
  }

  // Calcula o Overall Inicial (calibrado em ~35 OVR)
  function getCurrentOverall(){
    const a = getCurrentAttributes();
    const pos = wizardState.position;
    let weights = { pace: 0.16, shooting: 0.16, passing: 0.16, dribbling: 0.16, defending: 0.16, physical: 0.20 };

    if(pos === 'ATA') weights = { pace: 0.22, shooting: 0.34, passing: 0.10, dribbling: 0.18, defending: 0.04, physical: 0.12 };
    else if(pos === 'PON') weights = { pace: 0.32, shooting: 0.20, passing: 0.16, dribbling: 0.24, defending: 0.03, physical: 0.05 };
    else if(pos === 'MEI') weights = { pace: 0.14, shooting: 0.16, passing: 0.34, dribbling: 0.24, defending: 0.04, physical: 0.08 };
    else if(pos === 'VOL') weights = { pace: 0.14, shooting: 0.08, passing: 0.24, dribbling: 0.14, defending: 0.26, physical: 0.14 };
    else if(pos === 'LAT') weights = { pace: 0.28, shooting: 0.08, passing: 0.20, dribbling: 0.18, defending: 0.16, physical: 0.10 };
    else if(pos === 'ZAG') weights = { pace: 0.16, shooting: 0.04, passing: 0.12, dribbling: 0.08, defending: 0.36, physical: 0.24 };
    else if(pos === 'GOL') weights = { pace: 0.05, shooting: 0.02, passing: 0.15, dribbling: 0.05, defending: 0.45, physical: 0.28 };

    const ovr = Math.round(
      a.pace * weights.pace +
      a.shooting * weights.shooting +
      a.passing * weights.passing +
      a.dribbling * weights.dribbling +
      a.defending * weights.defending +
      a.physical * weights.physical
    );
    return Math.max(30, Math.min(99, ovr));
  }

  // =========================================================================
  // 3. RENDERIZADOR DO BONECO 3D INTERATIVO (360° SVG COM ILUMINAÇÃO NEON)
  // =========================================================================
  function renderInteractive3DMannequinSvg(){
    const yaw = wizardState.rotationYaw || 0;
    const cat = window.AFM_CREATOR_CATALOG.appearanceOptions;
    const skinToneObj = cat.skinTones.find(s => s.id === wizardState.appearance.skinTone || s.hex === wizardState.appearance.skinTone) || cat.skinTones[2];
    const skin = skinToneObj.hex;
    const skinShadow = skinToneObj.shadow;

    const hairColorObj = cat.hairColors.find(h => h.id === wizardState.appearance.hairColor || h.hex === wizardState.appearance.hairColor) || cat.hairColors[0];
    const hair = hairColorObj.hex;

    const eyeColorObj = cat.eyeColors.find(e => e.id === wizardState.appearance.eyeColor || e.hex === wizardState.appearance.eyeColor) || cat.eyeColors[0];
    const eyeColor = eyeColorObj.hex;

    const hairStyle = wizardState.appearance.hairStyle || 'fade_quiff';
    const faceId = wizardState.appearance.face || 'smile';
    const sockStyle = wizardState.appearance.sockStyle || 'Meião baixo';

    const bootObj = window.AFM_CREATOR_CATALOG.starterBoots.find(b => b.id === wizardState.appearance.starterBoot) || window.AFM_CREATOR_CATALOG.starterBoots[0];
    const bootClr = { base: bootObj.color, accent: bootObj.stripe };

    const height = Number(wizardState.height) || 1.78;
    const bodyBuild = wizardState.bodyBuild || 'Médio';
    const bioScale = window.AFM_CREATOR_CATALOG.biotypes[bodyBuild] || { scaleX: 1.0, scaleY: 1.0 };
    const heightScaleY = Math.max(0.86, Math.min(1.15, height / 1.78));

    // Determina o ângulo de visão pelo Yaw
    const normalizedYaw = ((yaw % 360) + 360) % 360; // 0 a 360
    const isBack = normalizedYaw > 120 && normalizedYaw < 240;
    const isThreeQuarter = (normalizedYaw >= 40 && normalizedYaw <= 120) || (normalizedYaw >= 240 && normalizedYaw <= 320);
    const flipSide = normalizedYaw > 180 ? -1 : 1;

    // Dimensões do corpo
    const baseW = 54 * bioScale.scaleX;
    const torsoW = baseW;
    const armW = 16 * bioScale.scaleX;
    const legW = 20 * bioScale.scaleX;
    const shoulderX1 = 120 - (torsoW * 0.72 * flipSide);
    const shoulderX2 = 120 + (torsoW * 0.72 * flipSide);

    // Detalhe de rosto e expressão
    const browD = faceId === 'fierce' ? "M 103 49 L 113 46 M 127 46 L 137 49"
      : faceId === 'cocky' ? "M 103 45 L 113 47 M 127 48 L 137 45"
      : "M 103 46 Q 108 44 113 46 M 127 46 Q 132 44 137 46";

    const mouthSvg = faceId === 'focused' ? `<line x1="113" y1="67" x2="127" y2="67" stroke="#3f2314" stroke-width="2.4" stroke-linecap="round" />`
      : faceId === 'cocky' ? `<path d="M 113 68 Q 120 70 128 64" fill="none" stroke="#3f2314" stroke-width="2.4" stroke-linecap="round" />`
      : faceId === 'fierce' ? `<rect x="113" y="65" width="14" height="4.5" rx="2" fill="#ffffff" stroke="#3f2314" stroke-width="1.2" /><line x1="113" y1="67.2" x2="127" y2="67.2" stroke="#3f2314" stroke-width="0.9" />`
      : `<path d="M 112 65 Q 120 73 128 65" fill="none" stroke="#3f2314" stroke-width="2.4" stroke-linecap="round" />`;

    // Desenha o corte de cabelo
    let hairGeoSvg = "";
    if(hairStyle === 'bald'){
      hairGeoSvg = `<path d="M 95 44 Q 120 30 145 44" fill="none" stroke="${skinShadow}" stroke-width="1.2"/>`;
    } else if(hairStyle === 'buzzcut'){
      hairGeoSvg = `<path d="M 94 44 Q 120 30 146 44 L 146 36 Q 120 26 94 36 Z" fill="${hair}" stroke="#334155" stroke-width="1.2" opacity="0.9"/>`;
    } else if(hairStyle === 'afro'){
      hairGeoSvg = `<path d="M 94 48 Q 88 38 96 30 Q 102 18 120 18 Q 138 18 144 30 Q 152 38 146 48 Z" fill="${hair}" stroke="#1e1b4b" stroke-width="1.5"/><circle cx="100" cy="30" r="8" fill="${hair}"/><circle cx="120" cy="22" r="9" fill="${hair}"/><circle cx="140" cy="30" r="8" fill="${hair}"/>`;
    } else if(hairStyle === 'dreads'){
      hairGeoSvg = `<rect x="94" y="34" width="52" height="12" rx="4" fill="${hair}"/><line x1="102" y1="34" x2="102" y2="58" stroke="${hair}" stroke-width="3" stroke-linecap="round"/><line x1="111" y1="34" x2="111" y2="60" stroke="${hair}" stroke-width="3" stroke-linecap="round"/><line x1="120" y1="34" x2="120" y2="62" stroke="${hair}" stroke-width="3" stroke-linecap="round"/><line x1="129" y1="34" x2="129" y2="60" stroke="${hair}" stroke-width="3" stroke-linecap="round"/><line x1="138" y1="34" x2="138" y2="58" stroke="${hair}" stroke-width="3" stroke-linecap="round"/>`;
    } else if(hairStyle === 'mohawk'){
      hairGeoSvg = `<rect x="111" y="20" width="18" height="26" rx="4" fill="${hair}"/><polygon points="111,38 120,16 129,38" fill="${hair}"/>`;
    } else if(hairStyle === 'samurai'){
      hairGeoSvg = `<rect x="94" y="36" width="52" height="16" rx="4" fill="${hair}"/><circle cx="120" cy="22" r="9" fill="${hair}"/><rect x="116" y="27" width="8" height="4" rx="2" fill="#ef4444"/>`;
    } else if(hairStyle === 'medium_flow'){
      hairGeoSvg = `<rect x="94" y="34" width="52" height="10" rx="3" fill="${hair}"/><path d="M 94 36 Q 110 32 136 44 L 132 54 Q 108 42 94 46 Z" fill="${hair}"/>`;
    } else { // fade_quiff / padrão
      hairGeoSvg = `<rect x="94" y="36" width="52" height="10" rx="4" fill="${hair}"/><path d="M 95 38 Q 112 18 135 24 Q 146 28 145 38 Z" fill="${hair}" stroke="#1f2937" stroke-width="0.8"/><path d="M 102 38 Q 120 24 138 32" fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="1.5"/>`;
    }

    const nickname = (wizardState.nickname || wizardState.name || 'JOGADOR').toUpperCase().slice(0, 14);
    const num = wizardState.shirtNumber || 10;

    return `
      <svg width="260" height="300" viewBox="0 0 240 300" xmlns="http://www.w3.org/2000/svg" style="filter:drop-shadow(0 12px 24px rgba(0,0,0,0.6));user-select:none">
        <defs>
          <radialGradient id="stageGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#a855f7" stop-opacity="0.5"/>
            <stop offset="70%" stop-color="#7c3aed" stop-opacity="0.15"/>
            <stop offset="100%" stop-color="transparent" stop-opacity="0"/>
          </radialGradient>
        </defs>

        <!-- PEDESTAL CIRCULAR 3D NEON COM ILUMINAÇÃO VOLUMÉTRICA -->
        <ellipse cx="120" cy="272" rx="96" ry="24" fill="url(#stageGlow)"/>
        <ellipse cx="120" cy="272" rx="88" ry="20" fill="#0d091e" stroke="#a855f7" stroke-width="3"/>
        <ellipse cx="120" cy="272" rx="72" ry="15" fill="none" stroke="#7c3aed" stroke-width="2" stroke-dasharray="6,4"/>

        <!-- BOLA DE FUTEBOL NO PÉ -->
        <circle cx="170" cy="262" r="13" fill="#ffffff" stroke="#111827" stroke-width="2"/>
        <polygon points="170,254 176,259 174,266 166,266 164,259" fill="#111827"/>

        <!-- GRUPO DO ATLETA ESCALADO EM ALTURA E PORTE FÍSICO -->
        <g id="athlete3DModelGroup" transform="translate(120, 260) scale(${bioScale.scaleX}, ${heightScaleY}) translate(-120, -260)">
          
          <!-- PERNA ESQUERDA -->
          <rect x="${120 - legW - 2}" y="180" width="${legW}" height="68" rx="4" fill="${sockStyle === 'Meião baixo' ? skin : '#ffffff'}" stroke="#cbd5e1" stroke-width="1.2" />
          ${sockStyle === 'Meião baixo' ? `
            <rect x="${120 - legW - 2}" y="234" width="${legW}" height="14" fill="#ffffff" stroke="#cbd5e1" stroke-width="1" />
          ` : ''}
          <rect x="${120 - legW - 2}" y="248" width="${legW}" height="14" rx="4" fill="${bootClr.base}" stroke="${bootClr.accent}" stroke-width="1.5" />
          <line x1="${120 - legW}" y1="254" x2="${120 - 4}" y2="254" stroke="${bootClr.accent}" stroke-width="2"/>

          <!-- PERNA DIREITA -->
          <rect x="${120 + 2}" y="180" width="${legW}" height="68" rx="4" fill="${sockStyle === 'Meião baixo' ? skin : '#ffffff'}" stroke="#cbd5e1" stroke-width="1.2" />
          ${sockStyle === 'Meião baixo' ? `
            <rect x="${120 + 2}" y="234" width="${legW}" height="14" fill="#ffffff" stroke="#cbd5e1" stroke-width="1" />
          ` : ''}
          <rect x="${120 + 2}" y="248" width="${legW}" height="14" rx="4" fill="${bootClr.base}" stroke="${bootClr.accent}" stroke-width="1.5" />
          <line x1="${120 + 4}" y1="254" x2="${120 + legW}" y2="254" stroke="${bootClr.accent}" stroke-width="2"/>

          <!-- CALÇÃO ROXO NEON -->
          <rect x="${120 - (torsoW / 2)}" y="142" width="${torsoW}" height="42" rx="4" fill="#7c3aed" stroke="#6d28d9" stroke-width="1.5" />

          <!-- TRONCO / CAMISA DO ATLETA -->
          <polygon points="${shoulderX1},85 ${shoulderX2},85 ${120 + (torsoW / 2)},145 ${120 - (torsoW / 2)},145" fill="#ffffff" stroke="#e2e8f0" stroke-width="2" />

          ${isBack ? `
            <!-- NOME E NÚMERO NAS COSTAS -->
            <text x="120" y="106" font-family="'Segoe UI',system-ui,sans-serif" font-size="9" font-weight="900" fill="#111827" text-anchor="middle" letter-spacing=".5">${esc(nickname)}</text>
            <text x="120" y="133" font-family="'Segoe UI',system-ui,sans-serif" font-size="27" font-weight="900" fill="#111827" text-anchor="middle">${num}</text>
          ` : `
            <!-- DETALHE NO PEITO (ESCUDO / NÚMERO PEQUENO) -->
            <circle cx="106" cy="102" r="5" fill="#7c3aed" />
            <text x="132" y="105" font-family="'Segoe UI',sans-serif" font-size="9" font-weight="900" fill="#7c3aed" text-anchor="middle">${num}</text>
          `}

          <!-- BRAÇO ESQUERDO COM MÃO -->
          <g transform="rotate(${isThreeQuarter ? 18 : 10} ${shoulderX1} 88)">
            <rect x="${shoulderX1 - armW + 2}" y="88" width="${armW}" height="52" rx="4" fill="#ffffff" stroke="#e2e8f0" stroke-width="1.2" />
            <rect x="${shoulderX1 - armW + 3}" y="128" width="${armW - 2}" height="14" rx="2" fill="${skin}" />
            ${sockStyle === 'Munhequeira' ? `<rect x="${shoulderX1 - armW + 1}" y="132" width="${armW + 2}" height="8" rx="2" fill="#7c3aed" />` : ''}
            <circle cx="${shoulderX1 - (armW / 2) + 2}" cy="144" r="${Math.max(5, (armW / 2))}" fill="${skin}" stroke="${skinShadow}" stroke-width="0.8" />
          </g>

          <!-- BRAÇO DIREITO COM MÃO -->
          <g transform="rotate(${isThreeQuarter ? -6 : -10} ${shoulderX2} 88)">
            <rect x="${shoulderX2 - 2}" y="88" width="${armW}" height="52" rx="4" fill="#ffffff" stroke="#e2e8f0" stroke-width="1.2" />
            <rect x="${shoulderX2 - 1}" y="128" width="${armW - 2}" height="14" rx="2" fill="${skin}" />
            ${sockStyle === 'Munhequeira' ? `<rect x="${shoulderX2 - 3}" y="132" width="${armW + 2}" height="8" rx="2" fill="#7c3aed" />` : ''}
            <circle cx="${shoulderX2 + (armW / 2) - 2}" cy="144" r="${Math.max(5, (armW / 2))}" fill="${skin}" stroke="${skinShadow}" stroke-width="0.8" />
          </g>

          <!-- CABEÇA -->
          <rect x="95" y="38" width="50" height="46" rx="6" fill="${skin}" stroke="${skinShadow}" stroke-width="1" />

          ${!isBack ? `
            <!-- OLHOS REALISTAS DO ATLETA (ESCLERA + ÍRIS + PUPILA + BRILHO) -->
            <ellipse cx="108" cy="54" rx="4.5" ry="4" fill="#ffffff" stroke="#334155" stroke-width="0.8" />
            <circle cx="108" cy="54" r="2.8" fill="${eyeColor}" />
            <circle cx="108" cy="54" r="1.5" fill="#000000" />
            <circle cx="109.2" cy="52.8" r="0.8" fill="#ffffff" />

            <ellipse cx="132" cy="54" rx="4.5" ry="4" fill="#ffffff" stroke="#334155" stroke-width="0.8" />
            <circle cx="132" cy="54" r="2.8" fill="${eyeColor}" />
            <circle cx="132" cy="54" r="1.5" fill="#000000" />
            <circle cx="133.2" cy="52.8" r="0.8" fill="#ffffff" />

            <!-- SOBRANCELHAS CONFORME EXPRESSÃO -->
            <path d="${browD}" fill="none" stroke="${hair}" stroke-width="2.2" stroke-linecap="round" />

            <!-- NARIZ DO ATLETA -->
            <path d="M 120 54 L 118 60 L 122 60" fill="none" stroke="${skinShadow}" stroke-width="1.2" stroke-linecap="round" opacity="0.8" />

            <!-- BOCA CONFORME EXPRESSÃO -->
            ${mouthSvg}
          ` : ''}

          <!-- CABELO -->
          ${hairGeoSvg}

        </g>
      </svg>
    `;
  }

  // =========================================================================
  // 4. RENDERIZAÇÃO PRINCIPAL DO CRIADOR
  // =========================================================================
  function renderCreatePlayerScreen(container, activeUser){
    if(!container) container = document.querySelector('#app');
    if(!container) return;

    // Sincroniza foto caso esteja no modo espelho 3D
    if(wizardState.appearance.avatarMode === 'mirror'){
      wizardState.appearance.facePhoto = window.generateYoungAthletePortraitUri(wizardState);
    }

    const currentOvr = getCurrentOverall();
    const nicknameOrName = wizardState.nickname || wizardState.name || 'Seu Jogador';

    container.innerHTML = `
      <div class="afm-player-creator-wrapper" style="min-height:100vh;background:#090d16;color:#fff;font-family:'Segoe UI',system-ui,sans-serif;padding:16px 24px;box-sizing:border-box">
        
        <!-- HEADER SUPERIOR -->
        <header style="display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid rgba(255,255,255,0.08);padding-bottom:16px;margin-bottom:18px">
          <div>
            <div style="display:flex;align-items:center;gap:10px">
              <span class="pill" style="background:#7c3aed;color:#fff;font-size:10px;font-weight:900;padding:2px 8px;border-radius:4px;letter-spacing:0.5px">MODO CARREIRA JOGADOR</span>
              <h1 style="margin:0;font-size:26px;font-weight:900;letter-spacing:1px;text-transform:uppercase">CRIAR MEU ATLETA</h1>
            </div>
            <div style="font-size:13px;color:rgba(255,255,255,0.6);margin-top:4px">
              Aos 15 anos, sem clube e Overall 35. Daqui para a frente é treino diário, jogo-treino e peneira.
            </div>
          </div>
          <div style="display:flex;gap:10px;align-items:center">
            <button type="button" id="btnRollRandomPlayer" class="btn" style="background:rgba(124,58,237,0.2);border:1px solid #a855f7;color:#c084fc;font-size:13px;font-weight:800;padding:8px 16px;border-radius:8px;cursor:pointer">
              ⚡ Gerar Craque Aleatório
            </button>
            <button type="button" id="btnCancelPlayerCreation" class="btn" style="background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.15);color:#fff;font-size:13px;font-weight:700;padding:8px 16px;border-radius:8px;cursor:pointer">
              ✕ Sair para o Menu
            </button>
          </div>
        </header>

        <!-- STEPPER BAR (ETAPAS 1 A 6 COM DATA-STEP E NAVEGAÇÃO LIVRE) -->
        <div class="afm-creator-stepper" style="display:flex;gap:10px;margin-bottom:24px;overflow-x:auto;padding-bottom:8px">
          ${renderStepperPills()}
        </div>

        <!-- GRID PRINCIPAL: COLUNA ESQUERDA (PREVIEW 3D) + COLUNA DIREITA (CONTEÚDO DO PASSO) -->
        <div style="display:grid;grid-template-columns:340px 1fr;gap:24px;align-items:start">
          
          <!-- COLUNA ESQUERDA: PALCO 3D INTERATIVO (360° ARRASTAR E SOLTAR) -->
          <div class="afm-creator-preview-card" style="background:#0f172a;border:1px solid rgba(168,85,247,0.3);border-radius:18px;padding:18px;display:flex;flex-direction:column;align-items:center;position:relative;box-shadow:0 12px 36px rgba(0,0,0,0.6)">
            
            <!-- BADGE OVERALL & TOGGLE DE CÂMERA (FRENTE, 3/4, COSTAS) -->
            <div style="display:flex;justify-content:space-between;align-items:center;width:100%;margin-bottom:12px">
              <div style="background:rgba(0,0,0,0.6);border:1px solid #10b981;border-radius:10px;padding:6px 12px;display:flex;flex-direction:column">
                <span id="previewOvrNumber" style="font-size:22px;font-weight:900;color:#10b981;line-height:1">${currentOvr}</span>
                <span id="previewPosLabel" style="font-size:10px;font-weight:800;color:#94a3b8;letter-spacing:0.5px">${wizardState.position} · OVERALL INICIAL</span>
              </div>
              <div style="display:flex;gap:4px;background:#1e293b;padding:3px;border-radius:8px">
                <button type="button" id="btnCamFront" class="btn-cam ${wizardState.cameraAngle==='front'?'active':''}" style="font-size:11px;font-weight:800;padding:4px 8px;border-radius:6px;border:none;cursor:pointer;background:${wizardState.cameraAngle==='front'?'#7c3aed':'transparent'};color:#fff">Frente</button>
                <button type="button" id="btnCamThreeQuarter" class="btn-cam ${wizardState.cameraAngle==='threeQuarter'?'active':''}" style="font-size:11px;font-weight:800;padding:4px 8px;border-radius:6px;border:none;cursor:pointer;background:${wizardState.cameraAngle==='threeQuarter'?'#7c3aed':'transparent'};color:#fff">3/4</button>
                <button type="button" id="btnCamBack" class="btn-cam ${wizardState.cameraAngle==='back'?'active':''}" style="font-size:11px;font-weight:800;padding:4px 8px;border-radius:6px;border:none;cursor:pointer;background:${wizardState.cameraAngle==='back'?'#7c3aed':'transparent'};color:#fff">Costas</button>
              </div>
            </div>

            <!-- CONTAINER DO BONECO 3D COM ARRASTE 360° -->
            <div id="afmDynamicAvatarContainer" class="afm-avatar-stage" style="width:260px;height:300px;position:relative;display:flex;align-items:center;justify-content:center;margin:6px 0;overflow:hidden;border-radius:16px;touch-action:none;cursor:grab">
              ${renderInteractive3DMannequinSvg()}
            </div>

            <div style="font-size:10px;color:#94a3b8;margin-bottom:12px;text-align:center">
              🔄 Arraste para girar 360°. Rosto, olhos, cabelo, porte e chuteiras atualizam em tempo real.
            </div>

            <!-- CARD COMPACTO DO ATLETA NO RODAPÉ -->
            <div style="width:100%;background:#1e293b;border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:10px 14px;display:flex;align-items:center;gap:12px;box-sizing:border-box">
              <div style="width:48px;height:48px;border-radius:10px;overflow:hidden;background:#334155;border:2px solid #7c3aed;flex-shrink:0">
                <img id="cardFooterPhoto" src="${wizardState.appearance.customFacePhoto || wizardState.appearance.facePhoto || window.generateYoungAthletePortraitUri(wizardState)}" alt="Foto" style="width:100%;height:100%;object-fit:cover">
              </div>
              <div style="flex:1;overflow:hidden">
                <div id="cardFooterName" style="font-size:14px;font-weight:900;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">
                  ${esc(nicknameOrName.toUpperCase())} <span id="cardFooterNum" style="color:#a855f7">#${wizardState.shirtNumber}</span>
                </div>
                <div id="cardFooterInfo" style="font-size:11px;color:#94a3b8;margin-top:2px">
                  ${wizardState.position} · ${wizardState.height.toFixed(2)} m · ${esc(wizardState.city)}/${wizardState.stateUf}
                </div>
              </div>
            </div>

          </div>

          <!-- COLUNA DIREITA: CONTEÚDO DINÂMICO DO PASSO ATUAL -->
          <div class="afm-creator-step-content" style="background:#0f172a;border:1px solid rgba(255,255,255,0.08);border-radius:18px;padding:26px;min-height:520px;display:flex;flex-direction:column;justify-content:space-between;box-shadow:0 12px 36px rgba(0,0,0,0.5)">
            <div>
              ${renderCurrentStepContent()}
            </div>

            <!-- NAVEGAÇÃO DE PASSOS (VOLTAR / AVANÇAR) -->
            <div style="display:flex;justify-content:space-between;align-items:center;border-top:1px solid rgba(255,255,255,0.08);padding-top:20px;margin-top:30px">
              ${wizardState.step > 1 ? `
                <button type="button" id="btnWizardPrev" class="btn" style="background:rgba(255,255,255,0.08);color:#fff;font-weight:800;padding:10px 22px;border-radius:10px;cursor:pointer">
                  ← VOLTAR
                </button>
              ` : `<div></div>`}

              ${wizardState.step < 6 ? `
                <button type="button" id="btnWizardNext" class="btn primary" style="background:linear-gradient(135deg, #7c3aed 0%, #a855f7 100%);color:#fff;font-weight:900;padding:12px 28px;border-radius:10px;cursor:pointer;box-shadow:0 4px 18px rgba(168,85,247,0.4)">
                  AVANÇAR ➔
                </button>
              ` : `
                <div style="display:flex;gap:12px;align-items:center">
                  <button type="button" id="btnPlayTryoutDirect" class="btn warning" style="background:linear-gradient(135deg, #f59e0b 0%, #d97706 100%);color:#000;font-size:14px;font-weight:900;padding:13px 26px;border-radius:12px;cursor:pointer;box-shadow:0 4px 16px rgba(245,158,11,0.4)">
                    ${wizardState.tryoutResult ? '🔄 NOVO JOGO-TREINO' : '⚽ DISPUTAR JOGO-TREINO'}
                  </button>
                  ${wizardState.tryoutResult?.approved ? `
                    <button type="button" id="btnWizardFinish" class="btn success" style="background:linear-gradient(135deg, #10b981 0%, #059669 100%);color:#000;font-size:14px;font-weight:900;padding:13px 28px;border-radius:12px;cursor:pointer;box-shadow:0 4px 20px rgba(16,185,129,0.5)">
                      ✍️ ASSINAR COM O ${esc((wizardState.clubName || wizardState.tryoutResult?.clubName || 'CLUBE').toUpperCase())} ➔
                    </button>
                  ` : ''}
                </div>
              `}
            </div>

          </div>
        </div>

      </div>
    `;

    bindCreatorRootEvents(container, activeUser);
  }

  // Stepper superior com clique direto em data-step
  function renderStepperPills(){
    const steps = [
      { id: 1, label: '1. QUEM É VOCÊ' },
      { id: 2, label: '2. APARÊNCIA' },
      { id: 3, label: '3. CORPO E CHUTEIRA' },
      { id: 4, label: '4. POSIÇÃO' },
      { id: 5, label: '5. PONTOS' },
      { id: 6, label: '6. PENEIRA' }
    ];

    return steps.map(s => {
      const isActive = wizardState.step === s.id;
      const isCompleted = wizardState.step > s.id;
      return `
        <div class="stepper-pill ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}" data-step="${s.id}" style="display:flex;align-items:center;gap:6px;padding:8px 14px;border-bottom:3px solid ${isActive ? '#a855f7' : isCompleted ? '#10b981' : 'transparent'};color:${isActive ? '#fff' : isCompleted ? '#10b981' : '#64748b'};font-size:12px;font-weight:800;white-space:nowrap;cursor:pointer">
          <span>${isCompleted ? '✓' : ''}</span>
          <span>${s.label}</span>
        </div>
      `;
    }).join('');
  }

  function renderCurrentStepContent(){
    switch(wizardState.step){
      case 1: return renderStep1QuemEVoce();
      case 2: return renderStep2Aparencia();
      case 3: return renderStep3CorpoEChuteira();
      case 4: return renderStep4PosicaoEArquetipo();
      case 5: return renderStep5Pontos();
      case 6: return renderStep6Peneira();
      default: return renderStep1QuemEVoce();
    }
  }

  // =========================================================================
  // ETAPA 1: QUEM É VOCÊ (ESTADOS, CIDADES, ORIGEM E INSPIRAÇÃO)
  // =========================================================================
  function renderStep1QuemEVoce(){
    const ufs = Object.keys(window.AFM_CREATOR_CATALOG.statesCities);
    const cities = getCitiesForUf(wizardState.stateUf);
    const origins = window.AFM_CREATOR_CATALOG.origins;
    const inspirations = window.AFM_CREATOR_CATALOG.inspirations;

    return `
      <div>
        <h2 style="font-size:20px;font-weight:900;color:#c084fc;margin:0 0 16px 0">1. QUEM É VOCÊ</h2>
        
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:18px;margin-bottom:18px">
          <div>
            <label style="font-size:11px;font-weight:800;color:#94a3b8;display:block;margin-bottom:6px">NOME COMPLETO</label>
            <input type="text" id="wizInputName" value="${esc(wizardState.name)}" placeholder="Ex.: Carlos Henrique" style="width:100%;background:#1e293b;border:1px solid #334155;border-radius:8px;padding:10px 14px;color:#fff;font-size:13px;box-sizing:border-box">
          </div>
          <div>
            <label style="font-size:11px;font-weight:800;color:#94a3b8;display:block;margin-bottom:6px">APELIDO DE BOLEIRO (opcional)</label>
            <input type="text" id="wizInputNickname" value="${esc(wizardState.nickname)}" placeholder="Ex.: Juninho" style="width:100%;background:#1e293b;border:1px solid #334155;border-radius:8px;padding:10px 14px;color:#fff;font-size:13px;box-sizing:border-box">
          </div>
        </div>

        <div style="display:grid;grid-template-columns:140px 1fr;gap:18px;margin-bottom:18px">
          <div>
            <label style="font-size:11px;font-weight:800;color:#94a3b8;display:block;margin-bottom:6px">NÚMERO DA CAMISA</label>
            <div style="display:inline-flex;align-items:center;gap:8px;background:#1e293b;padding:6px 12px;border-radius:10px;border:1px solid #334155">
              <button type="button" id="btnNumMinus" class="btn" style="background:#334155;color:#fff;width:32px;height:32px;border-radius:6px;font-weight:900;border:none;cursor:pointer">-</button>
              <span id="wizShirtNumVal" style="font-size:16px;font-weight:900;color:#fff;min-width:32px;text-align:center">${wizardState.shirtNumber}</span>
              <button type="button" id="btnNumPlus" class="btn" style="background:#334155;color:#fff;width:32px;height:32px;border-radius:6px;font-weight:900;border:none;cursor:pointer">+</button>
            </div>
          </div>
          <div>
            <label style="font-size:11px;font-weight:800;color:#94a3b8;display:block;margin-bottom:6px">NACIONALIDADE / SELEÇÃO QUE REPRESENTA</label>
            <select id="wizSelectNationality" style="width:100%;background:#1e293b;border:1px solid #334155;border-radius:8px;padding:10px 14px;color:#fff;font-size:13px;box-sizing:border-box">
              <option value="Brasil" ${wizardState.nationality==='Brasil'?'selected':''}>🇧🇷 Brasil</option>
              <option value="Argentina" ${wizardState.nationality==='Argentina'?'selected':''}>🇦🇷 Argentina</option>
              <option value="Portugal" ${wizardState.nationality==='Portugal'?'selected':''}>🇵🇹 Portugal</option>
              <option value="França" ${wizardState.nationality==='França'?'selected':''}>🇫🇷 França</option>
              <option value="Espanha" ${wizardState.nationality==='Espanha'?'selected':''}>🇪🇸 Espanha</option>
              <option value="Itália" ${wizardState.nationality==='Itália'?'selected':''}>🇮🇹 Itália</option>
              <option value="Uruguai" ${wizardState.nationality==='Uruguai'?'selected':''}>🇺🇾 Uruguai</option>
            </select>
          </div>
        </div>

        <!-- ESTADO E CIDADE NATAL (DECIDEM PENEIRAS INICIAIS) -->
        <div style="margin-bottom:20px">
          <label style="font-size:11px;font-weight:800;color:#94a3b8;display:block;margin-bottom:6px">CIDADE & ESTADO ONDE MORA (DECIDE AS PENEIRAS INICIAIS)</label>
          <div style="display:grid;grid-template-columns:140px 1fr;gap:12px;margin-bottom:6px">
            <select id="creatorStateSelect" class="wiz-select-uf" style="background:#1e293b;border:1px solid #334155;border-radius:8px;padding:10px;color:#fff;font-size:13px">
              ${ufs.map(uf => `<option value="${uf}" ${uf === wizardState.stateUf ? 'selected' : ''}>${uf} - Brasil</option>`).join('')}
            </select>
            <select id="creatorCitySelect" class="wiz-select-city" style="background:#1e293b;border:1px solid #334155;border-radius:8px;padding:10px;color:#fff;font-size:13px">
              ${cities.map(c => `<option value="${c}" ${c === wizardState.city ? 'selected' : ''}>${c}</option>`).join('')}
            </select>
          </div>
          <div style="font-size:11px;color:#64748b;line-height:1.4">
            A cidade natal determina a peneira regional inicial ao seu alcance. Clubes das divisões reais respeitam seus campeonatos estaduais e ligas nacionais.
          </div>
        </div>

        <!-- SISTEMA DE ORIGEM / HISTÓRIA NA BASE -->
        <div style="margin-bottom:20px">
          <label style="font-size:11px;font-weight:800;color:#94a3b8;display:block;margin-bottom:8px">ORIGEM DO CRAQUE (HISTÓRIA NA BASE & BÔNUS DE ATRIBUTO)</label>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
            ${origins.map(orig => {
              const isSel = wizardState.origin === orig.id;
              return `
                <div class="origin-card ${isSel ? 'selected' : ''}" data-origin="${orig.id}" style="background:${isSel ? 'linear-gradient(135deg,#1e1b4b,#2e1065)' : '#1e293b'};border:2px solid ${isSel ? '#a855f7' : '#334155'};border-radius:10px;padding:10px 12px;cursor:pointer">
                  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:2px">
                    <span style="font-size:13px;font-weight:900;color:#fff">${orig.label}</span>
                    <span class="pill" style="background:#7c3aed;color:#fff;font-size:9px;font-weight:900">+2 BÔNUS</span>
                  </div>
                  <div style="font-size:11px;color:#cbd5e1">${orig.desc}</div>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- ÍDOLO / INSPIRAÇÃO DE CARREIRA -->
        <div>
          <label style="font-size:11px;font-weight:800;color:#94a3b8;display:block;margin-bottom:8px">ÍDOLO / INSPIRAÇÃO (+10% XP EM TREINOS ESPECÍFICOS)</label>
          <div style="display:grid;grid-template-columns:repeat(3, 1fr);gap:8px">
            ${inspirations.map(insp => {
              const isSel = wizardState.inspiration === insp.id;
              return `
                <div class="inspiration-card ${isSel ? 'selected' : ''}" data-inspiration="${insp.id}" style="background:${isSel ? '#7c3aed' : '#1e293b'};border:1px solid ${isSel ? '#a855f7' : '#334155'};border-radius:8px;padding:8px 10px;cursor:pointer">
                  <div style="display:flex;align-items:center;gap:6px">
                    <span>${insp.icon}</span>
                    <span style="font-size:12px;font-weight:800;color:#fff">${insp.name}</span>
                  </div>
                  <div style="font-size:10px;color:${isSel ? '#f3e8ff' : '#94a3b8'};margin-top:2px">${insp.perk}</div>
                </div>
              `;
            }).join('')}
          </div>
        </div>

      </div>
    `;
  }

  // =========================================================================
  // ETAPA 2: APARÊNCIA (PELE, CABELO, COR, OLHOS, BOCA E 12 FOTOS JOVENS)
  // =========================================================================
  function renderStep2Aparencia(){
    const cat = window.AFM_CREATOR_CATALOG.appearanceOptions;

    return `
      <div>
        <h2 style="font-size:20px;font-weight:900;color:#c084fc;margin:0 0 4px 0">2. APARÊNCIA</h2>
        <div style="font-size:12px;color:#94a3b8;margin-bottom:16px">Edite pele, corte, cor do cabelo, olhos e expressão do atleta em tempo real.</div>

        <!-- TOM DE PELE & COR DO CABELO -->
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:18px;margin-bottom:16px">
          <div>
            <label style="font-size:11px;font-weight:800;color:#94a3b8;display:block;margin-bottom:8px">TOM DE PELE</label>
            <div style="display:flex;gap:8px;flex-wrap:wrap">
              ${cat.skinTones.map(s => {
                const isSel = wizardState.appearance.skinTone === s.id;
                return `
                  <div class="swatch-skin ${isSel ? 'selected' : ''}" data-skin="${s.id}" title="${s.label}" style="width:34px;height:34px;border-radius:50%;background:${s.hex};cursor:pointer;border:3px solid ${isSel ? '#a855f7' : 'transparent'};box-shadow:0 2px 6px rgba(0,0,0,0.5)"></div>
                `;
              }).join('')}
            </div>
          </div>
          <div>
            <label style="font-size:11px;font-weight:800;color:#94a3b8;display:block;margin-bottom:8px">COR DO CABELO</label>
            <div style="display:flex;gap:8px;flex-wrap:wrap">
              ${cat.hairColors.map(h => {
                const isSel = wizardState.appearance.hairColor === h.id;
                return `
                  <div class="swatch-hair ${isSel ? 'selected' : ''}" data-hair-color="${h.id}" title="${h.label}" style="width:34px;height:34px;border-radius:50%;background:${h.hex};cursor:pointer;border:3px solid ${isSel ? '#a855f7' : 'transparent'};box-shadow:0 2px 6px rgba(0,0,0,0.5)"></div>
                `;
              }).join('')}
            </div>
          </div>
        </div>

        <!-- ESTILO DE CABELO (8 CORTES) -->
        <div style="margin-bottom:16px">
          <label style="font-size:11px;font-weight:800;color:#94a3b8;display:block;margin-bottom:8px">ESTILO DO CABELO</label>
          <div style="display:flex;gap:6px;flex-wrap:wrap">
            ${cat.hairStyles.map(st => {
              const isSel = wizardState.appearance.hairStyle === st.id;
              return `
                <button type="button" class="btn-hair-style ${isSel ? 'active' : ''}" data-hair="${st.id}" style="background:${isSel ? '#7c3aed' : '#1e293b'};color:#fff;border:1px solid ${isSel ? '#a855f7' : '#334155'};border-radius:8px;padding:6px 12px;font-size:11px;font-weight:800;cursor:pointer">
                  ${st.label}
                </button>
              `;
            }).join('')}
          </div>
        </div>

        <!-- COR DOS OLHOS & EXPRESSÃO DA FACE -->
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:18px;margin-bottom:18px">
          <div>
            <label style="font-size:11px;font-weight:800;color:#94a3b8;display:block;margin-bottom:8px">COR DOS OLHOS</label>
            <div style="display:flex;gap:8px;flex-wrap:wrap">
              ${cat.eyeColors.map(eye => {
                const isSel = wizardState.appearance.eyeColor === eye.id;
                return `
                  <div class="swatch-eye ${isSel ? 'selected' : ''}" data-eye="${eye.id}" title="${eye.label}" style="width:32px;height:32px;border-radius:50%;background:${eye.hex};cursor:pointer;border:3px solid ${isSel ? '#a855f7' : 'transparent'};position:relative;display:flex;align-items:center;justify-content:center">
                    <div style="width:10px;height:10px;border-radius:50%;background:#000;border:1px solid rgba(255,255,255,0.4)"></div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
          <div>
            <label style="font-size:11px;font-weight:800;color:#94a3b8;display:block;margin-bottom:8px">EXPRESSÃO / BOCA</label>
            <div style="display:flex;gap:6px;flex-wrap:wrap">
              ${cat.faces.map(f => {
                const isSel = wizardState.appearance.face === f.id;
                return `
                  <button type="button" class="btn-face ${isSel ? 'active' : ''}" data-face="${f.id}" style="background:${isSel ? '#7c3aed' : '#1e293b'};color:#fff;border:1px solid ${isSel ? '#a855f7' : '#334155'};border-radius:8px;padding:6px 10px;font-size:11px;font-weight:800;cursor:pointer">
                    ${f.label}
                  </button>
                `;
              }).join('')}
            </div>
          </div>
        </div>

        <!-- GALERIA DE 12 FOTOS DE JOGADORES JOVENS (15–17 ANOS) + MODO ESPELHO 3D -->
        <div>
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
            <label style="font-size:11px;font-weight:800;color:#94a3b8">FOTO DE PERFIL JOVEM (SINCRONIZADA OU 12 PROMESSAS)</label>
            <label for="wizFaceUpload" style="font-size:11px;font-weight:800;color:#38bdf8;cursor:pointer;text-decoration:underline">
              📷 Enviar minha foto
            </label>
            <input type="file" id="wizFaceUpload" accept="image/*" style="display:none">
          </div>

          <div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(72px, 1fr));gap:8px">
            <!-- MODO ESPELHO 3D -->
            <div class="face-card-option ${wizardState.appearance.avatarMode === 'mirror' ? 'selected' : ''}" data-mode="mirror" style="border-radius:10px;overflow:hidden;border:2.5px solid ${wizardState.appearance.avatarMode === 'mirror' ? '#a855f7' : 'rgba(255,255,255,0.1)'};cursor:pointer;background:#1e1b4b;aspect-ratio:1;position:relative;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:4px">
              <span style="font-size:22px">🪞</span>
              <span style="font-size:9px;font-weight:900;color:#c084fc;margin-top:2px">Espelho 3D</span>
            </div>

            <!-- 12 PRESETS JOVENS -->
            ${PRESET_YOUTH_ROSTER.map((preset, idx) => {
              const isSel = wizardState.appearance.avatarMode === 'preset' && wizardState.appearance.presetId === preset.id;
              const photoUri = window.generateYoungAthletePortraitUri(preset);
              return `
                <div class="face-card-option ${isSel ? 'selected' : ''}" data-mode="preset" data-preset-id="${preset.id}" data-index="${idx}" style="border-radius:10px;overflow:hidden;border:2.5px solid ${isSel ? '#a855f7' : 'rgba(255,255,255,0.1)'};cursor:pointer;background:#1e293b;aspect-ratio:1;position:relative">
                  <img src="${photoUri}" alt="${preset.name}" style="width:100%;height:100%;object-fit:cover">
                  ${isSel ? `<div style="position:absolute;bottom:2px;right:2px;background:#a855f7;width:14px;height:14px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:900">✓</div>` : ''}
                </div>
              `;
            }).join('')}
          </div>
        </div>

      </div>
    `;
  }

  // =========================================================================
  // ETAPA 3: CORPO E CHUTEIRA (ALTURA, PORTE, VANTAGENS E CHUTEIRAS BÁSICAS)
  // =========================================================================
  function renderStep3CorpoEChuteira(){
    const mods = getBodyModifiers(wizardState.height, wizardState.bodyBuild);
    const starterBoots = window.AFM_CREATOR_CATALOG.starterBoots;

    return `
      <div>
        <h2 style="font-size:20px;font-weight:900;color:#c084fc;margin:0 0 16px 0">3. CORPO E CHUTEIRA</h2>

        <!-- SLIDER DE ALTURA -->
        <div style="margin-bottom:20px">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
            <label style="font-size:11px;font-weight:800;color:#94a3b8">ALTURA DO ATLETA (ATUALIZA O MODELO EM TEMPO REAL)</label>
            <span id="wizHeightVal" style="font-size:15px;font-weight:900;color:#a855f7">${wizardState.height.toFixed(2)} M</span>
          </div>
          <input type="range" id="wizHeightSlider" min="1.55" max="2.05" step="0.01" value="${wizardState.height}" style="width:100%;accent-color:#a855f7;cursor:pointer">
          <div style="display:flex;justify-content:space-between;font-size:10px;color:#64748b;margin-top:2px">
            <span>1,55 m</span>
            <span>1,78 m (Padrão)</span>
            <span>2,05 m</span>
          </div>
        </div>

        <!-- PORTE FÍSICO & PÉ PREFERIDO -->
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:20px">
          <div>
            <label style="font-size:11px;font-weight:800;color:#94a3b8;display:block;margin-bottom:8px">PORTE FÍSICO</label>
            <div style="display:flex;gap:8px">
              ${['Magro', 'Médio', 'Forte'].map(build => {
                const isSel = wizardState.bodyBuild === build;
                return `
                  <button type="button" class="btn-build ${isSel ? 'active' : ''}" data-build="${build}" style="flex:1;background:${isSel ? '#7c3aed' : '#1e293b'};color:#fff;border:1px solid ${isSel ? '#a855f7' : '#334155'};border-radius:8px;padding:8px;font-size:12px;font-weight:800;cursor:pointer">
                    ${build}
                  </button>
                `;
              }).join('')}
            </div>
          </div>
          <div>
            <label style="font-size:11px;font-weight:800;color:#94a3b8;display:block;margin-bottom:8px">PÉ PREFERIDO</label>
            <div style="display:flex;gap:8px">
              ${['Direito', 'Canhoto', 'Ambidestro'].map(foot => {
                const isSel = wizardState.preferredFoot === foot;
                return `
                  <button type="button" class="btn-foot ${isSel ? 'active' : ''}" data-foot="${foot}" style="flex:1;background:${isSel ? '#7c3aed' : '#1e293b'};color:#fff;border:1px solid ${isSel ? '#a855f7' : '#334155'};border-radius:8px;padding:8px;font-size:12px;font-weight:800;cursor:pointer">
                    ${foot}
                  </button>
                `;
              }).join('')}
            </div>
          </div>
        </div>

        <!-- BOX DE VANTAGENS E DESVANTAGENS (2 COLUNAS PREENCHIDAS) -->
        <div style="background:#1e293b;border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:14px;margin-bottom:20px">
          <div style="font-size:11px;font-weight:900;color:#94a3b8;letter-spacing:0.5px;margin-bottom:10px">
            VANTAGENS E DESVANTAGENS DESTE BIOTIPO:
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px">
            <div>
              <div style="font-size:11px;font-weight:800;color:#4ade80;margin-bottom:6px">✅ Vantagens</div>
              <div style="display:flex;flex-direction:column;gap:4px">
                ${mods.pros.map(p => `<div style="font-size:11px;color:#e2e8f0">• ${p}</div>`).join('')}
              </div>
            </div>
            <div>
              <div style="font-size:11px;font-weight:800;color:#f87171;margin-bottom:6px">⚠️ Desvantagens</div>
              <div style="display:flex;flex-direction:column;gap:4px">
                ${mods.cons.map(c => `<div style="font-size:11px;color:#e2e8f0">• ${c}</div>`).join('')}
              </div>
            </div>
          </div>
        </div>

        <!-- MEIÃO E ACESSÓRIOS -->
        <div style="margin-bottom:20px">
          <label style="font-size:11px;font-weight:800;color:#94a3b8;display:block;margin-bottom:8px">MEIÃO E ACESSÓRIOS</label>
          <div style="display:flex;gap:8px">
            ${['Meião alto', 'Meião baixo', 'Munhequeira'].map(acc => {
              const isSel = wizardState.appearance.sockStyle === acc;
              return `
                <button type="button" class="btn-sock ${isSel ? 'active' : ''}" data-sock="${acc}" style="flex:1;background:${isSel ? '#7c3aed' : '#1e293b'};color:#fff;border:1px solid ${isSel ? '#a855f7' : '#334155'};border-radius:8px;padding:8px;font-size:12px;font-weight:800;cursor:pointer">
                  ${acc}
                </button>
              `;
            }).join('')}
          </div>
        </div>

        <!-- CHUTEIRAS BÁSICAS DE ENTRADA (SEM PATROCÍNIO) -->
        <div>
          <label style="font-size:11px;font-weight:800;color:#94a3b8;display:block;margin-bottom:8px">
            CHUTEIRAS BÁSICAS DE ENTRADA (SEM PATROCÍNIO INICIAL):
          </label>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
            ${starterBoots.map(boot => {
              const isSel = wizardState.appearance.starterBoot === boot.id;
              return `
                <div class="boot-card ${isSel ? 'selected' : ''}" data-boot-id="${boot.id}" style="background:${isSel ? 'linear-gradient(135deg,#1e1b4b,#2e1065)' : '#1e293b'};border:2px solid ${isSel ? '#a855f7' : '#334155'};border-radius:12px;padding:12px;cursor:pointer">
                  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
                    <span style="font-size:13px;font-weight:900;color:#fff">${boot.name}</span>
                    <span class="pill" style="background:#7c3aed;color:#fff;font-size:9px;font-weight:800">${boot.bonusLabel}</span>
                  </div>
                  <div style="display:flex;align-items:center;gap:8px">
                    <div style="width:24px;height:24px;border-radius:6px;background:${boot.color};border:2px solid ${boot.stripe}"></div>
                    <span style="font-size:11px;color:#94a3b8">Material Básico de Aspirante</span>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>

      </div>
    `;
  }

  // =========================================================================
  // ETAPA 4: POSIÇÃO & ARQUÉTIPOS (7 POSIÇÕES & 3 ARQUÉTIPOS CADA)
  // =========================================================================
  function renderStep4PosicaoEArquetipo(){
    const positions = ['GOL', 'ZAG', 'LAT', 'VOL', 'MEI', 'PON', 'ATA'];
    const activeArchetypes = window.AFM_CREATOR_CATALOG.archetypesByPos[wizardState.position] || window.AFM_CREATOR_CATALOG.archetypesByPos['ATA'];
    const playstyles = window.AFM_CREATOR_CATALOG.playstyles;

    return `
      <div>
        <h2 style="font-size:20px;font-weight:900;color:#c084fc;margin:0 0 16px 0">4. POSIÇÃO & ARQUÉTIPO</h2>

        <!-- SELEÇÃO DE POSIÇÃO -->
        <div style="margin-bottom:20px">
          <label style="font-size:11px;font-weight:800;color:#94a3b8;display:block;margin-bottom:8px">POSIÇÃO PRINCIPAL EM CAMPO</label>
          <div style="display:flex;gap:8px;flex-wrap:wrap">
            ${positions.map(pos => {
              const isSel = wizardState.position === pos;
              return `
                <button type="button" class="btn-pos ${isSel ? 'active' : ''}" data-pos="${pos}" style="flex:1;min-width:55px;background:${isSel ? '#7c3aed' : '#1e293b'};color:#fff;border:1px solid ${isSel ? '#a855f7' : '#334155'};border-radius:10px;padding:10px;font-size:14px;font-weight:900;cursor:pointer">
                  ${pos}
                </button>
              `;
            }).join('')}
          </div>
        </div>

        <!-- 3 ARQUÉTIPOS DA POSIÇÃO ATIVA -->
        <div style="margin-bottom:20px">
          <label style="font-size:11px;font-weight:800;color:#94a3b8;display:block;margin-bottom:8px">
            ARQUÉTIPO INICIAL (DEFINE OS ATRIBUTOS BASE DE ASPIRANTE ~35 OVR):
          </label>
          <div style="display:grid;grid-template-columns:1fr;gap:10px">
            ${activeArchetypes.map(arch => {
              const isSel = wizardState.archetype === arch.id;
              const s = arch.stats;
              return `
                <div class="arch-card ${isSel ? 'selected' : ''}" data-archetype="${arch.id}" style="background:${isSel ? 'linear-gradient(135deg,#1e1b4b,#2e1065)' : '#1e293b'};border:2px solid ${isSel ? '#a855f7' : '#334155'};border-radius:12px;padding:12px 16px;cursor:pointer">
                  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">
                    <span style="font-size:14px;font-weight:900;color:#fff">${arch.name}</span>
                    <span class="pill" style="background:#7c3aed;color:#fff;font-size:9px;font-weight:900">${wizardState.position}</span>
                  </div>
                  <div style="font-size:11px;color:#94a3b8;margin-bottom:8px">${arch.desc}</div>
                  <div style="display:grid;grid-template-columns:repeat(6, 1fr);gap:6px;font-size:10px;color:#cbd5e1;font-weight:800;text-align:center">
                    <div style="background:rgba(0,0,0,0.3);padding:4px;border-radius:6px">RIT ${s.pace}</div>
                    <div style="background:rgba(0,0,0,0.3);padding:4px;border-radius:6px">FIN ${s.shooting}</div>
                    <div style="background:rgba(0,0,0,0.3);padding:4px;border-radius:6px">PAS ${s.passing}</div>
                    <div style="background:rgba(0,0,0,0.3);padding:4px;border-radius:6px">DRI ${s.dribbling}</div>
                    <div style="background:rgba(0,0,0,0.3);padding:4px;border-radius:6px">DEF ${s.defending}</div>
                    <div style="background:rgba(0,0,0,0.3);padding:4px;border-radius:6px">FIS ${s.physical}</div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- TRAÇO DE DNA / PLAYSTYLE INICIAL -->
        <div>
          <label style="font-size:11px;font-weight:800;color:#94a3b8;display:block;margin-bottom:8px">TRAÇO DE DNA / PLAYSTYLE (ASSINATURA TÉCNICA)</label>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
            ${playstyles.map(ps => {
              const isSel = wizardState.playstyle === ps.id;
              return `
                <div class="playstyle-card ${isSel ? 'selected' : ''}" data-playstyle="${ps.id}" style="background:${isSel ? '#7c3aed' : '#1e293b'};border:1px solid ${isSel ? '#a855f7' : '#334155'};border-radius:8px;padding:8px 12px;cursor:pointer">
                  <div style="display:flex;align-items:center;gap:6px">
                    <span>${ps.icon}</span>
                    <span style="font-size:12px;font-weight:900;color:#fff">${ps.name}</span>
                  </div>
                  <div style="font-size:10px;color:${isSel ? '#f3e8ff' : '#94a3b8'};margin-top:2px">${ps.desc}</div>
                </div>
              `;
            }).join('')}
          </div>
        </div>

      </div>
    `;
  }

  // =========================================================================
  // ETAPA 5: DISTRIBUIÇÃO DE PONTOS, RADAR HEXAGONAL & POTENCIAL AOS 25 ANOS
  // =========================================================================
  function renderStep5Pontos(){
    const attrs = getCurrentAttributes();
    const ovr = getCurrentOverall();
    const potentialMin = Math.min(94, ovr + 48);
    const potentialMax = Math.min(99, ovr + 53);

    const attrDefs = [
      { key: 'pace', label: 'Velocidade & Arranque', desc: 'Aceleração e pique em campo' },
      { key: 'shooting', label: 'Finalização & Chute', desc: 'Pontaria e força do arremate' },
      { key: 'passing', label: 'Passe & Visão de Jogo', desc: 'Precisão em passes curtos e longos' },
      { key: 'dribbling', label: 'Drible & Agilidade', desc: 'Controle de bola e drible curto' },
      { key: 'defending', label: 'Defesa & Desarme', desc: 'Bote limpo e posicionamento' },
      { key: 'physical', label: 'Físico & Resistência', desc: 'Força corporal e fôlego' }
    ];

    // Calcula coordenadas do radar hexagonal
    const maxStat = 60;
    const center = { x: 75, y: 75 };
    const radius = 55;
    const angles = [0, 60, 120, 180, 240, 300].map(deg => (deg - 90) * (Math.PI / 180));
    const statKeys = ['pace', 'shooting', 'passing', 'dribbling', 'defending', 'physical'];
    const points = statKeys.map((k, i) => {
      const val = attrs[k] || 35;
      const r = (val / maxStat) * radius;
      return `${center.x + r * Math.cos(angles[i])},${center.y + r * Math.sin(angles[i])}`;
    }).join(' ');

    return `
      <div>
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
          <div>
            <h2 style="font-size:20px;font-weight:900;color:#c084fc;margin:0">5. DISTRIBUIR PONTOS</h2>
            <div style="font-size:12px;color:#94a3b8;margin-top:2px">Invista seus 5 pontos livres para moldar suas características.</div>
          </div>
          <div style="background:rgba(168,85,247,0.2);border:1px solid #a855f7;border-radius:10px;padding:6px 14px;text-align:right">
            <span style="font-size:11px;font-weight:800;color:#c084fc">PONTOS RESTANTES:</span>
            <div id="wizPointsLeft" style="font-size:20px;font-weight:900;color:#fff">${wizardState.pointsAvailable}</div>
          </div>
        </div>

        <!-- PRESETS RÁPIDOS DE BUILD -->
        <div style="margin-bottom:16px">
          <div style="font-size:10px;font-weight:800;color:#94a3b8;margin-bottom:6px">PRESETS DE DISTRIBUIÇÃO RÁPIDA:</div>
          <div style="display:flex;gap:6px;flex-wrap:wrap">
            <button type="button" class="btn-preset-build" data-preset="speed" style="background:#1e293b;border:1px solid #334155;color:#fff;font-size:11px;font-weight:800;padding:5px 10px;border-radius:6px;cursor:pointer">⚡ Velocista</button>
            <button type="button" class="btn-preset-build" data-preset="finisher" style="background:#1e293b;border:1px solid #334155;color:#fff;font-size:11px;font-weight:800;padding:5px 10px;border-radius:6px;cursor:pointer">🎯 Finalizador</button>
            <button type="button" class="btn-preset-build" data-preset="maestro" style="background:#1e293b;border:1px solid #334155;color:#fff;font-size:11px;font-weight:800;padding:5px 10px;border-radius:6px;cursor:pointer">🧠 Maestro</button>
            <button type="button" class="btn-preset-build" data-preset="balanced" style="background:#1e293b;border:1px solid #334155;color:#fff;font-size:11px;font-weight:800;padding:5px 10px;border-radius:6px;cursor:pointer">⚖️ Equilibrado</button>
            <button type="button" class="btn-preset-build" data-preset="reset" style="background:#334155;border:none;color:#94a3b8;font-size:11px;font-weight:800;padding:5px 10px;border-radius:6px;cursor:pointer">🔄 Resetar</button>
          </div>
        </div>

        <div style="display:grid;grid-template-columns:1fr 180px;gap:20px;align-items:start">
          
          <!-- LISTA DOS 6 ATRIBUTOS COM BOTÕES +/- -->
          <div style="display:flex;flex-direction:column;gap:8px">
            ${attrDefs.map(attr => {
              const totalVal = attrs[attr.key] || 35;
              const addedPoints = wizardState.pointsDistributed[attr.key] || 0;
              return `
                <div style="background:#1e293b;border:1px solid #334155;border-radius:10px;padding:8px 14px;display:flex;align-items:center;justify-content:space-between">
                  <div>
                    <div style="font-size:12px;font-weight:900;color:#fff">${attr.label} ${addedPoints > 0 ? `<span style="color:#a855f7;font-size:11px">(+${addedPoints})</span>` : ''}</div>
                    <div style="font-size:10px;color:#64748b">${attr.desc}</div>
                  </div>
                  <div style="display:flex;align-items:center;gap:10px">
                    <span style="font-size:16px;font-weight:900;color:#10b981;min-width:28px;text-align:center">${totalVal}</span>
                    <div style="display:flex;gap:4px">
                      <button type="button" class="btn-attr-minus btn" data-attr="${attr.key}" style="background:#334155;color:#fff;width:28px;height:28px;border-radius:6px;font-weight:900;border:none;cursor:pointer">-</button>
                      <button type="button" class="btn-attr-plus btn" data-attr="${attr.key}" style="background:#7c3aed;color:#fff;width:28px;height:28px;border-radius:6px;font-weight:900;border:none;cursor:pointer">+</button>
                    </div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>

          <!-- RADAR HEXAGONAL & PROJEÇÃO DE POTENCIAL -->
          <div style="background:#1e293b;border:1px solid #334155;border-radius:12px;padding:12px;display:flex;flex-direction:column;align-items:center;text-align:center">
            <div style="font-size:10px;font-weight:900;color:#a855f7;margin-bottom:4px">RADAR DE ATRIBUTOS</div>
            <svg width="150" height="150" viewBox="0 0 150 150">
              <polygon points="75,20 122,47 122,102 75,130 28,102 28,47" fill="none" stroke="#334155" stroke-width="1.5"/>
              <polygon points="75,47 98,61 98,89 75,102 52,89 52,61" fill="none" stroke="#334155" stroke-dasharray="2,2"/>
              <polygon points="${points}" fill="rgba(168,85,247,0.4)" stroke="#a855f7" stroke-width="2"/>
            </svg>
            <div style="margin-top:10px;padding-top:8px;border-top:1px solid rgba(255,255,255,0.08);width:100%">
              <div style="font-size:9px;color:#94a3b8;font-weight:800">POTENCIAL ESTIMADO (25 ANOS):</div>
              <div style="font-size:14px;font-weight:900;color:#10b981;margin-top:2px">${potentialMin} - ${potentialMax} OVR</div>
              <div style="font-size:10px;color:#cbd5e1">Classe Mundial Promissora</div>
            </div>
          </div>

        </div>

      </div>
    `;
  }

  // =========================================================================
  // ETAPA 6: PENEIRA & JOGO-TREINO (4 DESAFIOS, FICHA PRÉ-TESTE E PROPOSTAS)
  // =========================================================================
  function renderStep6Peneira(){
    const tryouts = window.AFM_CREATOR_CATALOG.tryouts;
    const currentTier = tryouts.find(t => t.id === wizardState.peneiraTier) || tryouts[0];
    const tryout = wizardState.tryoutResult;
    const currentOvr = getCurrentOverall();

    return `
      <div>
        <h2 style="font-size:20px;font-weight:900;color:#c084fc;margin:0 0 4px 0">6. ESCOLHA DA PENEIRA & JOGO-TREINO</h2>
        <div style="font-size:12px;color:#94a3b8;margin-bottom:14px">
          Escolha o nível do desafio para a sua peneira. Ao disputar os 30 minutos de jogo-treino, até 3 clubes farão propostas contratuais!
        </div>

        <!-- INDICADOR DESTACADO DA PENEIRA ATIVA -->
        <div style="background:rgba(124,58,237,0.15);border:1.5px solid #7c3aed;border-radius:12px;padding:12px 16px;margin-bottom:16px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px">
          <div style="display:flex;align-items:center;gap:10px">
            <span style="font-size:24px">${currentTier.icon}</span>
            <div>
              <div style="font-size:10px;font-weight:800;color:#c084fc;text-transform:uppercase">PENEIRA ATUALMENTE MARCADA:</div>
              <div style="font-size:15px;font-weight:900;color:#fff">${esc(currentTier.title)} · <span style="color:#a855f7;font-size:12px">${esc(currentTier.subtitle)}</span></div>
            </div>
          </div>
          <span class="pill" style="background:#10b981;color:#000;font-size:10px;font-weight:900;padding:4px 10px;border-radius:6px">
            ${currentTier.badge}
          </span>
        </div>

        <!-- 4 CARDS DE PENEIRAS (VÁRZEA, ESTADUAL, NACIONAL E ELITE) -->
        <div style="margin-bottom:18px">
          <label style="font-size:11px;font-weight:800;color:#94a3b8;display:block;margin-bottom:8px">
            ESCOLHA O NÍVEL DO DESAFIO (CLIQUE NO CARD PARA ALTERNAR):
          </label>
          <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(210px, 1fr));gap:10px">
            ${tryouts.map(t => {
              const isSel = wizardState.peneiraTier === t.id;
              return `
                <div class="peneira-tier-card ${isSel ? 'selected' : ''}" data-tier="${t.id}" style="background:${isSel ? 'linear-gradient(135deg,#1e1b4b,#2e1065)' : '#1e293b'};border:2px solid ${isSel ? '#a855f7' : '#334155'};border-radius:12px;padding:12px;cursor:pointer;position:relative">
                  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
                    <span style="font-size:20px">${t.icon}</span>
                    <span class="pill" style="background:rgba(255,255,255,0.1);color:#fff;font-size:9px;font-weight:800">${t.badge}</span>
                  </div>
                  <div style="font-size:13px;font-weight:900;color:#fff;margin-bottom:2px">${t.title}</div>
                  <div style="font-size:10px;color:#a855f7;font-weight:700;margin-bottom:6px">${t.subtitle}</div>
                  <div style="font-size:10px;color:#94a3b8;line-height:1.3;margin-bottom:8px">${t.desc}</div>
                  <div style="background:rgba(0,0,0,0.3);border-radius:6px;padding:6px;font-size:10px">
                    <div style="color:#cbd5e1">Faixa: <b style="color:#10b981">${t.salaryRange}</b></div>
                    <div style="color:#cbd5e1">Exige Nota: <b style="color:#fff">${t.minRating.toFixed(1)}+</b></div>
                  </div>
                  <div style="margin-top:8px;text-align:center">
                    <span class="pill" style="background:${isSel ? '#10b981' : 'rgba(255,255,255,0.06)'};color:${isSel ? '#000' : '#94a3b8'};font-size:9px;font-weight:900;padding:3px 8px;border-radius:4px;display:block">
                      ${isSel ? '✓ SELECIONADA' : 'CLIQUE P/ ESCOLHER'}
                    </span>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- FICHA DO ATLETA PRÉ-PENEIRA / RESULTADO DO JOGO-TREINO -->
        ${tryout ? renderTryoutResultsBlock(tryout) : `
          <div style="background:#1e293b;border:2px dashed #7c3aed;border-radius:14px;padding:20px;text-align:center">
            <div style="font-size:36px;margin-bottom:6px">⚽</div>
            <div style="font-size:16px;font-weight:900;color:#fff;margin-bottom:4px">PRONTO PARA O JOGO-TREINO DA ${esc(currentTier.title.toUpperCase())}?</div>
            <div style="font-size:11px;color:#94a3b8;max-width:520px;margin:0 auto 16px auto;line-height:1.4">
              Ao disputar o teste, os olheiros avaliarão seu atleta em 30 minutos de coletivo. Até 3 clubes farão propostas contratuais!
            </div>
            <button type="button" id="btnPlayTryoutDirect" class="btn warning" style="background:linear-gradient(135deg,#f59e0b,#d97706);color:#000;font-size:14px;font-weight:900;padding:12px 28px;border-radius:10px;cursor:pointer;border:none;box-shadow:0 4px 16px rgba(245,158,11,0.4)">
              ⚽ DISPUTAR JOGO-TREINO NA ${esc(currentTier.title.toUpperCase())} ➔
            </button>
          </div>
        `}

      </div>
    `;
  }

  function renderTryoutResultsBlock(tryout){
    const offersList = tryout.clubOffers || [{ clubName: tryout.clubName, wageOffered: tryout.wageOffered, division: tryout.division, squadRole: tryout.squadRole }];

    if(tryout.approved){
      return `
        <div style="background:linear-gradient(135deg, rgba(16,185,129,0.12), rgba(15,23,42,0.95));border:2px solid #10b981;border-radius:16px;padding:18px;box-shadow:0 10px 30px rgba(16,185,129,0.2)">
          <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid rgba(255,255,255,0.1);padding-bottom:12px;margin-bottom:12px">
            <div style="display:flex;align-items:center;gap:12px">
              <span style="font-size:28px">🎉</span>
              <div>
                <div style="font-size:11px;font-weight:900;color:#34d399;text-transform:uppercase">APROVADO COM SUCESSO!</div>
                <div style="font-size:18px;font-weight:900;color:#fff">${offersList.length} Propostas Oficiais na Mesa</div>
              </div>
            </div>
            <div style="text-align:center;background:#0f172a;border:1px solid #10b981;border-radius:10px;padding:6px 14px">
              <span style="font-size:22px;font-weight:900;color:#10b981">${tryout.scoutRating}</span>
              <div style="font-size:8px;color:#94a3b8;font-weight:800">NOTA DO OLHEIRO</div>
            </div>
          </div>

          <div style="background:rgba(0,0,0,0.35);border-radius:8px;padding:10px 12px;margin-bottom:14px;border-left:3px solid #10b981;font-size:11px;color:#e2e8f0">
            <b>Parecer da Base:</b> "${tryout.scoutComment}"
          </div>

          <div style="font-size:11px;font-weight:800;color:#c084fc;margin-bottom:8px">SELECIONE O CLUBE PARA INICIAR SUA CARREIRA:</div>
          <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(200px, 1fr));gap:10px;margin-bottom:14px">
            ${offersList.map(off => {
              const isChosen = (wizardState.clubName === off.clubName);
              return `
                <div class="tryout-club-option-card ${isChosen ? 'chosen' : ''}" data-club="${esc(off.clubName)}" data-wage="${off.wageOffered}" data-role="${esc(off.squadRole || 'Reserva')}" style="background:${isChosen ? 'linear-gradient(135deg, #064e3b, #022c22)' : '#0f172a'};border:2px solid ${isChosen ? '#10b981' : '#334155'};border-radius:12px;padding:12px;cursor:pointer">
                  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">
                    <span class="pill" style="background:${isChosen ? '#10b981' : 'rgba(255,255,255,0.08)'};color:${isChosen ? '#000' : '#94a3b8'};font-size:8px;font-weight:900;padding:2px 6px;border-radius:4px">
                      ${isChosen ? '✓ ESCOLHIDO' : 'CLIQUE P/ ESCOLHER'}
                    </span>
                    <span style="font-size:9px;color:#38bdf8">${esc(off.division)}</span>
                  </div>
                  <div style="font-size:15px;font-weight:900;color:#fff">${esc(off.clubName)}</div>
                  <div style="font-size:13px;font-weight:900;color:#10b981;margin-top:4px">R$ ${(off.wageOffered || 1000).toLocaleString('pt-BR')}/mês</div>
                  <div style="font-size:10px;color:#cbd5e1;margin-top:2px">Papel: <b style="color:#38bdf8">${esc(off.squadRole || 'Reserva')}</b></div>
                </div>
              `;
            }).join('')}
          </div>

          <div style="display:flex;justify-content:space-between;align-items:center">
            <button type="button" id="btnStep6RetryTryout" class="btn" style="background:#1e293b;border:1px solid #334155;color:#cbd5e1;font-size:11px;font-weight:800;padding:8px 16px;border-radius:8px;cursor:pointer">
              🔄 Tentar Outra Peneira
            </button>
            <button type="button" id="btnStep6SignContract" class="btn success" style="background:linear-gradient(135deg,#10b981,#059669);color:#000;font-size:13px;font-weight:900;padding:10px 24px;border-radius:8px;cursor:pointer;border:none">
              ✍️ ASSINAR COM O ${esc((wizardState.clubName || tryout.clubName).toUpperCase())} ➔
            </button>
          </div>
        </div>
      `;
    } else {
      return `
        <div style="background:linear-gradient(135deg, rgba(239,68,68,0.12), rgba(15,23,42,0.95));border:2px solid #ef4444;border-radius:16px;padding:18px">
          <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid rgba(255,255,255,0.1);padding-bottom:12px;margin-bottom:12px">
            <div style="display:flex;align-items:center;gap:12px">
              <span style="font-size:28px">⚠️</span>
              <div>
                <div style="font-size:11px;font-weight:900;color:#f87171;text-transform:uppercase">NÃO FOI DESTA VEZ</div>
                <div style="font-size:16px;font-weight:900;color:#fff">Exigência não atingida no coletivo</div>
              </div>
            </div>
            <div style="text-align:center;background:#0f172a;border:1px solid #ef4444;border-radius:10px;padding:6px 14px">
              <span style="font-size:22px;font-weight:900;color:#ef4444">${tryout.scoutRating}</span>
              <div style="font-size:8px;color:#94a3b8;font-weight:800">NOTA DO OLHEIRO</div>
            </div>
          </div>
          <div style="background:rgba(0,0,0,0.35);border-radius:8px;padding:10px 12px;margin-bottom:14px;border-left:3px solid #ef4444;font-size:11px;color:#cbd5e1">
            "${tryout.scoutComment}"
          </div>
          <div style="display:flex;justify-content:space-between;align-items:center">
            <span style="font-size:11px;color:#94a3b8">Dica: Tente novamente ou dispute a Peneira de Várzea/Estadual.</span>
            <button type="button" id="btnStep6RetryTryout" class="btn warning" style="background:linear-gradient(135deg,#f59e0b,#d97706);color:#000;font-size:12px;font-weight:900;padding:8px 18px;border-radius:8px;cursor:pointer">
              🔄 Disputar Novo Jogo-Treino
            </button>
          </div>
        </div>
      `;
    }
  }

  // =========================================================================
  // 5. DELEGAÇÃO ÚNICA DE EVENTOS NA RAIZ (.afm-player-creator-wrapper)
  // =========================================================================
  function bindCreatorRootEvents(container, activeUser){
    const root = container.querySelector('.afm-player-creator-wrapper');
    if(!root) return;

    // Atualiza apenas a prévia do avatar e o rodapé
    function updateAvatarOnly(){
      const stage = root.querySelector('#afmDynamicAvatarContainer');
      if(stage) stage.innerHTML = renderInteractive3DMannequinSvg();

      const ovrEl = root.querySelector('#previewOvrNumber');
      if(ovrEl) ovrEl.textContent = getCurrentOverall();

      const nickOrName = wizardState.nickname || wizardState.name || 'Seu Jogador';
      const fName = root.querySelector('#cardFooterName');
      if(fName) fName.innerHTML = `${esc(nickOrName.toUpperCase())} <span style="color:#a855f7">#${wizardState.shirtNumber}</span>`;
      const fInfo = root.querySelector('#cardFooterInfo');
      if(fInfo) fInfo.textContent = `${wizardState.position} · ${wizardState.height.toFixed(2)} m · ${wizardState.city}/${wizardState.stateUf}`;

      const fPhoto = root.querySelector('#cardFooterPhoto');
      if(fPhoto){
        if(wizardState.appearance.avatarMode === 'mirror'){
          fPhoto.src = window.generateYoungAthletePortraitUri(wizardState);
        } else if(wizardState.appearance.customFacePhoto){
          fPhoto.src = wizardState.appearance.customFacePhoto;
        } else if(wizardState.appearance.facePhoto){
          fPhoto.src = wizardState.appearance.facePhoto;
        }
      }
    }

    // Interatividade de Arraste 360° com mouse / touch
    const stageEl = root.querySelector('#afmDynamicAvatarContainer');
    if(stageEl){
      let isDragging = false;
      let startX = 0;
      let startYaw = 0;

      const onStart = (clientX) => {
        isDragging = true;
        startX = clientX;
        startYaw = wizardState.rotationYaw || 0;
        stageEl.style.cursor = 'grabbing';
      };

      const onMove = (clientX) => {
        if(!isDragging) return;
        const deltaX = clientX - startX;
        let newYaw = startYaw + (deltaX * 0.9);
        newYaw = ((newYaw % 360) + 360) % 360;
        wizardState.rotationYaw = newYaw;
        updateAvatarOnly();
      };

      const onEnd = () => {
        if(!isDragging) return;
        isDragging = false;
        stageEl.style.cursor = 'grab';
      };

      if(typeof stageEl.addEventListener === 'function'){
        stageEl.addEventListener('mousedown', (e) => onStart(e.clientX));
        stageEl.addEventListener('touchstart', (e) => {
          if(e.touches?.[0]) onStart(e.touches[0].clientX);
        }, { passive: true });
      }
      if(typeof window.addEventListener === 'function'){
        window.addEventListener('mousemove', (e) => onMove(e.clientX));
        window.addEventListener('mouseup', onEnd);
        window.addEventListener('touchmove', (e) => {
          if(e.touches?.[0]) onMove(e.touches[0].clientX);
        }, { passive: true });
        window.addEventListener('touchend', onEnd);
      }
    }

    // Delegação de cliques na raiz
    if(typeof root.addEventListener === 'function'){
      root.addEventListener('click', (e) => {
      // Stepper superior (clique direto na etapa)
      const pill = e.target.closest('.stepper-pill[data-step]');
      if(pill){
        const stepNum = parseInt(pill.dataset.step, 10);
        if(stepNum >= 1 && stepNum <= 6){
          wizardState.step = stepNum;
          renderCreatePlayerScreen(container, activeUser);
          return;
        }
      }

      // Toggle Câmera (Frente, 3/4, Costas)
      if(e.target.closest('#btnCamFront')){
        wizardState.cameraAngle = 'front';
        wizardState.rotationYaw = 0;
        renderCreatePlayerScreen(container, activeUser);
        return;
      }
      if(e.target.closest('#btnCamThreeQuarter')){
        wizardState.cameraAngle = 'threeQuarter';
        wizardState.rotationYaw = 45;
        renderCreatePlayerScreen(container, activeUser);
        return;
      }
      if(e.target.closest('#btnCamBack')){
        wizardState.cameraAngle = 'back';
        wizardState.rotationYaw = 180;
        renderCreatePlayerScreen(container, activeUser);
        return;
      }

      // Gerador Aleatório de Craque Brasileiro
      if(e.target.closest('#btnRollRandomPlayer')){
        rollRandomCraque();
        renderCreatePlayerScreen(container, activeUser);
        return;
      }

      // Sair para o menu
      if(e.target.closest('#btnCancelPlayerCreation')){
        const rawUser = (typeof getActiveAccount === 'function' ? getActiveAccount() : null);
        if(typeof window.setupViewMode !== 'undefined') window.setupViewMode = rawUser ? 'select' : 'auth';
        if(typeof window.renderSetup === 'function') window.renderSetup(container);
        return;
      }

      // Número da Camisa +/-
      if(e.target.closest('#btnNumMinus')){
        if(wizardState.shirtNumber > 1){
          wizardState.shirtNumber--;
          const el = root.querySelector('#wizShirtNumVal');
          if(el) el.textContent = wizardState.shirtNumber;
          updateAvatarOnly();
        }
        return;
      }
      if(e.target.closest('#btnNumPlus')){
        if(wizardState.shirtNumber < 99){
          wizardState.shirtNumber++;
          const el = root.querySelector('#wizShirtNumVal');
          if(el) el.textContent = wizardState.shirtNumber;
          updateAvatarOnly();
        }
        return;
      }

      // Origem
      const origCard = e.target.closest('.origin-card[data-origin]');
      if(origCard){
        wizardState.origin = origCard.dataset.origin;
        renderCreatePlayerScreen(container, activeUser);
        return;
      }

      // Inspiração
      const inspCard = e.target.closest('.inspiration-card[data-inspiration]');
      if(inspCard){
        wizardState.inspiration = inspCard.dataset.inspiration;
        renderCreatePlayerScreen(container, activeUser);
        return;
      }

      // Tom de Pele
      const skinSwatch = e.target.closest('.swatch-skin[data-skin]');
      if(skinSwatch){
        wizardState.appearance.skinTone = skinSwatch.dataset.skin;
        if(wizardState.appearance.avatarMode === 'mirror'){
          wizardState.appearance.facePhoto = window.generateYoungAthletePortraitUri(wizardState);
        }
        renderCreatePlayerScreen(container, activeUser);
        return;
      }

      // Cor do Cabelo
      const hairSwatch = e.target.closest('.swatch-hair[data-hair-color]');
      if(hairSwatch){
        wizardState.appearance.hairColor = hairSwatch.dataset.hairColor;
        if(wizardState.appearance.avatarMode === 'mirror'){
          wizardState.appearance.facePhoto = window.generateYoungAthletePortraitUri(wizardState);
        }
        renderCreatePlayerScreen(container, activeUser);
        return;
      }

      // Estilo de Cabelo
      const hairBtn = e.target.closest('.btn-hair-style[data-hair]');
      if(hairBtn){
        wizardState.appearance.hairStyle = hairBtn.dataset.hair;
        if(wizardState.appearance.avatarMode === 'mirror'){
          wizardState.appearance.facePhoto = window.generateYoungAthletePortraitUri(wizardState);
        }
        renderCreatePlayerScreen(container, activeUser);
        return;
      }

      // Cor dos Olhos
      const eyeSwatch = e.target.closest('.swatch-eye[data-eye]');
      if(eyeSwatch){
        wizardState.appearance.eyeColor = eyeSwatch.dataset.eye;
        if(wizardState.appearance.avatarMode === 'mirror'){
          wizardState.appearance.facePhoto = window.generateYoungAthletePortraitUri(wizardState);
        }
        renderCreatePlayerScreen(container, activeUser);
        return;
      }

      // Expressão da Face
      const faceBtn = e.target.closest('.btn-face[data-face]');
      if(faceBtn){
        wizardState.appearance.face = faceBtn.dataset.face;
        renderCreatePlayerScreen(container, activeUser);
        return;
      }

      // Galeria de Rostos Jovens / Espelho 3D
      const faceCard = e.target.closest('.face-card-option');
      if(faceCard){
        const mode = faceCard.dataset.mode;
        if(mode === 'mirror'){
          wizardState.appearance.avatarMode = 'mirror';
          wizardState.appearance.customFacePhoto = null;
          wizardState.appearance.facePhoto = window.generateYoungAthletePortraitUri(wizardState);
        } else {
          wizardState.appearance.avatarMode = 'preset';
          wizardState.appearance.customFacePhoto = null;
          const presetId = faceCard.dataset.presetId;
          const found = PRESET_YOUTH_ROSTER.find(p => p.id === presetId);
          if(found){
            wizardState.appearance.presetId = found.id;
            wizardState.appearance.skinTone = found.skinTone;
            wizardState.appearance.hairStyle = found.hairStyle;
            wizardState.appearance.hairColor = found.hairColor;
            wizardState.appearance.eyeColor = found.eyeColor;
            wizardState.appearance.face = found.face;
            wizardState.appearance.facePhoto = window.generateYoungAthletePortraitUri(found);
          }
        }
        renderCreatePlayerScreen(container, activeUser);
        return;
      }

      // Porte Físico
      const buildBtn = e.target.closest('.btn-build[data-build]');
      if(buildBtn){
        wizardState.bodyBuild = buildBtn.dataset.build;
        renderCreatePlayerScreen(container, activeUser);
        return;
      }

      // Pé Preferido
      const footBtn = e.target.closest('.btn-foot[data-foot]');
      if(footBtn){
        wizardState.preferredFoot = footBtn.dataset.foot;
        renderCreatePlayerScreen(container, activeUser);
        return;
      }

      // Meião e Acessórios
      const sockBtn = e.target.closest('.btn-sock[data-sock]');
      if(sockBtn){
        wizardState.appearance.sockStyle = sockBtn.dataset.sock;
        renderCreatePlayerScreen(container, activeUser);
        return;
      }

      // Chuteiras Básicas
      const bootCard = e.target.closest('.boot-card[data-boot-id]');
      if(bootCard){
        wizardState.appearance.starterBoot = bootCard.dataset.bootId;
        renderCreatePlayerScreen(container, activeUser);
        return;
      }

      // Posição
      const posBtn = e.target.closest('.btn-pos[data-pos]');
      if(posBtn){
        wizardState.position = posBtn.dataset.pos;
        const available = window.AFM_CREATOR_CATALOG.archetypesByPos[wizardState.position] || [];
        if(available.length > 0){
          wizardState.archetype = available[0].id;
        }
        renderCreatePlayerScreen(container, activeUser);
        return;
      }

      // Arquétipo
      const archCard = e.target.closest('.arch-card[data-archetype]');
      if(archCard){
        wizardState.archetype = archCard.dataset.archetype;
        renderCreatePlayerScreen(container, activeUser);
        return;
      }

      // Traço de DNA / PlayStyle
      const psCard = e.target.closest('.playstyle-card[data-playstyle]');
      if(psCard){
        wizardState.playstyle = psCard.dataset.playstyle;
        renderCreatePlayerScreen(container, activeUser);
        return;
      }

      // Distribuição de Pontos (+ / -)
      const btnPlus = e.target.closest('.btn-attr-plus[data-attr]');
      if(btnPlus){
        const attr = btnPlus.dataset.attr;
        if(wizardState.pointsAvailable > 0){
          wizardState.pointsAvailable--;
          wizardState.pointsDistributed[attr] = (wizardState.pointsDistributed[attr] || 0) + 1;
          renderCreatePlayerScreen(container, activeUser);
        }
        return;
      }
      const btnMinus = e.target.closest('.btn-attr-minus[data-attr]');
      if(btnMinus){
        const attr = btnMinus.dataset.attr;
        if((wizardState.pointsDistributed[attr] || 0) > 0){
          wizardState.pointsDistributed[attr]--;
          wizardState.pointsAvailable++;
          renderCreatePlayerScreen(container, activeUser);
        }
        return;
      }

      // Presets de build rápida
      const presetBuildBtn = e.target.closest('.btn-preset-build[data-preset]');
      if(presetBuildBtn){
        applyQuickBuildPreset(presetBuildBtn.dataset.preset);
        renderCreatePlayerScreen(container, activeUser);
        return;
      }

      // Peneira selecionada
      const tierCard = e.target.closest('.peneira-tier-card[data-tier]');
      if(tierCard){
        wizardState.peneiraTier = tierCard.dataset.tier;
        wizardState.tryoutResult = null;
        renderCreatePlayerScreen(container, activeUser);
        return;
      }

      // Escolha de clube ofertante
      const clubCard = e.target.closest('.tryout-club-option-card[data-club]');
      if(clubCard){
        const chosenClub = clubCard.dataset.club;
        const chosenWage = Number(clubCard.dataset.wage) || 1000;
        const chosenRole = clubCard.dataset.role || 'Reserva';
        wizardState.clubName = chosenClub;
        if(wizardState.tryoutResult){
          wizardState.tryoutResult.clubName = chosenClub;
          wizardState.tryoutResult.wageOffered = chosenWage;
          wizardState.tryoutResult.squadRole = chosenRole;
        }
        renderCreatePlayerScreen(container, activeUser);
        return;
      }

      // Disputar Jogo-Treino
      if(e.target.closest('#btnPlayTryoutDirect') || e.target.closest('#btnStep6RetryTryout') || e.target.closest('#btnPlayTryoutMatch')){
        startPlayerTryoutMatch(container, activeUser);
        return;
      }

      // Assinar Contrato e Iniciar Carreira
      if(e.target.closest('#btnStep6SignContract') || e.target.closest('#btnWizardFinish')){
        finalizePlayerCareerStart(container);
        return;
      }

      // Navegação Avançar / Voltar
      if(e.target.closest('#btnWizardNext')){
        if(wizardState.step === 1 && !wizardState.name.trim()){
          if(typeof window.toast === 'function') window.toast('⚠️ Por favor, digite o nome do seu atleta.');
          return;
        }
        if(wizardState.step < 6){
          wizardState.step++;
          renderCreatePlayerScreen(container, activeUser);
        }
        return;
      }
      if(e.target.closest('#btnWizardPrev')){
        if(wizardState.step > 1){
          wizardState.step--;
          renderCreatePlayerScreen(container, activeUser);
        }
        return;
      }
    }); // fim do addEventListener('click')
    } // fim do if(typeof root.addEventListener === 'function')

    if(typeof root.addEventListener === 'function'){
      // Inputs de texto e selects com atualização instantânea
      root.addEventListener('input', (e) => {
        if(e.target.id === 'wizInputName'){
          wizardState.name = e.target.value;
          updateAvatarOnly();
        } else if(e.target.id === 'wizInputNickname'){
          wizardState.nickname = e.target.value;
          updateAvatarOnly();
        } else if(e.target.id === 'wizHeightSlider'){
          wizardState.height = Number(e.target.value);
          const valEl = root.querySelector('#wizHeightVal');
          if(valEl) valEl.textContent = `${wizardState.height.toFixed(2)} M`;
          updateAvatarOnly();
        }
      });

      root.addEventListener('change', (e) => {
        // Estado e Cidade
        if(e.target.id === 'creatorStateSelect' || e.target.classList.contains('wiz-select-uf')){
          wizardState.stateUf = e.target.value;
          const cities = getCitiesForUf(wizardState.stateUf);
          wizardState.city = cities[0] || 'Capital';
          renderCreatePlayerScreen(container, activeUser);
        } else if(e.target.id === 'creatorCitySelect' || e.target.classList.contains('wiz-select-city')){
          wizardState.city = e.target.value;
          updateAvatarOnly();
        } else if(e.target.id === 'wizSelectNationality'){
          wizardState.nationality = e.target.value;
        } else if(e.target.id === 'wizFaceUpload'){
          const file = e.target.files?.[0];
          if(!file) return;
          const reader = new FileReader();
          reader.onload = (re) => {
            wizardState.appearance.avatarMode = 'upload';
            wizardState.appearance.customFacePhoto = re.target.result;
            renderCreatePlayerScreen(container, activeUser);
          };
          reader.readAsDataURL(file);
        }
      });
    }
  }

  // =========================================================================
  // PRESETS RÁPIDOS DE DISTRIBUIÇÃO DE PONTOS
  // =========================================================================
  function applyQuickBuildPreset(preset){
    wizardState.pointsDistributed = { pace: 0, shooting: 0, passing: 0, dribbling: 0, defending: 0, physical: 0 };
    wizardState.pointsAvailable = 5;

    if(preset === 'speed'){
      wizardState.pointsDistributed.pace = 3;
      wizardState.pointsDistributed.dribbling = 2;
      wizardState.pointsAvailable = 0;
    } else if(preset === 'finisher'){
      wizardState.pointsDistributed.shooting = 3;
      wizardState.pointsDistributed.physical = 2;
      wizardState.pointsAvailable = 0;
    } else if(preset === 'maestro'){
      wizardState.pointsDistributed.passing = 3;
      wizardState.pointsDistributed.dribbling = 2;
      wizardState.pointsAvailable = 0;
    } else if(preset === 'balanced'){
      wizardState.pointsDistributed.pace = 1;
      wizardState.pointsDistributed.shooting = 1;
      wizardState.pointsDistributed.passing = 1;
      wizardState.pointsDistributed.dribbling = 1;
      wizardState.pointsDistributed.physical = 1;
      wizardState.pointsAvailable = 0;
    }
  }

  // =========================================================================
  // ⚡ GERADOR ALEATÓRIO DE CRAQUE BRASILEIRO
  // =========================================================================
  function rollRandomCraque(){
    const firstNames = ["Gabriel", "Lucas", "Mateus", "Rodrigo", "Felipe", "Gustavo", "Vinícius", "Arthur", "Kauã", "Caio", "Enzo", "Davi"];
    const lastNames = ["Silva", "Santos", "Oliveira", "Souza", "Pereira", "Lima", "Carvalho", "Ferreira", "Ribeiro", "Almeida", "Rocha"];
    const nicknames = ["Gabi", "Luquinhas", "Maluquinho", "Canhota", "Raio", "Menino da Vila", "Doutor", "Guerreiro", "Driblador", "Flecha"];

    const rFirst = firstNames[Math.floor(Math.random() * firstNames.length)];
    const rLast = lastNames[Math.floor(Math.random() * lastNames.length)];
    const rNick = nicknames[Math.floor(Math.random() * nicknames.length)];

    const ufs = Object.keys(window.AFM_CREATOR_CATALOG.statesCities);
    const rUf = ufs[Math.floor(Math.random() * ufs.length)];
    const cities = getCitiesForUf(rUf);
    const rCity = cities[Math.floor(Math.random() * cities.length)];

    const positions = ['GOL', 'ZAG', 'LAT', 'VOL', 'MEI', 'PON', 'ATA'];
    const rPos = positions[Math.floor(Math.random() * positions.length)];
    const archetypes = window.AFM_CREATOR_CATALOG.archetypesByPos[rPos] || [];
    const rArch = archetypes[Math.floor(Math.random() * archetypes.length)]?.id || 'st_poacher';

    const cat = window.AFM_CREATOR_CATALOG.appearanceOptions;
    const rSkin = cat.skinTones[Math.floor(Math.random() * cat.skinTones.length)].id;
    const rHair = cat.hairStyles[Math.floor(Math.random() * cat.hairStyles.length)].id;
    const rHairColor = cat.hairColors[Math.floor(Math.random() * cat.hairColors.length)].id;
    const rEye = cat.eyeColors[Math.floor(Math.random() * cat.eyeColors.length)].id;
    const rFace = cat.faces[Math.floor(Math.random() * cat.faces.length)].id;

    const builds = ['Magro', 'Médio', 'Forte'];
    const rBuild = builds[Math.floor(Math.random() * builds.length)];
    const rHeight = Number((1.68 + Math.random() * 0.28).toFixed(2));

    wizardState.name = `${rFirst} ${rLast}`;
    wizardState.nickname = rNick;
    wizardState.shirtNumber = Math.floor(Math.random() * 20) + 1;
    wizardState.stateUf = rUf;
    wizardState.city = rCity;
    wizardState.clubName = rCity;
    wizardState.position = rPos;
    wizardState.archetype = rArch;
    wizardState.bodyBuild = rBuild;
    wizardState.height = rHeight;
    wizardState.appearance.skinTone = rSkin;
    wizardState.appearance.hairStyle = rHair;
    wizardState.appearance.hairColor = rHairColor;
    wizardState.appearance.eyeColor = rEye;
    wizardState.appearance.face = rFace;
    wizardState.appearance.avatarMode = 'mirror';
    wizardState.appearance.facePhoto = window.generateYoungAthletePortraitUri(wizardState);
  }

  // =========================================================================
  // 6. DISPUTA INTERATIVA DO JOGO-TREINO DA PENEIRA
  // =========================================================================
  function startPlayerTryoutMatch(container, activeUser){
    const tryouts = window.AFM_CREATOR_CATALOG.tryouts;
    const currentTier = tryouts.find(t => t.id === wizardState.peneiraTier) || tryouts[0];
    const ovr = getCurrentOverall();

    // Simulação do jogo-treino (30 min) com lances e nota
    const roll = Math.random();
    let scoutRating = 6.2 + (ovr - 35) * 0.12 + (roll * 2.6 - 1.0);
    scoutRating = Math.max(5.0, Math.min(9.8, Number(scoutRating.toFixed(1))));

    const approved = scoutRating >= currentTier.minRating;

    // Clubes da região ou do nível
    const ufsClubs = [wizardState.city, `${wizardState.city} FC`, `${wizardState.stateUf} Esporte Clube`, "Operário Regional", "União Metropolitana"];
    const selectedClub = ufsClubs[0];

    // Faixa salarial base da peneira
    let wageOffered = 1000;
    if(currentTier.id === 'varzea_local') wageOffered = Math.round(950 + Math.random() * 400);
    else if(currentTier.id === 'estadual_federada') wageOffered = Math.round(1400 + Math.random() * 1000);
    else if(currentTier.id === 'nacional_cb') wageOffered = Math.round(2800 + Math.random() * 2400);
    else if(currentTier.id === 'elite_serie_a') wageOffered = Math.round(6000 + Math.random() * 6000);

    const clubOffers = [
      { clubName: ufsClubs[0], wageOffered: wageOffered, division: currentTier.subtitle, squadRole: scoutRating >= 7.5 ? "Titular em Potencial" : "Reserva Imediato" },
      { clubName: ufsClubs[1], wageOffered: Math.round(wageOffered * 0.95), division: currentTier.subtitle, squadRole: "Reserva Imediato" },
      { clubName: ufsClubs[2], wageOffered: Math.round(wageOffered * 1.05), division: currentTier.subtitle, squadRole: "Plantel de Aspirantes" }
    ];

    const result = {
      approved,
      scoutRating,
      tierName: currentTier.title,
      clubName: selectedClub,
      wageOffered,
      division: currentTier.subtitle,
      squadRole: scoutRating >= 7.5 ? "Titular em Potencial" : "Reserva Imediato",
      scoutComment: approved
        ? `Excelente imposição técnica para um aspirante de 15 anos. Demonstrou personalidade sob pressão e tem tudo para assinar seu primeiro vínculo profissional!`
        : `O atleta demonstrou lampejos de qualidade, mas a intensidade competitiva desta seletiva exige maior maturidade física. Recomendamos tentar uma peneira de base regional.`,
      clubOffers
    };

    wizardState.tryoutResult = result;
    wizardState.clubName = selectedClub;

    renderCreatePlayerScreen(container, activeUser);
  }

  // =========================================================================
  // 7. FINALIZAR CRIAÇÃO E INICIAR MODO JOGADOR
  // =========================================================================
  function finalizePlayerCareerStart(container){
    const eng = window.AFM_PlayerEngine || window.AFM_PlayerCareerEngine;
    if(!eng || typeof eng.startPlayerCareer !== 'function'){
      console.error('AFM_PlayerEngine.startPlayerCareer não está disponível.');
      return;
    }

    try {
      const attrs = getCurrentAttributes();
      const playerData = {
        name: wizardState.name.trim(),
        nickname: (wizardState.nickname || wizardState.name).trim(),
        nationality: wizardState.nationality || 'Brasil',
        shirtNumber: wizardState.shirtNumber || 10,
        stateUf: wizardState.stateUf || 'DF',
        city: wizardState.city || 'Brasília',
        clubName: wizardState.clubName || 'Brasília',
        peneiraTier: wizardState.peneiraTier || 'varzea_local',
        tryoutWage: wizardState.tryoutResult?.wageOffered || 1000,
        position: wizardState.position || 'ATA',
        archetype: wizardState.archetype || 'st_poacher',
        height: wizardState.height || 1.78,
        bodyBuild: wizardState.bodyBuild || 'Médio',
        preferredFoot: wizardState.preferredFoot || 'Direito',
        origin: wizardState.origin || 'terrao',
        playstyle: wizardState.playstyle || 'frieza_letal',
        pointsDistributed: {
          vel: wizardState.pointsDistributed.pace || 0,
          chu: wizardState.pointsDistributed.shooting || 0,
          pas: wizardState.pointsDistributed.passing || 0,
          dri: wizardState.pointsDistributed.dribbling || 0,
          def: wizardState.pointsDistributed.defending || 0,
          fis: wizardState.pointsDistributed.physical || 0
        },
        remainingSkillPoints: Math.max(0, Number(wizardState.pointsAvailable) || 0),
        appearance: {
          skinTone: wizardState.appearance.skinTone,
          hairStyle: wizardState.appearance.hairStyle,
          hairColor: wizardState.appearance.hairColor,
          eyeColor: wizardState.appearance.eyeColor,
          face: wizardState.appearance.face,
          avatarMode: wizardState.appearance.avatarMode,
          facePhoto: wizardState.appearance.customFacePhoto || wizardState.appearance.facePhoto || window.generateYoungAthletePortraitUri(wizardState),
          customFacePhoto: wizardState.appearance.customFacePhoto || null,
          starterBoot: wizardState.appearance.starterBoot,
          sockStyle: wizardState.appearance.sockStyle
        }
      };

      const targetSlot = (typeof window.setupSelectedSlot === 'number') ? window.setupSelectedSlot : 2;
      eng.startPlayerCareer(playerData, targetSlot);
    } catch(err){
      console.error('Erro ao iniciar carreira jogador:', err);
      if(typeof window.toast === 'function') window.toast(`❌ ${err.message || 'Falha ao iniciar carreira.'}`);
    }
  }

  // =========================================================================
  // EXPOSIÇÃO GLOBAL
  // =========================================================================
  window.renderCreatePlayerScreen = renderCreatePlayerScreen;
  window.AFM_CreatePlayerUI = {
    renderCreatePlayerScreen,
    getWizardState: () => wizardState,
    setWizardState: (st) => { wizardState = Object.assign(wizardState, st); },
    rollRandomCraque
  };

})(window);
