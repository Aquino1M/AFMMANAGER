/**
 * AFM MANAGER 2026 / 2027 — MODO CARREIRA JOGADOR (BE A PRO / RUMO AO ESTRELATO)
 * Motor Central de Lógica de Carreira do Atleta
 * 
 * Invariantes:
 * - 100% isolado do Modo Treinador (state.gameMode = 'player' vs 'manager')
 * - Reutiliza todo o ecossistema existente (ligas, tabelas, calendário e clubes)
 * - Clubes respeitam rigorosamente suas divisões reais (ex: Brasília no Candangão / Série D)
 * - Zero regressões nos saves e no modo treinador
 */

(function(window){
  'use strict';

  function norm(str){
    if(typeof window.norm === 'function' && window.norm !== norm) return window.norm(str);
    return String(str || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
  }

  // Dicionário de Cidades e seus Clubes principais nas ligas do AFM
  const BRAZILIAN_REGIONS_DATA = {
    'GO': {
      name: 'Goiás',
      cities: [
        { name: 'Goiânia', clubs: ['Goiás', 'Atlético-GO', 'Vila Nova', 'Goiânia'] },
        { name: 'Aparecida de Goiânia', clubs: ['Aparecidense'] },
        { name: 'Anápolis', clubs: ['Anápolis', 'Grêmio Anápolis'] },
        { name: 'Catalão', clubs: ['CRAC'] },
        { name: 'Goianésia', clubs: ['Goianésia'] },
        { name: 'Jataí', clubs: ['Jataiense'] },
        { name: 'Ouvidor', clubs: ['Abecat Ouvidorense'] },
        { name: 'Itumbiara', clubs: ['Itumbiara'] },
        { name: 'Inhumas', clubs: ['Inhumas'] },
        { name: 'Morrinhos', clubs: ['Morrinhos'] }
      ]
    },
    'SP': {
      name: 'São Paulo',
      cities: [
        { name: 'São Paulo', clubs: ['Corinthians', 'Palmeiras', 'São Paulo', 'Portuguesa', 'Juventus-SP'] },
        { name: 'Santos', clubs: ['Santos', 'Portuguesa Santista'] },
        { name: 'Campinas', clubs: ['Ponte Preta', 'Guarani'] },
        { name: 'Bragança Paulista', clubs: ['Red Bull Bragantino'] },
        { name: 'Ribeirão Preto', clubs: ['Botafogo-SP', 'Comercial-SP'] },
        { name: 'Novo Horizonte', clubs: ['Novorizontino'] },
        { name: 'Mirassol', clubs: ['Mirassol'] },
        { name: 'Sorocaba', clubs: ['São Bento'] },
        { name: 'Água Santa (Diadema)', clubs: ['Água Santa'] },
        { name: 'Itu', clubs: ['Ituano'] },
        { name: 'Limeira', clubs: ['Inter de Limeira'] },
        { name: 'Santo André', clubs: ['Santo André'] },
        { name: 'São Bernardo do Campo', clubs: ['São Bernardo'] }
      ]
    },
    'RJ': {
      name: 'Rio de Janeiro',
      cities: [
        { name: 'Rio de Janeiro', clubs: ['Flamengo', 'Fluminense', 'Vasco', 'Botafogo', 'Bangu', 'Madureira', 'America-RJ', 'Olaria'] },
        { name: 'Volta Redonda', clubs: ['Volta Redonda'] },
        { name: 'Nova Iguaçu', clubs: ['Nova Iguaçu'] },
        { name: 'Cabo Frio', clubs: ['Cabofriense'] },
        { name: 'Campos dos Goytacazes', clubs: ['Americano', 'Goytacaz'] }
      ]
    },
    'MG': {
      name: 'Minas Gerais',
      cities: [
        { name: 'Belo Horizonte', clubs: ['Atlético-MG', 'Cruzeiro', 'América-MG'] },
        { name: 'Tombos', clubs: ['Tombense'] },
        { name: 'Poços de Caldas', clubs: ['Caldense'] },
        { name: 'Pouso Alegre', clubs: ['Pouso Alegre'] },
        { name: 'São João del-Rei', clubs: ['Athletic Club'] },
        { name: 'Patos de Minas', clubs: ['URT', 'Mamoré'] },
        { name: 'Juiz de Fora', clubs: ['Tupi', 'Tupynambás'] },
        { name: 'Governador Valadares', clubs: ['Democrata-GV'] }
      ]
    },
    'RS': {
      name: 'Rio Grande do Sul',
      cities: [
        { name: 'Porto Alegre', clubs: ['Grêmio', 'Internacional', 'São José-RS'] },
        { name: 'Caxias do Sul', clubs: ['Juventude', 'Caxias'] },
        { name: 'Pelotas', clubs: ['Brasil de Pelotas', 'Pelotas'] },
        { name: 'Novo Hamburgo', clubs: ['Novo Hamburgo'] },
        { name: 'Ypiranga (Erechim)', clubs: ['Ypiranga-RS'] },
        { name: 'Santa Cruz do Sul', clubs: ['Avenida', 'Santa Cruz-RS'] }
      ]
    },
    'PR': {
      name: 'Paraná',
      cities: [
        { name: 'Curitiba', clubs: ['Athletico-PR', 'Coritiba', 'Paraná Clube'] },
        { name: 'Londrina', clubs: ['Londrina'] },
        { name: 'Maringá', clubs: ['Maringá'] },
        { name: 'Ponta Grossa', clubs: ['Operário-PR'] },
        { name: 'Cascavel', clubs: ['FC Cascavel'] },
        { name: 'Cianorte', clubs: ['Cianorte'] },
        { name: 'Foz do Iguaçu', clubs: ['Foz do Iguaçu'] }
      ]
    },
    'SC': {
      name: 'Santa Catarina',
      cities: [
        { name: 'Florianópolis', clubs: ['Avaí', 'Figueirense'] },
        { name: 'Criciúma', clubs: ['Criciúma'] },
        { name: 'Chapecó', clubs: ['Chapecoense'] },
        { name: 'Brusque', clubs: ['Brusque'] },
        { name: 'Joinville', clubs: ['Joinville'] },
        { name: 'Itajaí', clubs: ['Marcílio Dias'] }
      ]
    },
    'BA': {
      name: 'Bahia',
      cities: [
        { name: 'Salvador', clubs: ['Bahia', 'Vitória', 'Galícia', 'Jacuipense'] },
        { name: 'Feira de Santana', clubs: ['Fluminense de Feira', 'Bahia de Feira'] },
        { name: 'Ilhéus', clubs: ['Barcelona de Ilhéus'] },
        { name: 'Juazeiro', clubs: ['Juazeirense'] },
        { name: 'Alagoinhas', clubs: ['Atlético de Alagoinhas'] }
      ]
    },
    'CE': {
      name: 'Ceará',
      cities: [
        { name: 'Fortaleza', clubs: ['Fortaleza', 'Ceará', 'Ferroviário-CE', 'Floresta', 'Atlético Cearense'] },
        { name: 'Sobral', clubs: ['Guarany de Sobral'] },
        { name: 'Juazeiro do Norte', clubs: ['Icasa', 'Barbalha'] }
      ]
    },
    'PE': {
      name: 'Pernambuco',
      cities: [
        { name: 'Recife', clubs: ['Sport', 'Náutico', 'Santa Cruz', 'Retrô'] },
        { name: 'Caruaru', clubs: ['Central'] },
        { name: 'Salgueiro', clubs: ['Salgueiro'] },
        { name: 'Afogados da Ingazeira', clubs: ['Afogados'] }
      ]
    },
    'DF': {
      name: 'Distrito Federal',
      cities: [
        { name: 'Brasília', clubs: ['Brasília', 'Brasiliense', 'Gama', 'Ceilândia', 'Real Brasília', 'Capital-DF', 'Paranoá', 'Samambaia', 'Sobradinho', 'Taguatinga', 'Santa Maria'] }
      ]
    },
    'PA': {
      name: 'Pará',
      cities: [
        { name: 'Belém', clubs: ['Paysandu', 'Remo', 'Tuna Luso'] },
        { name: 'Santarém', clubs: ['São Raimundo-PA'] },
        { name: 'Marabá', clubs: ['Águia de Marabá'] }
      ]
    },
    'AM': {
      name: 'Amazonas',
      cities: [
        { name: 'Manaus', clubs: ['Amazonas FC', 'Manaus FC', 'Nacional-AM', 'Fast Clube', 'São Raimundo-AM'] }
      ]
    },
    'MT': {
      name: 'Mato Grosso',
      cities: [
        { name: 'Cuiabá', clubs: ['Cuiabá', 'Mixto', 'Dom Bosco'] },
        { name: 'Rondonópolis', clubs: ['União Rondonópolis'] },
        { name: 'Lucas do Rio Verde', clubs: ['Luverdense'] }
      ]
    },
    'AL': {
      name: 'Alagoas',
      cities: [
        { name: 'Maceió', clubs: ['CRB', 'CSA'] },
        { name: 'Arapiraca', clubs: ['ASA'] },
        { name: 'Murici', clubs: ['Murici'] }
      ]
    },
    'RN': {
      name: 'Rio Grande do Norte',
      cities: [
        { name: 'Natal', clubs: ['ABC', 'América-RN', 'Alecrim'] },
        { name: 'Mossoró', clubs: ['Potiguar de Mossoró'] }
      ]
    }
  };

  // Arquétipos e atributos base CALIBRADOS PARA OVERALL ~35 (Início humilde aos 15 anos)
  const ARCHETYPES = {
    'finalizador': {
      name: 'Finalizador Letal',
      description: 'Oportunista dentro da área, pontaria calibrada e frieza no mano a mano.',
      pos: 'ATA',
      attrs: { vel: 34, chu: 38, pas: 28, dri: 32, def: 18, fis: 30 } // OVR ~35
    },
    'maestro': {
      name: 'Maestro / Camisa 10',
      description: 'Visão de jogo periférica, lançamentos cirúrgicos e controle de ritmo.',
      pos: 'MEI',
      attrs: { vel: 30, chu: 30, pas: 40, dri: 36, def: 22, fis: 26 } // OVR ~35
    },
    'velocista': {
      name: 'Velocista / Ponta Agudo',
      description: 'Arranque explosivo nas pontas, drible em velocidade e cruzamentos venenosos.',
      pos: 'PON',
      attrs: { vel: 40, chu: 30, pas: 28, dri: 36, def: 18, fis: 26 } // OVR ~35
    },
    'xerife': {
      name: 'Zagueiro Xerife',
      description: 'Imposição física, antecipação implacável e liderança na linha de defesa.',
      pos: 'ZAG',
      attrs: { vel: 28, chu: 18, pas: 24, dri: 20, def: 40, fis: 38 } // OVR ~35
    },
    'motorzinho': {
      name: 'Volante Box-to-Box',
      description: 'Fôlego inesgotável, desarme limpo e chegada surpresa no ataque.',
      pos: 'VOL',
      attrs: { vel: 32, chu: 26, pas: 34, dri: 30, def: 38, fis: 38 } // OVR ~35
    },
    'lateral_ofensivo': {
      name: 'Lateral Moderno',
      description: 'Apoio constante pelas alas, cruzamentos precisos e recomposição veloz.',
      pos: 'LAT',
      attrs: { vel: 38, chu: 24, pas: 32, dri: 34, def: 32, fis: 30 } // OVR ~35
    },
    'muralha': {
      name: 'Goleiro Paredão',
      description: 'Reflexos debaixo das traves e segurança nas saídas pelo alto.',
      pos: 'GOL',
      attrs: { vel: 26, chu: 18, pas: 26, dri: 18, def: 42, fis: 36 } // OVR ~35
    }
  };

  // Os 3 Tipos de Peneira Inicial
  const PENEIRA_TIERS = {
    'basica': {
      id: 'basica',
      name: 'Peneira Básica / Regional',
      subtitle: 'Série D e Acesso Estadual',
      description: 'Clubes modestos e regionais. Alta chance de passar e oportunidade real de disputar jogos oficiais rapidamente.',
      approvalBaseChance: 0.90, // 90% chance base
      wageRange: [800, 1500],
      initialTrust: 45, // Reserva imediato / disputa vaga
      defaultRole: 'Reserva Imediato',
      badgeClass: 'good',
      difficultyBadge: 'Alta Aprovação (~90%)',
      difficultyColor: '#10b981',
      icon: '🥉',
      scoutCommentSuccess: 'Aprovado com louvor! O treinador viu potencial para ser lapidado na equipe principal rapidamente.',
      scoutCommentFail: 'O teste foi equilibrado, mas o clube tem poucas vagas para alojamento neste semestre.'
    },
    'media': {
      id: 'media',
      name: 'Peneira Média / Estadual Módulo I',
      subtitle: 'Série C e Clubes Tradicionais',
      description: 'Clubes com boa estrutura de divisão nacional. Exige destaque no jogo-treino para garantir contrato.',
      approvalBaseChance: 0.55, // 55% chance base
      wageRange: [1800, 3200],
      initialTrust: 35, // Reserva (entra no 2º tempo)
      defaultRole: 'Reserva (2º Tempo)',
      badgeClass: 'warning',
      difficultyBadge: 'Média Aprovação (~55%)',
      difficultyColor: '#f59e0b',
      icon: '🥈',
      scoutCommentSuccess: 'Excelente atuação no coletivo! Você conquistou uma das vagas e treinará com os aspirantes.',
      scoutCommentFail: 'Faltou um pouco mais de ritmo de jogo contra atletas mais velhos. Tente novamente ou busque uma divisão mais acessível.'
    },
    'elite': {
      id: 'elite',
      name: 'Peneira de Elite',
      subtitle: 'Séries B e A do Brasileirão',
      description: 'Gigantes do futebol nacional. Peneira disputadíssima com olheiros exigentes. Se passar, começa no sub-20/banco profundo.',
      approvalBaseChance: 0.25, // 25% chance base
      wageRange: [3500, 5000],
      initialTrust: 20, // Não relacionado / Sub-20
      defaultRole: 'Sub-20 / Não Relacionado',
      badgeClass: 'danger',
      difficultyBadge: 'Baixa Aprovação (~25%)',
      difficultyColor: '#ef4444',
      icon: '🥇',
      scoutCommentSuccess: 'Sensacional! Entre centenas de garotos, você encheu os olhos do coordenador da base.',
      scoutCommentFail: 'Concorrência feroz. O clube busca atletas prontos fisicamente. Uma passagem pela Série D ou C ajudará na sua maturação.'
    }
  };

  // Catálogo de Chuteiras Básicas de Entrada (Sem Patrocínio)
  const STARTER_BOOTS = [
    {
      id: 'boot_black_classic',
      name: 'Chuteira Clássica Preta',
      tag: 'Couro Tradicional',
      color: '#111827',
      accent: '#374151',
      desc: 'Preto fosco clássico de couro costurado. A chuteira raiz de quem está começando na base.'
    },
    {
      id: 'boot_varzea',
      name: 'Chuteira de Várzea & Peneira',
      tag: 'Travas Reforçadas',
      color: '#1e293b',
      accent: '#94a3b8',
      desc: 'Resistente a campos de terra batida e gramados irregulares. Excelente durabilidade.'
    },
    {
      id: 'boot_synthetic',
      name: 'Mista Campo & Sintético',
      tag: 'Leveza & Agilidade',
      color: '#f8fafc',
      accent: '#64748b',
      desc: 'Branca sem logotipo comercial, sola flexível de borracha para dribles e arranques velozes.'
    },
    {
      id: 'boot_cushion',
      name: 'Básica Amortecimento Reforçado',
      tag: 'Proteção Articular',
      color: '#334155',
      accent: '#0284c7',
      desc: 'Design anatômico com palmilha de EVA de alta densidade para diminuir o impacto.'
    }
  ];

  // Catálogo Geral de Marcas Esportivas Mundiais e Linhas Oficiais
  const SPONSOR_TIERS_CATALOG = [
    // Nível 1: Base / Regional (OVR 30 - 54)
    {
      id: 'sp_penalty_base',
      name: 'Penalty Brasil Raiz',
      brand: 'Penalty',
      tier: 'base',
      minOvr: 32,
      monthlyBase: 180,
      bonusGoalBase: 90,
      bonusWinBase: 70,
      durationDays: 120,
      description: 'Apoio de entrada para joias da base, fornecimento de chuteiras e incentivo financeiro.'
    },
    {
      id: 'sp_topper_base',
      name: 'Topper Dominator Pro',
      brand: 'Topper',
      tier: 'base',
      minOvr: 34,
      monthlyBase: 250,
      bonusGoalBase: 120,
      bonusWinBase: 90,
      durationDays: 180,
      description: 'Chuteiras resistentes para campeonatos estaduais e torneios de base.'
    },
    {
      id: 'sp_kanxa_base',
      name: 'Kanxa Elite Classic',
      brand: 'Kanxa',
      tier: 'base',
      minOvr: 30,
      monthlyBase: 120,
      bonusGoalBase: 60,
      bonusWinBase: 40,
      durationDays: 90,
      description: 'Parceria esportiva voltada a jovens revelações regionais.'
    },
    // Nível 2: Aspirante / Série C e B (OVR 55 - 64)
    {
      id: 'sp_puma_aspirante',
      name: 'Puma Future Match',
      brand: 'Puma',
      tier: 'aspirante',
      minOvr: 55,
      monthlyBase: 3500,
      bonusGoalBase: 1400,
      bonusWinBase: 1000,
      durationDays: 270,
      description: 'Chuteiras com ajuste adaptativo FUZIONFIT e bônus agressivo por gols.'
    },
    {
      id: 'sp_umbro_aspirante',
      name: 'Umbro Speciali Eternal',
      brand: 'Umbro',
      tier: 'aspirante',
      minOvr: 55,
      monthlyBase: 3200,
      bonusGoalBase: 1200,
      bonusWinBase: 900,
      durationDays: 180,
      description: 'Couro clássico com tecnologia moderna para atletas em ascensão nacional.'
    },
    {
      id: 'sp_diadora_aspirante',
      name: 'Diadora Brasil Elite',
      brand: 'Diadora',
      tier: 'aspirante',
      minOvr: 56,
      monthlyBase: 3800,
      bonusGoalBase: 1500,
      bonusWinBase: 1100,
      durationDays: 240,
      description: 'Tradição italiana nos gramados com suporte esportivo completo.'
    },
    // Nível 3: Série A / Destaque Nacional (OVR 65 - 74)
    {
      id: 'sp_adidas_nacional',
      name: 'Adidas Predator League',
      brand: 'Adidas',
      tier: 'nacional',
      minOvr: 65,
      monthlyBase: 7500,
      bonusGoalBase: 2500,
      bonusWinBase: 2000,
      durationDays: 365,
      description: 'Aperfeiçoamento de finalizações e controle de bola para estrelas da primeira divisão.'
    },
    {
      id: 'sp_mizuno_nacional',
      name: 'Mizuno Morelia Neo IV',
      brand: 'Mizuno',
      tier: 'nacional',
      minOvr: 65,
      monthlyBase: 7000,
      bonusGoalBase: 2200,
      bonusWinBase: 1800,
      durationDays: 300,
      description: 'Leveza ultra fina e conforto superior para atletas velozes e técnicos.'
    },
    {
      id: 'sp_newbalance_nacional',
      name: 'New Balance Furon Pro',
      brand: 'New Balance',
      tier: 'nacional',
      minOvr: 66,
      monthlyBase: 8200,
      bonusGoalBase: 2800,
      bonusWinBase: 2200,
      durationDays: 330,
      description: 'Explosão de velocidade e alta remuneração por desempenho nas grandes ligas.'
    },
    // Nível 4: Estrela Internacional / Europa (OVR 75 - 84)
    {
      id: 'sp_nike_internacional',
      name: 'Nike Mercurial Vapor Elite',
      brand: 'Nike',
      tier: 'internacional',
      minOvr: 75,
      monthlyBase: 18000,
      bonusGoalBase: 5000,
      bonusWinBase: 4000,
      durationDays: 365,
      description: 'A chuteira mais veloz do mundo com contrato milionário de fornecimento exclusivo.'
    },
    {
      id: 'sp_adidas_internacional',
      name: 'Adidas Predator Elite',
      brand: 'Adidas',
      tier: 'internacional',
      minOvr: 75,
      monthlyBase: 19000,
      bonusGoalBase: 5500,
      bonusWinBase: 4500,
      durationDays: 330,
      description: 'Contrato de prestígio global com a gigante das três listras.'
    },
    {
      id: 'sp_underarmour_internacional',
      name: 'Under Armour Clone Magnetico',
      brand: 'Under Armour',
      tier: 'internacional',
      minOvr: 76,
      monthlyBase: 17500,
      bonusGoalBase: 4800,
      bonusWinBase: 3800,
      durationDays: 300,
      description: 'Inovação de ajuste personalizado e grandes bonificações contratuais.'
    },
    // Nível 5: Craque Mundial / Superastro (OVR 85+)
    {
      id: 'sp_nike_superstar',
      name: 'Nike Mercurial Superfly Signature',
      brand: 'Nike',
      tier: 'superstar',
      minOvr: 85,
      monthlyBase: 45000,
      bonusGoalBase: 12000,
      bonusWinBase: 10000,
      durationDays: 365,
      description: 'Contrato Signature vitalício de escala mundial para concorrentes à Bola de Ouro.'
    },
    {
      id: 'sp_adidas_superstar',
      name: 'Adidas F50 Elite Gold',
      brand: 'Adidas',
      tier: 'superstar',
      minOvr: 85,
      monthlyBase: 50000,
      bonusGoalBase: 14000,
      bonusWinBase: 11000,
      durationDays: 450,
      description: 'Edição de ouro com bonificações históricas de campeão mundial.'
    }
  ];

  // Lista de Patrocinadores Esportivos disponíveis para o atleta assinar conforme evoluir (Retrocompatibilidade)
  const SPONSOR_OFFERS = [
    {
      id: 'sp_penalty',
      name: 'Penalty Brasil Raiz',
      brand: 'Penalty',
      bonusWin: 800,
      bonusGoal: 1000,
      bonusAssist: 700,
      monthlyStipend: 1800,
      durationDays: 120,
      minOvr: 42,
      description: 'Apoio direto desde a categoria de base com materiais esportivos e incentivo financeiro.'
    },
    {
      id: 'sp_puma',
      name: 'Puma Future Ultimate',
      brand: 'Puma',
      bonusWin: 1200,
      bonusGoal: 1600,
      bonusAssist: 800,
      monthlyStipend: 3200,
      durationDays: 240,
      minOvr: 55,
      description: 'Bônus agressivo por gols marcados e campanhas digitais.'
    },
    {
      id: 'sp_adidas',
      name: 'Adidas Predator Elite',
      brand: 'Adidas',
      bonusWin: 1500,
      bonusGoal: 1500,
      bonusAssist: 1100,
      monthlyStipend: 4200,
      durationDays: 365,
      minOvr: 62,
      description: 'Chuteiras de alta precisão e premiações substanciais por vitórias.'
    },
    {
      id: 'sp_nike',
      name: 'Nike Mercurial Series',
      brand: 'Nike',
      bonusWin: 1800,
      bonusGoal: 1800,
      bonusAssist: 1200,
      monthlyStipend: 5000,
      durationDays: 365,
      minOvr: 65,
      description: 'Contrato de fornecimento oficial com a gigante do esporte mundial.'
    }
  ];

  function createStarterSponsorOffer(ovr, date = '2026-01-01'){
    const overall = Math.max(1, Number(ovr) || 1);
    const multiplier = Math.max(1, (overall - 40) * 0.04);
    const monthly = Math.round(120 * multiplier);
    const bonusGoal = Math.round(60 * multiplier);
    const bonusWin = Math.round(40 * multiplier);
    return {
      id: 'offer_sponsor_starter',
      type: 'sponsor',
      title: 'Incentivo Esportivo Regional de Base',
      name: 'Incentivo Esportivo Regional de Base',
      brand: 'Comércio Esportivo Local',
      clubOrBrand: 'Comércio Esportivo Local',
      tier: 'base',
      minOvr: 30,
      isStarterSponsor: true,
      details: `Chuteiras reserva, R$ ${monthly.toLocaleString('pt-BR')}/mês, R$ ${bonusGoal.toLocaleString('pt-BR')} por gol e R$ ${bonusWin.toLocaleString('pt-BR')} por vitória. Valores ajustados ao OVR ${overall}.`,
      description: 'Patrocínio regional de entrada com fornecimento de chuteiras reserva.',
      monthly,
      monthlyStipend: monthly,
      bonusGoal,
      bonusAssist: Math.round(bonusGoal * 0.7),
      bonusWin,
      durationDays: 90,
      date,
      isRead: false
    };
  }

  /**
   * Gera novas propostas oficiais de patrocínio dinâmicas para a temporada ativa
   */
  function generateSeasonSponsorOffers(gameState){
    if(!gameState || gameState.gameMode !== 'player' || !gameState.playerCareerState) return [];
    const pState = gameState.playerCareerState;
    const athlete = (gameState.squad || []).find(p => p.id === gameState.controlledPlayerId) || {};
    const ovr = Number(athlete.ovr) || Number(athlete.overall) || Number(pState.athleteOvr) || Number(pState.overall) || 0;
    const curYear = parseInt(String(gameState.date || gameState.currentDate || '2026').slice(0, 4), 10) || 2026;
    const followers = Number(pState.socialMedia?.followers || 500);

    const eligible = SPONSOR_TIERS_CATALOG.filter(sp => ovr >= sp.minOvr);
    const pool = eligible;

    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    const picked = [];
    const usedBrands = new Set();
    for(const sp of shuffled){
      if(!usedBrands.has(sp.brand)){
        usedBrands.add(sp.brand);
        picked.push(sp);
      }
      if(picked.length >= 4) break;
    }

    const ovrMultiplier = Math.max(1, (ovr - 40) * 0.04 + (followers > 50000 ? 0.35 : followers > 10000 ? 0.15 : 0));

    const seasonOffers = picked.map((sp, idx) => {
      const monthly = Math.round(sp.monthlyBase * ovrMultiplier);
      const bonusGoal = Math.round(sp.bonusGoalBase * ovrMultiplier);
      const bonusWin = Math.round(sp.bonusWinBase * ovrMultiplier);
      return {
        id: `${sp.id}_s${curYear}_${idx}`,
        name: `${sp.name}`,
        brand: sp.brand,
        tier: sp.tier,
        monthlyStipend: monthly,
        bonusGoal: bonusGoal,
        bonusWin: bonusWin,
        bonusAssist: Math.round(bonusGoal * 0.7),
        durationDays: sp.durationDays || 180,
        season: curYear,
        description: sp.description,
        minOvr: sp.minOvr
      };
    });

    pState.availableSponsorOffers = seasonOffers;
    pState.lastSponsorSeasonGenerated = curYear;
    pState.sponsorOfferBalanceVersion = 3;
    return seasonOffers;
  }

  /**
   * Retorna a lista de propostas de patrocínio vigentes para o atleta
   */
  function getPlayerSponsorOffers(gameState){
    if(!gameState || gameState.gameMode !== 'player' || !gameState.playerCareerState) return [];
    const pState = gameState.playerCareerState;
    const curYear = parseInt(String(gameState.date || gameState.currentDate || '2026').slice(0, 4), 10) || 2026;

    const athlete = (gameState.squad || []).find(p => p.id === gameState.controlledPlayerId) || {};
    const ovr = Number(athlete.ovr) || Number(athlete.overall) || Number(pState.athleteOvr) || Number(pState.overall) || 0;
    const starterOffer = (pState.agentOffers || []).find(offer => offer.type === 'sponsor' && (
      offer.id === 'offer_sponsor_starter' || offer.isStarterSponsor ||
      [offer.title, offer.name, offer.clubOrBrand].some(value => norm(value) === norm('Incentivo Esportivo Regional de Base'))
    ));
    if(starterOffer) Object.assign(starterOffer, createStarterSponsorOffer(ovr, starterOffer.date || gameState.date || `${curYear}-01-01`), { isRead: starterOffer.isRead === true });
    if(!Array.isArray(pState.availableSponsorOffers) || pState.availableSponsorOffers.length === 0 || pState.lastSponsorSeasonGenerated !== curYear || pState.sponsorOfferBalanceVersion !== 3 || pState.availableSponsorOffers.some(offer => Number(offer.minOvr) > ovr)){
      return generateSeasonSponsorOffers(gameState);
    }
    return pState.availableSponsorOffers;
  }

  // =========================================================================
  // CATÁLOGO DE EMPRESÁRIOS & AGÊNCIAS DE FUTEBOL (SISTEMA DE REPRESENTAÇÃO)
  // =========================================================================
  const AGENTS_CATALOG = [
    {
      id: 'agent_family',
      name: 'Família & Amigo de Infância (Tio/Pai)',
      agency: 'Gestão Familiar Amadora',
      tier: 'familiar',
      minOvr: 30,
      minFollowers: 0,
      monthlySalary: 0, // Sem taxa fixa mensal inicial
      transferCommissionPct: 3, // 3% de comissão em transferências
      sponsorCommissionPct: 5, // 5% de comissão em patrocínios
      negotiationPower: 'Básico',
      wageMultiplier: 1.0,
      signingBonusMultiplier: 1.0,
      clubTierAccess: 'Clubes Regionais / Séries D e C',
      icon: '👨‍👦',
      reputationStars: 1,
      description: 'Pessoas de confiança da família. Não cobram taxa mensal fixa e aceitam comissões mínimas, priorizando a segurança e união familiar.'
    },
    {
      id: 'agent_regional',
      name: "Carlos 'Mineiro' Dantas",
      agency: 'Prime Goal Representações (CBF)',
      tier: 'regional',
      minOvr: 40,
      minFollowers: 500,
      monthlySalary: 350,
      transferCommissionPct: 5,
      sponsorCommissionPct: 6,
      negotiationPower: 'Bom (+5% Salário)',
      wageMultiplier: 1.05,
      signingBonusMultiplier: 1.10,
      clubTierAccess: 'Séries C, B e Estaduais Módulo I',
      icon: '👔',
      reputationStars: 2,
      description: 'Empresário credenciado na CBF com trânsito em clubes regionais e divisões de acesso. Negocia salários até 5% maiores e facilita empréstimos.'
    },
    {
      id: 'agent_national',
      name: 'Rodrigo Bessa & Associados',
      agency: 'Alpha Sports Management Brasil',
      tier: 'national',
      minOvr: 58,
      minFollowers: 5000,
      monthlySalary: 1500,
      transferCommissionPct: 8,
      sponsorCommissionPct: 9,
      negotiationPower: 'Forte (+12% Salário)',
      wageMultiplier: 1.12,
      signingBonusMultiplier: 1.25,
      clubTierAccess: 'Série A Nacional e Clubes Médios da Europa',
      icon: '💼',
      reputationStars: 3,
      description: 'Agência nacional com acesso a clubes da Série A e mercados intermediários da Europa. Negocia salários até 12% maiores e luvas moderadas.'
    },
    {
      id: 'agent_global',
      name: 'Stefano Castiglione & Mendes Global',
      agency: 'OmniStar Worldwide Football',
      tier: 'global',
      minOvr: 78,
      minFollowers: 25000,
      monthlySalary: 6000,
      transferCommissionPct: 10,
      sponsorCommissionPct: 12,
      negotiationPower: 'Internacional (+20% Salário)',
      wageMultiplier: 1.20,
      signingBonusMultiplier: 1.50,
      clubTierAccess: 'Big 5 da Europa & Champions League',
      icon: '🌐',
      reputationStars: 5,
      description: 'Agência internacional para atletas consolidados. Abre portas nas principais ligas e negocia salários até 20% maiores.'
    }
  ];

  // =========================================================================
  // CATÁLOGO DE STAFF PESSOAL DE ALTA PERFORMANCE (CUSTOS MENSAIS & BÔNUS)
  // =========================================================================
  const STAFF_CATALOG = [
    {
      id: 'personal_trainer',
      name: 'Personal Trainer de Alta Performance',
      role: 'Preparação Física Particular',
      category: 'fitness',
      hireCost: 3500,
      monthlyCostBase: 1000,
      benefitText: '+20% de ganho de XP semanal/pós-jogos e menor perda de físico',
      icon: '🏋️‍♂️',
      description: 'Treinos individualizados de potência muscular, pliometria e aceleração.'
    },
    {
      id: 'physio',
      name: 'Fisioterapeuta & Recovery Exclusivo',
      role: 'Recuperação Muscular & Crioterapia',
      category: 'medical',
      hireCost: 4500,
      monthlyCostBase: 1200,
      benefitText: 'Recupera estamina 35% mais rápido entre jogos e previne fadiga crônica',
      icon: '🩺',
      description: 'Banhos de gelo, botas pneumáticas de compressão e liberação miofascial imediata.'
    },
    {
      id: 'nutritionist',
      name: 'Nutricionista Esportivo & Chef Particular',
      role: 'Bioquímica e Nutrição de Elite',
      category: 'nutrition',
      hireCost: 4000,
      monthlyCostBase: 1100,
      benefitText: '+5% de precisão nos chutes, energia máxima e consistência nas notas',
      icon: '🥗',
      description: 'Cardápio hipercalórico balanceado milimetricamente para dias de jogo e descanso.'
    },
    {
      id: 'marketing_team',
      name: 'Equipe de Marketing & Social Media (FootGram)',
      role: 'Assessoria de Imprensa, Mídia & RP',
      category: 'marketing',
      hireCost: 5500,
      monthlyCostBase: 1500,
      benefitText: 'Crescimento orgânico contínuo no FootGram (+50 a +350 seg/semana) e atrai melhores marcas',
      icon: '📱',
      description: 'Criação diária de conteúdo, reels profissionais, relacionamento com marcas e blindagem de crises.'
    },
    {
      id: 'mental_coach',
      name: 'Psicólogo Esportivo & Mental Coach',
      role: 'Psicologia Esportiva & Foco Mental',
      category: 'mental',
      hireCost: 3800,
      monthlyCostBase: 950,
      benefitText: 'Moral blindada em derrotas e bônus de frieza em clássicos, finais e pênaltis',
      icon: '🧠',
      description: 'Controle de ansiedade pré-jogo, foco inabalável sob pressão e mindset campeão.'
    },
    {
      id: 'security_driver',
      name: 'Segurança Pessoal & Motorista Executivo',
      role: 'Logística & Proteção de Celebridade',
      category: 'security',
      hireCost: 6000,
      monthlyCostBase: 1800,
      minOvr: 60,
      benefitText: 'Proteção contra assédio da torcida/mídia e pontualidade 100% garantida',
      icon: '🛡️',
      description: 'Veículo blindado particular e segurança discreto para viagens e deslocamento aos treinos.'
    },
    {
      id: 'video_analyst',
      name: 'Analista de Desempenho Tático Individual',
      role: 'Análise Tática & Posicionamento',
      category: 'tactics',
      hireCost: 4200,
      monthlyCostBase: 1050,
      benefitText: '+1 em Passe/Visão de Jogo (visão tática avançada de posicionamento)',
      icon: '📹',
      description: 'Análise detalhada de movimentação adversária, mapas de calor e leitura de jogo moderna.'
    },
    {
      id: 'accountant',
      name: 'Consultor Financeiro & Contador Pessoal',
      role: 'Gestão Patrimonial & Tributária',
      category: 'finance',
      hireCost: 5000,
      monthlyCostBase: 1300,
      benefitText: 'Reduz em 15% a manutenção de bens/veículos e aumenta rendimentos do CDB de 1.1% para 1.5%/mês',
      icon: '💼',
      description: 'Planejamento financeiro de carreira, elisão fiscal legal e blindagem de patrimônio esportivo.'
    }
  ];

  /**
   * Obtém o empresário ativo do jogador (com fallback seguro)
   */
  function getPlayerAgent(pState){
    if(!pState) return AGENTS_CATALOG[0];
    if(pState.agent && pState.agent.id){
      const found = AGENTS_CATALOG.find(a => a.id === pState.agent.id);
      if(found) return { ...pState.agent, ...found };
      return pState.agent;
    }
    pState.agent = { ...AGENTS_CATALOG[0] };
    return pState.agent;
  }

  /**
   * Calcula o custo de manutenção de estilo de vida do jogador (Lifestyle Creep)
   * À medida que o atleta sobe de divisão e de fama, os custos de moradia, assessoria contábil,
   * transporte e padrão de vida sobem organicamente igual na vida real.
   */
  function calculatePlayerLifestyleCost(pState, athleteOvr){
    const ovr = Number(athleteOvr || pState?.athleteOvr || 45);
    const followers = Number(pState?.socialMedia?.followers || 500);

    // Custo base de moradia e estilo de vida por patamar da carreira
    let baseCost = 350; // Aspirante / Base (moradia humilde / república)
    if(ovr >= 85){
      baseCost = 65000; // Ícone mundial / Craque galáctico (mansão internacional, assessoria jurídica de topo)
    } else if(ovr >= 78){
      baseCost = 28000; // Estrela Internacional (condomínio fechado na Europa, transporte executivo)
    } else if(ovr >= 70){
      baseCost = 10000; // Destaque Série A (apartamento alto padrão, condomínio de luxo)
    } else if(ovr >= 62){
      baseCost = 3500;  // Destaque Série B / C (bom apartamento, custos de manutenção)
    } else if(ovr >= 52){
      baseCost = 1200;  // Profissional estabelecido (aluguel próprio, custos de vida)
    }

    // Impacto de bens de luxo adquiridos (IPTU, IPVA, seguros e manutenção)
    const luxuryCount = Array.isArray(pState?.luxuryItems) ? pState.luxuryItems.length : 0;
    const luxuryMaintenance = luxuryCount * 500;

    // Custo adicional de celebridade (segurança, logística pública)
    const fameCost = followers > 100000 ? 5000 : (followers > 20000 ? 1500 : 0);

    return Math.round(baseCost + luxuryMaintenance + fameCost);
  }

  /**
   * Calcula o custo mensal total do staff pessoal contratado
   * Profissionais de ponta escalonam seus honorários conforme a estrela do atleta sobe
   */
  function calculateHiredStaffMonthlyCost(pState, athleteOvr){
    if(!pState) return 0;
    const ovr = Number(athleteOvr || pState.athleteOvr || 45);
    // Profissionais cobram multiplicador de prestígio de 1.0x (base) até 2.2x (craque mundial)
    const ovrFactor = Math.max(1, 1 + (ovr - 45) * 0.03);

    let total = 0;
    const hired = pState.hiredStaff || {};

    // Sincronização e retrocompatibilidade com flags legadas
    if(pState.lifestylePerks?.personalTrainer && !hired.personal_trainer) hired.personal_trainer = true;
    if(pState.lifestylePerks?.physio && !hired.physio) hired.physio = true;
    if(pState.lifestylePerks?.pressAgent && !hired.marketing_team) hired.marketing_team = true;
    pState.hiredStaff = hired;

    STAFF_CATALOG.forEach(st => {
      if(hired[st.id]){
        total += Math.round(st.monthlyCostBase * ovrFactor);
      }
    });

    return total;
  }

  /**
   * Contrata ou troca de empresário
   */
  function hirePlayerAgent(gameState, agentId){
    if(!gameState || !gameState.playerCareerState) return { success: false, message: 'Estado inválido.' };
    const pState = gameState.playerCareerState;
    const athlete = (gameState.squad || []).find(p => p.id === gameState.controlledPlayerId) || {};
    const ovr = Math.max(Number(athlete.ovr) || 0, Number(pState.athleteOvr) || 0, 45);
    const followers = Number(pState.socialMedia?.followers || 500);

    const targetAgent = AGENTS_CATALOG.find(a => a.id === agentId);
    if(!targetAgent) return { success: false, message: 'Empresário não encontrado no catálogo.' };

    if(pState.agent?.id === targetAgent.id){
      return { success: false, message: 'Você já é representado por este empresário!' };
    }

    if(ovr < targetAgent.minOvr){
      return { success: false, message: `Overall insuficiente! ${targetAgent.name} exige no mínimo OVR ${targetAgent.minOvr} para assinar representação.` };
    }

    if(followers < targetAgent.minFollowers){
      return { success: false, message: `Base de fãs insuficiente! ${targetAgent.name} exige no mínimo ${targetAgent.minFollowers.toLocaleString('pt-BR')} seguidores no FootGram.` };
    }

    const previousAgentName = pState.agent?.name || 'Gestão Familiar';
    pState.agent = { ...targetAgent };

    gameState.news = Array.isArray(gameState.news) ? gameState.news : [];
    gameState.news.unshift(`💼 MERCADO DA BOLA: ${pState.athleteName} trocou de representação! O atleta agora é agenciado por ${targetAgent.name} (${targetAgent.agency}), buscando novos voos na carreira.`);

    return {
      success: true,
      message: `Contrato de representação assinado com sucesso com ${targetAgent.name}! Salário mensal: R$ ${targetAgent.monthlySalary.toLocaleString('pt-BR')}.`,
      agent: targetAgent
    };
  }

  /**
   * Contrata membro de staff pessoal
   */
  function hireStaffMember(gameState, staffId){
    if(!gameState || !gameState.playerCareerState) return { success: false, message: 'Estado inválido.' };
    const pState = gameState.playerCareerState;
    const bank = Number(pState.personalBank) || 0;

    const staff = STAFF_CATALOG.find(s => s.id === staffId);
    if(!staff) return { success: false, message: 'Membro de staff não encontrado.' };

    pState.hiredStaff = pState.hiredStaff || {};
    if(pState.hiredStaff[staffId]){
      return { success: false, message: `${staff.name} já faz parte da sua equipe pessoal!` };
    }

    if(bank < staff.hireCost){
      return { success: false, message: `Saldo insuficiente na conta pessoal! Custo de contratação: R$ ${staff.hireCost.toLocaleString('pt-BR')}. Seu saldo: R$ ${bank.toLocaleString('pt-BR')}.` };
    }

    pState.personalBank -= staff.hireCost;
    pState.hiredStaff[staffId] = true;

    // Sincroniza retrocompatibilidade
    pState.lifestylePerks = pState.lifestylePerks || {};
    if(staffId === 'personal_trainer') pState.lifestylePerks.personalTrainer = true;
    if(staffId === 'physio') pState.lifestylePerks.physio = true;
    if(staffId === 'marketing_team') pState.lifestylePerks.pressAgent = true;

    gameState.news = Array.isArray(gameState.news) ? gameState.news : [];
    gameState.news.unshift(`⭐ STAFF PESSOAL: ${pState.athleteName} contratou ${staff.name} para sua comissão particular. Investimento inicial de R$ ${staff.hireCost.toLocaleString('pt-BR')} quitado.`);

    return {
      success: true,
      message: `${staff.name} contratado com sucesso!`,
      staff
    };
  }

  /**
   * Dispensa membro de staff pessoal para cortar custos mensais
   */
  function dismissStaffMember(gameState, staffId){
    if(!gameState || !gameState.playerCareerState) return { success: false, message: 'Estado inválido.' };
    const pState = gameState.playerCareerState;
    pState.hiredStaff = pState.hiredStaff || {};

    const staff = STAFF_CATALOG.find(s => s.id === staffId);
    const staffName = staff ? staff.name : staffId;

    if(!pState.hiredStaff[staffId]){
      return { success: false, message: `${staffName} não está contratado na sua equipe.` };
    }

    pState.hiredStaff[staffId] = false;

    // Sincroniza retrocompatibilidade
    pState.lifestylePerks = pState.lifestylePerks || {};
    if(staffId === 'personal_trainer') pState.lifestylePerks.personalTrainer = false;
    if(staffId === 'physio') pState.lifestylePerks.physio = false;
    if(staffId === 'marketing_team') pState.lifestylePerks.pressAgent = false;

    gameState.news = Array.isArray(gameState.news) ? gameState.news : [];
    gameState.news.unshift(`📋 GESTÃO DE CARREIRA: ${pState.athleteName} encerrou o vínculo com ${staffName} para otimizar seus custos mensais.`);

    return {
      success: true,
      message: `${staffName} dispensado. O custo mensal não será cobrado no próximo ciclo financeiro.`
    };
  }

  // Catálogo de Bens de Vida & Staff Pessoal (Retrocompatibilidade)
  const LIFESTYLE_CATALOG = [
    {
      id: 'personal_trainer',
      name: 'Personal Trainer Especializado',
      category: 'staff',
      cost: 3500,
      monthlyCost: 1000,
      benefit: '+15% de bônus em todo ganho de XP semanal e pós-jogos',
      icon: '🏋️‍♂️'
    },
    {
      id: 'physio',
      name: 'Fisioterapeuta & Recovery Exclusivo',
      category: 'staff',
      cost: 4500,
      monthlyCost: 1200,
      benefit: 'Reduz a perda de energia em 30% nas partidas e acelera descanso',
      icon: '🩺'
    },
    {
      id: 'press_agent',
      name: 'Assessoria de Imprensa & Mídia',
      category: 'staff',
      cost: 4000,
      monthlyCost: 1100,
      benefit: 'Protege a moral contra vaias e impulsiona o prestígio público (+Fama)',
      icon: '🎙️'
    },
    {
      id: 'luxury_boots',
      name: 'Chuteira Ouro Edição Especial',
      category: 'luxury',
      cost: 2800,
      benefit: '+2 de Chute e estilo nos gramados',
      icon: '👟'
    },
    {
      id: 'gaming_rig',
      name: 'Setup Gamer & Simulador no Quarto',
      category: 'luxury',
      cost: 6500,
      benefit: 'Mantém a moral do atleta sempre em alta nos dias de folga',
      icon: '🎮'
    },
    {
      id: 'first_car',
      name: 'Primeiro Carro Esportivo',
      category: 'luxury',
      cost: 38000,
      benefit: 'Chegada triunfal ao CT e grande respeito entre os companheiros',
      icon: '🚗'
    },
    {
      id: 'luxury_apt',
      name: 'Apartamento de Frente para a Praia',
      category: 'luxury',
      cost: 220000,
      benefit: 'Máximo conforto, descanso restaurador e símbolo de consagração',
      icon: '🏢'
    }
  ];

  /**
   * Calcula o Overall médio a partir dos 6 atributos
   */
  function calculatePlayerOverall(attrs, pos){
    if(!attrs) return 35;
    const v = Number(attrs.vel) || 35;
    const c = Number(attrs.chu) || 35;
    const p = Number(attrs.pas) || 35;
    const d = Number(attrs.dri) || 35;
    const df = Number(attrs.def) || 35;
    const f = Number(attrs.fis) || 35;

    switch((pos || 'ATA').toUpperCase()){
      case 'GOL': return Math.round(df * 0.45 + f * 0.35 + p * 0.2);
      case 'ZAG': return Math.round(df * 0.45 + f * 0.35 + v * 0.12 + p * 0.08);
      case 'LAT': return Math.round(v * 0.3 + df * 0.25 + p * 0.25 + d * 0.2);
      case 'VOL': return Math.round(df * 0.35 + p * 0.3 + f * 0.25 + d * 0.1);
      case 'MEI': return Math.round(p * 0.4 + d * 0.3 + c * 0.2 + v * 0.1);
      case 'PON': return Math.round(v * 0.4 + d * 0.35 + c * 0.15 + p * 0.1);
      case 'ATA': return Math.round(c * 0.45 + d * 0.2 + v * 0.2 + f * 0.15);
      default:    return Math.round((v + c + p + d + df + f) / 6);
    }
  }

  function getSponsorBootBonus(sponsor){
    if(!sponsor) return 0;
    const key = `${sponsor.id || ''} ${sponsor.brand || ''}`.toLowerCase();
    const tier = sponsor.tier || (Number(sponsor.minOvr) >= 85 || key.includes('superstar') ? 'superstar' : Number(sponsor.minOvr) >= 75 || key.includes('internacional') ? 'internacional' : Number(sponsor.minOvr) >= 65 || key.includes('nacional') ? 'nacional' : Number(sponsor.minOvr) >= 55 || key.includes('aspirante') ? 'aspirante' : 'base');
    return { base: 1, aspirante: 2, nacional: 3, internacional: 4, superstar: 5 }[tier] || 1;
  }

  function getSponsorTerminationFee(contract, currentDate){
    if(!contract) return 0;
    const monthlyAmount = Number(contract.monthlyStipend || contract.monthly) || 0;
    const monthly = Number.isFinite(monthlyAmount) ? Math.max(0, monthlyAmount) : 0;
    const days = contract.endDate && currentDate ? getDaysBetween(currentDate, contract.endDate) : Number(contract.daysRemaining) || Number(contract.totalDays) || 0;
    const remainingDays = Math.max(0, Number.isFinite(days) ? days : 0);
    const configuredPct = contract.terminationFeePct;
    const feePctValue = Number(configuredPct);
    const feePct = Math.min(100, Math.max(0, configuredPct != null && configuredPct !== '' && Number.isFinite(feePctValue) ? feePctValue : 50));
    return Math.round(monthly * remainingDays / 30 * feePct / 100);
  }

  function signSponsorContract(pState, offer, currentDate){
    if(!pState || !offer) return { ok: false, terminationFee: 0 };
    const terminationFee = getSponsorTerminationFee(pState.sponsorContract, currentDate);
    const balance = Math.max(0, Number(pState.personalBank) || 0);
    if(terminationFee > balance) return { ok: false, terminationFee, shortfall: terminationFee - balance };

    const startDate = /^\d{4}-\d{2}-\d{2}$/.test(String(currentDate || '')) ? currentDate : '2026-01-18';
    const durationDays = Math.max(30, Math.min(730, Math.round(Number(offer.durationDays) || 180)));
    const endDate = addDaysToIso(startDate, durationDays);
    const monthlyStipend = Math.max(0, Math.round(Number(offer.monthlyStipend || offer.monthly) || 1000));
    pState.personalBank = balance - terminationFee;
    pState.sponsorContract = {
      id: offer.id,
      name: offer.name || offer.clubOrBrand || `${offer.brand || 'Fornecedor'} Sports`,
      brand: offer.brand || 'Penalty',
      tier: offer.tier || (Number(offer.minOvr) >= 85 ? 'superstar' : Number(offer.minOvr) >= 75 ? 'internacional' : Number(offer.minOvr) >= 65 ? 'nacional' : Number(offer.minOvr) >= 55 ? 'aspirante' : 'base'),
      minOvr: Number(offer.minOvr) || 0,
      monthlyStipend,
      bonusGoal: Math.max(0, Math.round(Number(offer.bonusGoal) || 500)),
      bonusWin: Math.max(0, Math.round(Number(offer.bonusWin) || 500)),
      bonusAssist: Math.max(0, Math.round(Number(offer.bonusAssist) || Math.round((Number(offer.bonusGoal) || 500) * 0.7))),
      startDate,
      totalDays: durationDays,
      endDate,
      daysRemaining: durationDays,
      terminationFeePct: 50,
      matchesDuringContract: 0,
      goalsDuringContract: 0,
      assistsDuringContract: 0,
      ratingsList: []
    };
    return { ok: true, terminationFee, durationDays, endDate };
  }

  function terminateSponsorContract(pState, currentDate){
    if(!pState?.sponsorContract) return { ok: false, terminationFee: 0 };
    const terminationFee = getSponsorTerminationFee(pState.sponsorContract, currentDate);
    const balance = Math.max(0, Number(pState.personalBank) || 0);
    if(terminationFee > balance) return { ok: false, terminationFee, shortfall: terminationFee - balance };
    pState.personalBank = balance - terminationFee;
    pState.sponsorContract = null;
    return { ok: true, terminationFee };
  }

  function getPlayerEffectiveAttributes(gameState, athlete){
    const attrs = { ...(athlete?.attributes || {}) };
    const pState = gameState?.playerCareerState;
    const ls = pState?.lifestyle;

    // 1. Chuteira Equipada e Durabilidade
    if(ls && ls.equippedBootsId && ls.ownedBoots && ls.ownedBoots[ls.equippedBootsId]){
      const bootData = ls.ownedBoots[ls.equippedBootsId];
      if(bootData.durability > 0){
        const catalog = window.AFM_Lifestyle?.AFM_BOOTS_CATALOG || [];
        const boot = catalog.find(b => b.id === ls.equippedBootsId);
        if(boot && boot.stats){
          const p = boot.stats.pace || boot.stats.vel || 0;
          const s = boot.stats.shooting || boot.stats.chu || 0;
          const ps = boot.stats.passing || boot.stats.pas || 0;
          const d = boot.stats.dribbling || boot.stats.dri || 0;
          if(p) attrs.vel = Math.min(99, Math.max(1, (Number(attrs.vel) || 35) + p));
          if(s) attrs.chu = Math.min(99, Math.max(1, (Number(attrs.chu) || 35) + s));
          if(ps) attrs.pas = Math.min(99, Math.max(1, (Number(attrs.pas) || 35) + ps));
          if(d) attrs.dri = Math.min(99, Math.max(1, (Number(attrs.dri) || 35) + d));
        }
      }
    } else {
      const ownsBoots = Array.isArray(pState?.luxuryItems) && pState.luxuryItems.includes('luxury_boots');
      if(ownsBoots && pState.luxuryBootsEquipped !== false){
        const baseShot = Number.isFinite(Number(attrs.chu)) ? Number(attrs.chu) : 35;
        attrs.chu = Math.min(99, Math.max(1, baseShot + 2));
      }
    }

    // 2. Bônus de Fornecedor Esportivo de Chuteiras (Patrocínio de Material Esportivo)
    const sponsorBonus = getSponsorBootBonus(pState?.sponsorContract);
    if(sponsorBonus){
      const baseShot = Number.isFinite(Number(attrs.chu)) ? Number(attrs.chu) : 35;
      attrs.chu = Math.min(99, Math.max(1, baseShot + sponsorBonus));
    }

    // 3. Bônus do Analista de Desempenho Tático Individual (+1 Passe & Visão)
    const hasAnalyst = ls?.hiredStaff?.includes('video_analyst') || pState?.hiredStaff?.video_analyst;
    if(hasAnalyst){
      const basePass = Number.isFinite(Number(attrs.pas)) ? Number(attrs.pas) : 35;
      attrs.pas = Math.min(99, Math.max(1, basePass + 1));
    }

    return attrs;
  }

  /**
   * Efeito de altura e porte nos atributos do atleta (vantagens e desvantagens dinâmicas)
   */
  function calculateBodyModifiers(height, bodyBuild){
    const h = Number(height) || 1.78;
    const mods = { vel: 0, chu: 0, pas: 0, dri: 0, def: 0, fis: 0, texts: [] };

    if(h < 1.70){
      mods.vel += 2;
      mods.dri += 2;
      mods.def -= 1;
      mods.fis -= 1;
      mods.texts.push({ type: 'good', text: 'Baixo: Centro de gravidade baixo, maior arranque e agilidade (+2 Vel, +2 Dri)' });
      mods.texts.push({ type: 'bad', text: 'Baixo: Menor alcance nas bolas aéreas e divididas corporais (-1 Def, -1 Fís)' });
    } else if(h > 1.88){
      mods.fis += 2;
      mods.def += 1;
      mods.chu += 1;
      mods.vel -= 1;
      mods.dri -= 2;
      mods.texts.push({ type: 'good', text: 'Alto: Imponente pelo alto, força em divididas e cabeceio (+2 Fís, +1 Def, +1 Chu)' });
      mods.texts.push({ type: 'bad', text: 'Alto: Menor agilidade em espaços curtos e mudança de direção (-1 Vel, -2 Dri)' });
    } else {
      mods.texts.push({ type: 'neutral', text: 'Altura equilibrada: excelente balanço entre mobilidade e presença física' });
    }

    if(bodyBuild === 'Forte'){
      mods.fis += 2;
      mods.vel -= 1;
      mods.texts.push({ type: 'good', text: 'Porte Forte: Ganho de massa muscular (+2 Físico)' });
    } else if(bodyBuild === 'Magro'){
      mods.vel += 1;
      mods.fis -= 1;
      mods.texts.push({ type: 'good', text: 'Porte Leve: Maior leveza e passadas rápidas (+1 Velocidade)' });
    }

    return mods;
  }

  /**
   * Status do atleta perante o técnico com base em managerTrust (0 a 100)
   */
  function getTrustRole(trust){
    const t = Number(trust) || 0;
    if(t < 30){
      return {
        role: 'Não Relacionado',
        color: '#ef4444',
        badgeClass: 'danger',
        desc: 'Fora da lista de jogos. Precisa treinar dobrado para impressionar a comissão técnica.'
      };
    }
    if(t < 60){
      return {
        role: 'Reserva Imediato',
        color: '#f59e0b',
        badgeClass: 'warning',
        desc: 'Fica no banco e entra com frequência no 2º tempo para mudar a partida.'
      };
    }
    if(t < 85){
      return {
        role: 'Titular Confirmado',
        color: '#10b981',
        badgeClass: 'good',
        desc: 'Começa entre os 11 titulares. Peça de confiança da comissão técnica.'
      };
    }
    return {
      role: 'Estrela & Capitão',
      color: '#a855f7',
      badgeClass: 'primary',
      desc: 'Líder inquestionável e referência técnica do time dentro de campo.'
    };
  }

  /**
   * Simula o Jogo-Treino da Peneira (30 minutos com lances decisivos)
   * Sorteia o clube avaliador de acordo com o nível da peneira escolhida (Série D, C ou B/A)
   * e gera a proposta contratual vinculada rigorosamente à pontuação técnica do atleta.
   */
  function simulateTryoutMatch(tierKey, athleteData){
    const tier = PENEIRA_TIERS[tierKey] || PENEIRA_TIERS['basica'];
    const athleteAttrs = athleteData?.attributes || { vel: 35, chu: 35, pas: 35, dri: 35, def: 35, fis: 35 };
    const ovr = calculatePlayerOverall(athleteAttrs, athleteData?.pos || 'ATA');

    // Avaliação do Olheiro (5.0 a 9.5) com base em atributos e sorte do dia
    const roll = Math.random();
    let scoutRating = 6.0 + (ovr - 35) * 0.12 + (roll * 2.5 - 1.0);
    scoutRating = Math.max(5.0, Math.min(9.5, Number(scoutRating.toFixed(1))));

    // Modificador da dificuldade da peneira
    let chance = tier.approvalBaseChance + (scoutRating >= 7.5 ? 0.10 : scoutRating <= 6.0 ? -0.15 : 0.0);
    chance = Math.max(0.08, Math.min(0.98, chance));

    const approved = Math.random() <= chance;
    const approvalPercent = Math.round(chance * 100);

    // Seleção de Clubes na Sorte de Acordo com a Peneira Escolhida
    const tMap = (typeof window !== 'undefined' && window.COMPETITION_TEAMS) ? window.COMPETITION_TEAMS : {};
    const serieA = (tMap['bra-a'] && tMap['bra-a'].length) ? tMap['bra-a'] : [
      'Athletico Paranaense','Atlético-MG','Bahia','Botafogo','Corinthians','Coritiba','Cruzeiro',
      'Flamengo','Fluminense','Grêmio','Internacional','Mirassol','Palmeiras','Bragantino','Remo',
      'Santos','São Paulo','Vasco da Gama','Vitória'
    ];
    const serieB = (tMap['bra-b'] && tMap['bra-b'].length) ? tMap['bra-b'] : [
      'América-MG','Athletic Club','Atlético-GO','Avaí','Botafogo-SP','Ceará','CRB','Criciúma','Cuiabá',
      'Fortaleza','Goiás','Juventude','Londrina','Náutico','Novorizontino','Operário-PR','Ponte Preta',
      'São Bernardo','Sport','Vila Nova'
    ];
    const serieC = (tMap['bra-c'] && tMap['bra-c'].length) ? tMap['bra-c'] : [
      'Amazonas FC','Anápolis','Barra-SC','Botafogo-PB','Brusque','Caxias','Confiança','Ferroviária',
      'Figueirense','Floresta','Guarani','Inter de Limeira','Itabaiana','Ituano','Maranhão','Maringá',
      'Paysandu','Santa Cruz','Volta Redonda','Ypiranga-RS'
    ];
    const serieD = (tMap['bra-d'] && tMap['bra-d'].length) ? tMap['bra-d'] : [
      'Brasiliense','Gama','Ceilândia','Capital-DF','Real Brasília','Água Santa','Nova Iguaçu','Portuguesa-RJ',
      'Treze','Sousa','Ferroviário','Altos','Iguatu','Manauara','FC Cascavel','Cianorte','Marcílio Dias',
      'Democrata GV','São José-RS','ASA','Aparecidense','Goianésia','Goiatuba','Uberlândia','Betim'
    ];

    let candidatePool = [];
    let divisionName = 'Série D / Acesso Estadual';

    if(tier.id === 'basica'){
      divisionName = 'Série D / Acesso Estadual';
      const uf = athleteData?.stateUf || 'DF';
      const localRegion = BRAZILIAN_REGIONS_DATA[uf];
      const localClubs = (localRegion?.cities || []).flatMap(c => c.clubs).filter(c => !serieA.includes(c) && !serieB.includes(c));
      candidatePool = localClubs.length > 0 ? [...localClubs, ...serieD] : [...serieD];
    } else if(tier.id === 'media'){
      divisionName = 'Série C / Estadual Módulo I';
      candidatePool = [...serieC];
    } else {
      divisionName = 'Séries B e A do Brasileirão';
      candidatePool = [...serieB, ...serieA];
    }

    // Embaralha e seleciona até 3 clubes únicos interessados no atleta
    const shuffledClubs = [...new Set(candidatePool)].sort(() => Math.random() - 0.5);
    const selectedClubNames = shuffledClubs.slice(0, Math.min(3, shuffledClubs.length));
    if(selectedClubNames.length === 0) selectedClubNames.push('Brasiliense');

    // Salário base mensal calculado rigorosamente a partir da nota técnica do teste
    const ratingRatio = Math.max(0, Math.min(1, (scoutRating - 5.5) / 3.5));
    const baseWage = approved 
      ? Math.round(tier.wageRange[0] + ratingRatio * (tier.wageRange[1] - tier.wageRange[0]))
      : 0;

    // Papel inicial no elenco derivado da pontuação e da peneira
    let squadRole = tier.defaultRole;
    if(tier.id === 'basica'){
      squadRole = scoutRating >= 8.0 ? 'Reserva Imediato (Disputa Titularidade)' : 'Reserva Imediato';
    } else if(tier.id === 'media'){
      squadRole = scoutRating >= 8.2 ? 'Reserva Imediato' : 'Reserva (Entra no 2º Tempo)';
    } else if(tier.id === 'elite'){
      squadRole = scoutRating >= 8.8 ? 'Reserva da Equipe Principal' : 'Aspirante / Sub-20';
    }

    // Gera até 3 propostas oficiais com pequenas variações para o jogador escolher
    const clubOffers = selectedClubNames.map((club, idx) => {
      const wageFactor = idx === 0 ? 1.05 : (idx === 1 ? 0.95 : 1.0);
      const offered = approved ? Math.round(Math.max(tier.wageRange[0], baseWage * wageFactor)) : 0;
      return {
        clubName: club,
        division: divisionName,
        wageOffered: offered,
        contractYears: 3,
        squadRole: squadRole,
        initialTrust: tier.initialTrust,
        reputation: idx === 0 ? 'Maior Oferta' : (idx === 1 ? 'Mais Minutos' : 'Equilíbrio')
      };
    });

    const primaryOffer = clubOffers[0] || { clubName: 'Brasiliense', wageOffered: baseWage };
    const drawnClub = primaryOffer.clubName;
    const wageOffered = primaryOffer.wageOffered;

    // Eventos simulados de destaque no jogo treino
    const pos = (athleteData?.pos || 'ATA').toUpperCase();
    const events = [];

    if(pos === 'ATA' || pos === 'PON'){
      events.push('Aos 11 min: Arrancou pela ponta, aplicou corte seco no zagueiro e finalizou firme exigindo grande defesa.');
      events.push('Aos 22 min: Se desmarcou nas costas dos volantes e soltou uma bomba que explodiu no travessão.');
      events.push('Aos 29 min: Pressionou a saída de bola adversária, roubou a posse e tocou com categoria pro companheiro.');
    } else if(pos === 'MEI' || pos === 'VOL'){
      events.push('Aos 8 min: Ditou o ritmo no meio-campo com passes rápidos de primeira e viradas de jogo precisas.');
      events.push('Aos 19 min: Deu um passe açucarado em profundidade que deixou o atacante na cara do gol.');
      events.push('Aos 28 min: Desarmou limpo no círculo central e puxou contragolpe fulminante.');
    } else if(pos === 'ZAG' || pos === 'LAT'){
      events.push('Aos 10 min: Antecipou o atacante rival com desarme cirúrgico pelo chão.');
      events.push('Aos 21 min: Subiu soberano de cabeça para afastar perigo de escanteio na área.');
      events.push('Aos 27 min: Fechou a linha de passe e saiu jogando com cabeça erguida.');
    } else {
      events.push('Aos 12 min: Espalmou chute perigoso à queima-roupa no canto direito.');
      events.push('Aos 24 min: Saiu com autoridade pelo alto em cruzamento na pequena área.');
      events.push('Aos 29 min: Repôs a bola rapidamente com os pés armando contragolpe.');
    }

    const scoutComment = approved ? tier.scoutCommentSuccess : tier.scoutCommentFail;

    return {
      tierKey: tier.id,
      tierName: tier.name,
      clubName: drawnClub,
      division: divisionName,
      approved: approved,
      scoutRating: scoutRating,
      approvalPercent: approvalPercent,
      scoutComment: scoutComment,
      events: events,
      wageOffered: wageOffered,
      contractYears: 3,
      squadRole: squadRole,
      initialTrust: tier.initialTrust,
      clubOffers: clubOffers,
      selectedClubIndex: 0
    };
  }

  /**
   * Inicialização de uma Nova Carreira no Modo Jogador
   */
  function startPlayerCareer(playerData, targetSlot){
    if(!playerData || !playerData.name){
      throw new Error('Dados do atleta incompletos.');
    }

    const clubName = playerData.clubName || 'Brasília';
    // Resolve com precisão absoluta a competição do clube via getClubPrimaryCompetitionId
    const resolvedCompId = (typeof window.getClubPrimaryCompetitionId === 'function')
      ? window.getClubPrimaryCompetitionId(clubName, playerData.compId || null)
      : (playerData.compId || 'bra-est-df');

    // 1. Invoca a base de nova carreira do jogo para gerar o mundo completo (ligas, calendário e tabelas)
    // Preserva 100% da integridade do ecossistema e do Modo Treinador
    if(typeof window.newCareer === 'function'){
      window.newCareer({
        clubName: clubName,
        compId: resolvedCompId,
        slot: targetSlot || 1,
        manager: 'Treinador da IA',
        gameMode: 'player',
        deferInitialSave: true
      });
    }

    const s = window.state || (typeof state !== 'undefined' ? state : null);
    if(!s){
      throw new Error('Falha ao instanciar o mundo para o Modo Jogador.');
    }

    // 2. Define o modo de jogo como 'player' e sincroniza o slot selecionado
    s.gameMode = 'player';
    s.isPlayerMode = true;
    s.userSlot = targetSlot ? Number(targetSlot) : (s.userSlot || 1);
    s.aiCoachControlled = true; // O time do jogador é gerido pela IA do treinador
    if(typeof window !== 'undefined'){
      if(typeof window.setState === 'function') window.setState(s);
      else window.state = s;
    }

    // 3. Monta os atributos finais aplicando modificadores de corpo e pontos distribuídos
    const archKey = playerData.archetype || 'finalizador';
    const baseAttrs = { ...(ARCHETYPES[archKey]?.attrs || { vel:35, chu:35, pas:35, dri:35, def:35, fis:35 }) };
    const bodyMods = calculateBodyModifiers(playerData.height, playerData.bodyBuild);
    const distributed = playerData.pointsDistributed || {};

    const finalAttrs = {
      vel: Math.max(25, Math.min(99, baseAttrs.vel + (bodyMods.vel || 0) + (distributed.vel || 0))),
      chu: Math.max(25, Math.min(99, baseAttrs.chu + (bodyMods.chu || 0) + (distributed.chu || 0))),
      pas: Math.max(25, Math.min(99, baseAttrs.pas + (bodyMods.pas || 0) + (distributed.pas || 0))),
      dri: Math.max(25, Math.min(99, baseAttrs.dri + (bodyMods.dri || 0) + (distributed.dri || 0))),
      def: Math.max(25, Math.min(99, baseAttrs.def + (bodyMods.def || 0) + (distributed.def || 0))),
      fis: Math.max(25, Math.min(99, baseAttrs.fis + (bodyMods.fis || 0) + (distributed.fis || 0)))
    };

    const athleteOvr = calculatePlayerOverall(finalAttrs, playerData.position);
    const controlledId = `player_user_${Date.now()}`;

    // Determina o salário e a confiança inicial a partir da Peneira escolhida
    const tier = PENEIRA_TIERS[playerData.peneiraTier || 'basica'] || PENEIRA_TIERS['basica'];
    const startingWage = playerData.tryoutWage || Math.floor((tier.wageRange[0] + tier.wageRange[1]) / 2);
    const startingTrust = tier.initialTrust || 45;

    // 4. Cria o objeto do atleta real para inserir no elenco do clube
    const athletePlayer = {
      id: controlledId,
      name: playerData.name.trim(),
      nickname: (playerData.nickname || '').trim() || playerData.name.trim(),
      nationality: playerData.nationality || 'Brasil',
      country: playerData.nationality || 'Brasil',
      age: Number(playerData.age) || 15,
      pos: playerData.position || 'ATA',
      position: playerData.position || 'ATA',
      number: Number(playerData.shirtNumber) || 10,
      ovr: athleteOvr,
      overall: athleteOvr,
      attributes: finalAttrs,
      wage: startingWage,
      contractUntil: (Number(s.season) || 2026) + 3,
      club: clubName,
      isControlled: true,
      energy: 100,
      fitness: 100,
      photo: playerData.appearance?.customFacePhoto || playerData.appearance?.facePhoto || null,
      marketValueMi: Math.max(0.1, Number((athleteOvr * 0.02).toFixed(2)))
    };

    // 5. Injeta no elenco do clube escolhido
    s.squad = Array.isArray(s.squad) ? s.squad : [];
    s.squad = s.squad.filter(p => p.id !== controlledId);
    s.squad.unshift(athletePlayer);
    s.controlledPlayerId = controlledId;

    // 6. Estrutura de Estado Exclusiva do Modo Jogador
    s.playerCareerState = {
      athleteName: athletePlayer.name,
      nickname: athletePlayer.nickname,
      nationality: playerData.nationality || 'Brasil',
      internationalStats: {
        caps: 0,
        goals: 0,
        assists: 0,
        cleanSheets: 0,
        mvpCount: 0,
        titles: [],
        history: []
      },
      age: athletePlayer.age,
      birthYear: (Number(s.season) || 2026) - athletePlayer.age,
      lastAgingYear: Number(s.season) || 2026,
      pos: athletePlayer.pos,
      position: athletePlayer.position,
      overall: athleteOvr,
      athleteOvr: athleteOvr,
      attributes: athletePlayer.attributes,
      city: playerData.city || 'Brasília',
      stateUf: playerData.stateUf || 'DF',
      position: athletePlayer.pos,
      archetype: archKey,
      preferredFoot: playerData.preferredFoot || 'Direito',
      height: Number(playerData.height) || 1.78,
      bodyBuild: playerData.bodyBuild || 'Médio',
      shirtNumber: athletePlayer.number,
      peneiraTier: tier.id,
      starterBoot: playerData.appearance?.starterBoot || 'boot_black_classic',
      appearance: playerData.appearance || {
        skinTone: '#c68642',
        hairColor: '#1a1a1a',
        hairStyle: 'Curto',
        facePhoto: null,
        customFacePhoto: null,
        starterBoot: 'boot_black_classic',
        sockStyle: 'Meião alto'
      },
      xp: 0,
      xpToNextLevel: 400,
      level: 1,
      skillPoints: Math.max(0, Number(playerData.remainingSkillPoints) || 0),
      _startingPointsNormalized: true,
      managerTrust: startingTrust,
      personalBank: startingWage, // Primeira mesada / ajuda de custo da família
      weeklySalary: Math.round(startingWage / 4),
      weeklyTrainingFocus: 'finalizacao',
      careerStats: {
        matches: 0,
        minutesPlayed: 0,
        starterCount: 0,
        benchCount: 0,
        goals: 0,
        assists: 0,
        cleanSheets: 0,
        mvpCount: 0,
        unbeatenStreak: 0,
        yellowCards: 0,
        redCards: 0,
        avgRating: 6.5,
        manOfTheMatch: 0,
        titles: [],
        seasonHistory: []
      },
      personality: {
        maverick: 30,
        heartbeat: 30,
        virtuoso: 40
      },
      relationships: {
        boardRelation: 65,
        fansRelation: 70,
        teammatesRelation: 75
      },
      individualAwards: [],
      competitionRecordsBroken: [],
      lastSeasonGalaAwards: null,
      agent: { ...AGENTS_CATALOG[0] }, // Começa com representação familiar (sem taxa fixa)
      hiredStaff: {
        personal_trainer: false,
        physio: false,
        nutritionist: false,
        marketing_team: false,
        mental_coach: false,
        security_driver: false
      },
      financialHistory: [],
      monthlyMatchBonuses: 0,
      agentOffers: [],
      sponsorContract: null,
      lifestylePerks: {
        personalTrainer: false,
        physio: false,
        pressAgent: false
      },
      luxuryItems: [],
      matchRatingHistory: []
    };

    // Inicializa histórico acumulado da carreira
    ensurePlayerCareerHistory(s.playerCareerState, s);

    // Gera proposta de patrocínio inicial regional humilde
    s.playerCareerState.agentOffers.push(createStarterSponsorOffer(athleteOvr, s.date));

    s.news = Array.isArray(s.news) ? s.news : [];
    s.news.unshift(`⭐ JOIA DA BASE: ${athletePlayer.name} (#${athletePlayer.number}), 15 anos, foi aprovado na ${tier.name} e assina seu primeiro vínculo com o ${clubName}!`);

    s.coachName = 'Treinador da IA';
    s.manager = s.coachName;

    // Sincroniza view para a Central do Atleta e força reconstrução da casca
    window.view = 'player_hub';
    const appEl = document.getElementById('app') || document.querySelector('#app');
    if(appEl && appEl.dataset) delete appEl.dataset.renderedGameMode;
    if(typeof window.save === 'function') window.save({ allowModeReplace: true });
    if(typeof window.render === 'function') window.render();

    return s;
  }

  /**
   * Garante a inicialização e integridade do histórico acumulado da carreira
   */
  function ensurePlayerCareerHistory(pState, gameState) {
    if (!pState) return null;
    pState.careerHistory = pState.careerHistory || {};
    const ch = pState.careerHistory;
    if (!ch.totals) {
      ch.totals = {
        games: 0,
        starts: 0,
        minutes: 0,
        goals: 0,
        assists: 0,
        mvp: 0,
        yellowCards: 0,
        redCards: 0,
        ratingSum: 0
      };
    }
    if (!Array.isArray(ch.seasons)) {
      ch.seasons = [];
    }
    if (!('bestMatch' in ch)) {
      ch.bestMatch = null;
    }

    // Sincronização retroativa com careerStats caso totals.games esteja zerado mas já existam partidas no save
    const cStats = pState.careerStats || {};
    if (ch.totals.games === 0 && (cStats.matches > 0 || (pState.matchRatingHistory || []).length > 0)) {
      ch.totals.games = cStats.matches || (pState.matchRatingHistory || []).length || 0;
      ch.totals.starts = cStats.starterCount || 0;
      ch.totals.minutes = cStats.minutesPlayed || 0;
      ch.totals.goals = cStats.goals || 0;
      ch.totals.assists = cStats.assists || 0;
      ch.totals.mvp = cStats.mvpCount || cStats.manOfTheMatch || 0;
      ch.totals.yellowCards = cStats.yellowCards || 0;
      ch.totals.redCards = cStats.redCards || 0;
      ch.totals.ratingSum = Number(((cStats.avgRating || 6.5) * ch.totals.games).toFixed(2));
    }

    // Sincroniza bestMatch se ainda for nulo
    if (!ch.bestMatch && Array.isArray(pState.matchRatingHistory) && pState.matchRatingHistory.length > 0) {
      let best = null;
      pState.matchRatingHistory.forEach(m => {
        const r = Number(m.rating) || 0;
        if (!best || r > (Number(best.rating) || 0)) {
          best = {
            date: m.date || '2026-01-01',
            opponent: m.opponent || 'Adversário',
            score: m.score || '1 x 0',
            goals: Number(m.goals) || 0,
            assists: Number(m.assists) || 0,
            rating: r
          };
        }
      });
      if (best) ch.bestMatch = best;
    }

    return ch;
  }

  /**
   * Resolução da atuação do atleta em uma partida concluída
   */
  function recoverDailyEnergy(gameState, date = gameState?.date || gameState?.currentDate){
    if(!gameState || gameState.gameMode !== 'player' || !gameState.playerCareerState || !date) return null;
    const athlete = (gameState.squad || []).find(player => String(player?.id) === String(gameState.controlledPlayerId));
    if(!athlete || athlete.lastEnergyRecoveryDate === date) return null;
    const currentEnergy = Number(athlete.energy ?? athlete.fitness ?? 100);
    const recovery = 8 + (gameState.playerCareerState.lifestylePerks?.physio ? 3 : 0);
    athlete.energy = Math.min(100, Math.max(0, (Number.isFinite(currentEnergy) ? currentEnergy : 100) + recovery));
    athlete.fitness = athlete.energy;
    athlete.lastEnergyRecoveryDate = date;
    return { energy: athlete.energy, recovered: athlete.energy - (Number.isFinite(currentEnergy) ? currentEnergy : 100) };
  }

  function isPlayerAvailableForMatch(gameState){
    if(gameState?.gameMode !== 'player') return true;
    const athlete = (gameState.squad || []).find(player => String(player?.id) === String(gameState.controlledPlayerId));
    return Boolean(athlete) && Number(athlete.energy ?? athlete.fitness ?? 100) >= 50;
  }

  function processMatchPerformance(gameState, matchResult, { showSummary = true } = {}){
    if(!gameState || gameState.gameMode !== 'player' || !gameState.playerCareerState) return null;
    const pState = gameState.playerCareerState;
    const controlledId = gameState.controlledPlayerId;
    if(controlledId == null) return null;
    const playerObj = (gameState.squad || []).find(p => p.id === controlledId);
    if(!playerObj) return null;
    if(matchResult?.eligibleForMatch === false){
      return { played: false, status: 'Não relacionado por condição física', reason: 'Condição abaixo de 50%; a partida foi simulada enquanto o atleta descansava.', minutes: 0, rating: 0, goals: 0, assists: 0, xpGained: 0, trustDelta: 0, sponsorBonus: 0, isMvp: false };
    }

    const clubName = gameState.club;
    const matchDate = matchResult?.date || matchResult?.matchDate || gameState?.date || gameState?.currentDate || '2026-01-01';
    const isHome = (matchResult?.h === clubName) || (typeof window.norm === 'function' && window.norm(matchResult?.h) === window.norm(clubName));
    const goalsFor = (typeof matchResult?.goalsFor === 'number') ? matchResult.goalsFor : (isHome ? (matchResult?.hg || 0) : (matchResult?.ag || 0));
    const goalsAgainst = (typeof matchResult?.goalsAgainst === 'number') ? matchResult.goalsAgainst : (isHome ? (matchResult?.ag || 0) : (matchResult?.hg || 0));
    const won = (typeof matchResult?.won === 'boolean') ? matchResult.won : (goalsFor > goalsAgainst);
    const draw = (typeof matchResult?.draw === 'boolean') ? matchResult.draw : (goalsFor === goalsAgainst);
    const lost = (typeof matchResult?.lost === 'boolean') ? matchResult.lost : (goalsFor < goalsAgainst);

    // Determina tempo de jogo com base no managerTrust e energia
    const trust = pState.managerTrust || 35;
    let playedMinutes = 0;
    let started = false;
    let benched = false;

    const reportedMinutes = matchResult?.playedMinutes ?? matchResult?.minutesPlayed;
    if(typeof reportedMinutes === 'number'){
      playedMinutes = Math.max(0, Math.min(120, reportedMinutes));
      started = matchResult.started ?? (playedMinutes >= 60);
      benched = !started && playedMinutes > 0;
    } else if(trust < 30){
      // Não relacionado
      return {
        played: false,
        status: 'Não Relacionado',
        reason: 'Decisão tática da comissão técnica.',
        minutes: 0,
        rating: 0,
        xpGained: 25, // XP mínimo de treino com o grupo
        trustDelta: 0
      };
    } else if(trust < 60){
      // Reserva: entra no 2º tempo (aos 60'-70')
      benched = true;
      playedMinutes = Math.floor(Math.random() * 15) + 20; // 20 a 35 minutos
    } else {
      // Titular
      started = true;
      playedMinutes = trust >= 85 ? 90 : (Math.floor(Math.random() * 15) + 75); // 75 a 90 minutos
    }

    if(playedMinutes <= 0){
      return {
        played: false,
        status: matchResult?.status || 'Reserva não utilizado',
        reason: matchResult?.reason || 'Você acompanhou a partida do banco e não entrou em campo.',
        minutes: 0,
        rating: 0,
        goals: 0,
        assists: 0,
        xpGained: 0,
        trustDelta: 0,
        sponsorBonus: 0,
        isMvp: false
      };
    }

    // Calcula nota individual (0.0 a 10.0)
    const ovr = playerObj.ovr || 35;
    const reportedRating = Number(matchResult?.rating);
    let baseRating = Number.isFinite(reportedRating) && reportedRating >= 0
      ? reportedRating
      : 6.0 + (ovr - 35) * 0.05 + (Math.random() * 1.6 - 0.8) + (won ? 0.6 : lost ? -0.6 : 0);

    // Chances de gol e assistência
    let goalsScored = (typeof matchResult?.goals === 'number') ? matchResult.goals : 0;
    let assistsGiven = (typeof matchResult?.assists === 'number') ? matchResult.assists : 0;
    const pos = (playerObj.pos || pState.position || 'ATA').toUpperCase();

    if(typeof matchResult?.goals !== 'number'){
      const goalChanceFactor = Math.min(1, (pos === 'ATA' ? 0.35 : pos === 'PON' ? 0.25 : pos === 'MEI' ? 0.18 : 0.05) * (playedMinutes / 90) * 1.3);
      if(goalsFor > 0 && Math.random() < goalChanceFactor){
        goalsScored = Math.min(goalsFor, Math.random() < 0.2 ? 2 : 1);
      }
    }
    if(goalsScored > 0) baseRating += (goalsScored * 1.2);

    if(typeof matchResult?.assists !== 'number'){
      const assistChanceFactor = Math.min(1, (pos === 'MEI' ? 0.32 : pos === 'PON' ? 0.28 : pos === 'LAT' ? 0.20 : 0.10) * (playedMinutes / 90) * 1.3);
      if(goalsFor > goalsScored && Math.random() < assistChanceFactor){
        assistsGiven = 1;
      }
    }
    if(assistsGiven > 0) baseRating += (assistsGiven * 0.8);

    if((pos === 'ZAG' || pos === 'GOL' || pos === 'VOL') && goalsAgainst === 0){
      baseRating += 1.0;
    }

    const finalRating = Math.max(4.0, Math.min(10.0, Number(baseRating.toFixed(1))));

    // Variação de confiança do técnico (managerTrust)
    let trustDelta = 0;
    if(finalRating >= 8.0) trustDelta = Math.floor(Math.random() * 3) + 4; // +4 a +6
    else if(finalRating >= 7.0) trustDelta = Math.floor(Math.random() * 2) + 2; // +2 a +3
    else if(finalRating >= 6.0) trustDelta = 1;
    else if(finalRating >= 5.0) trustDelta = -2;
    else trustDelta = -4;

    pState.managerTrust = Math.max(0, Math.min(100, (pState.managerTrust || 35) + trustDelta));

    // Cálculo de XP ganho (+20% com Personal Trainer)
    const hasTrainer = pState.lifestylePerks?.personalTrainer || pState.lifestyle?.hiredStaff?.includes('personal_trainer') || pState.hiredStaff?.personal_trainer;
    let xpMultiplier = hasTrainer ? 1.20 : 1.0;
    let xpEarned = Math.round((finalRating * 32 + (goalsScored * 65) + (assistsGiven * 45) + (won ? 35 : 10)) * xpMultiplier);

    pState.xp = (pState.xp || 0) + xpEarned;

    // Checagem de Subida de Nível (Level Up)
    let levelUps = 0;
    levelUps += normalizePlayerProgression(pState);

    // Aplicação de fadiga física (35% menor perda com Fisioterapeuta)
    const hasPhysio = pState.lifestylePerks?.physio || pState.lifestyle?.hiredStaff?.includes('physio') || pState.hiredStaff?.physio;
    const fatigueFactor = hasPhysio ? 0.65 : 1.0;
    const energyLost = Math.round((playedMinutes * 0.28) * fatigueFactor);
    playerObj.energy = Math.max(40, (playerObj.energy || 100) - energyLost);

    // Pagamento de Bônus de Patrocínio Esportivo
    let sponsorBonusMoney = 0;
    if(pState.sponsorContract){
      const sp = pState.sponsorContract;
      if(won && sp.bonusWin) sponsorBonusMoney += sp.bonusWin;
      if(goalsScored > 0 && sp.bonusGoal) sponsorBonusMoney += (goalsScored * sp.bonusGoal);
      if(assistsGiven > 0 && sp.bonusAssist) sponsorBonusMoney += (assistsGiven * sp.bonusAssist);
      
      if(window.AFM_Lifestyle?.addPlayerTransaction && sponsorBonusMoney > 0){
        window.AFM_Lifestyle.addPlayerTransaction(pState, matchDate || gameState?.date, `Bônus de Partida (Patrocínio)`, sponsorBonusMoney, 'in');
      } else {
        pState.personalBank = (pState.personalBank || 0) + sponsorBonusMoney;
      }

      // Monitoramento de desempenho durante o vínculo do contrato de patrocínio
      sp.matchesDuringContract = (sp.matchesDuringContract || 0) + 1;
      sp.goalsDuringContract = (sp.goalsDuringContract || 0) + goalsScored;
      sp.assistsDuringContract = (sp.assistsDuringContract || 0) + assistsGiven;
      sp.ratingsList = Array.isArray(sp.ratingsList) ? sp.ratingsList : [];
      sp.ratingsList.push(finalRating);
    }

    // Efeitos de Estilo de Vida & Chuteiras (desgaste, bônus de gol)
    if(window.AFM_Lifestyle?.processMatchLifestyleEffects){
      window.AFM_Lifestyle.processMatchLifestyleEffects(gameState, { goalsScored, assistsGiven, won }, matchDate || gameState?.date);
    }

    // Atualização das estatísticas da carreira
    const stats = pState.careerStats = pState.careerStats || {};
    stats.matches = (stats.matches || 0) + 1;
    stats.minutesPlayed = (stats.minutesPlayed || 0) + playedMinutes;
    if(started) stats.starterCount = (stats.starterCount || 0) + 1;
    if(benched) stats.benchCount = (stats.benchCount || 0) + 1;
    stats.goals = (stats.goals || 0) + goalsScored;
    stats.assists = (stats.assists || 0) + assistsGiven;
    stats.avgRating = Number((((stats.avgRating || 6.5) * (stats.matches - 1) + finalRating) / stats.matches).toFixed(2));
    stats.averageRating = stats.avgRating;

    // Atualização das estatísticas da temporada atual
    const currentSeasonYear = Number(gameState.season) || 2026;
    pState.seasonStats = pState.seasonStats || {};
    if(pState.seasonStats.season !== currentSeasonYear){
      pState.seasonStats = {
        season: currentSeasonYear,
        club: gameState.club || 'Clube',
        matches: 0,
        minutesPlayed: 0,
        starterCount: 0,
        benchCount: 0,
        goals: 0,
        assists: 0,
        cleanSheets: 0,
        mvpCount: 0,
        avgRating: 6.5,
        averageRating: 6.5,
        unbeatenStreak: 0,
        currentStreak: 0,
        manOfTheMatch: 0,
        shots: 0,
        shotsOnTarget: 0,
        yellowCards: 0,
        redCards: 0
      };
    }
    const sStats = pState.seasonStats;
    sStats.club = gameState.club || sStats.club || 'Clube';
    sStats.matches = (sStats.matches || 0) + 1;
    sStats.minutesPlayed = (sStats.minutesPlayed || 0) + playedMinutes;
    if(started) sStats.starterCount = (sStats.starterCount || 0) + 1;
    if(benched) sStats.benchCount = (sStats.benchCount || 0) + 1;
    sStats.goals = (sStats.goals || 0) + goalsScored;
    sStats.assists = (sStats.assists || 0) + assistsGiven;
    sStats.avgRating = Number((((sStats.avgRating || 6.5) * (sStats.matches - 1) + finalRating) / sStats.matches).toFixed(2));
    sStats.averageRating = sStats.avgRating;

    // 1. Rastreamento de Clean Sheets (Jogos sem sofrer gols para Goleiros e Defensores)
    const isDefenderOrGk = ['GOL', 'GK', 'ZAG', 'CB', 'LAT', 'LB', 'RB', 'LE', 'LD', 'VOL', 'DM'].includes(pos);
    const cleanSheet = isDefenderOrGk && goalsAgainst === 0 && playedMinutes > 0;
    if(cleanSheet){
      stats.cleanSheets = (stats.cleanSheets || 0) + 1;
      sStats.cleanSheets = (sStats.cleanSheets || 0) + 1;
      pState.personality = pState.personality || { maverick: 30, heartbeat: 30, virtuoso: 40 };
      pState.personality.heartbeat = (pState.personality.heartbeat || 30) + 20; // Espírito de liderança/equipe
    }

    // 2. Rastreamento de Sequência Invicta (Unbeaten Streak)
    if(won || draw){
      sStats.currentStreak = (sStats.currentStreak || 0) + 1;
      if(sStats.currentStreak > (sStats.unbeatenStreak || 0)) sStats.unbeatenStreak = sStats.currentStreak;
      if(sStats.currentStreak > (stats.unbeatenStreak || 0)) stats.unbeatenStreak = sStats.currentStreak;
    } else if(lost){
      sStats.currentStreak = 0;
    }

    // 3. Avaliação de Prêmio de Melhor em Campo (MVP Pós-Partida)
    const isMvp = playedMinutes >= 20 && (
      (finalRating >= 8.0 && (goalsScored >= 1 || assistsGiven >= 1)) ||
      (finalRating >= 8.5) ||
      (finalRating >= 8.0 && cleanSheet)
    );

    if(isMvp){
      stats.mvpCount = (stats.mvpCount || 0) + 1;
      sStats.mvpCount = (sStats.mvpCount || 0) + 1;
      stats.manOfTheMatch = (stats.manOfTheMatch || 0) + 1;
      sStats.manOfTheMatch = (sStats.manOfTheMatch || 0) + 1;

      // Bônus imediato de XP por MVP
      const mvpXpBonus = 100;
      xpEarned += mvpXpBonus;
      pState.xp = (pState.xp || 0) + mvpXpBonus;
      levelUps += normalizePlayerProgression(pState);

      // Ganho de confiança do treinador
      pState.managerTrust = Math.min(100, (pState.managerTrust || 35) + 3);
      trustDelta += 3;

      // Pontos de Personalidade (Virtuoso e Maverick)
      pState.personality = pState.personality || { maverick: 30, heartbeat: 30, virtuoso: 40 };
      pState.personality.virtuoso = (pState.personality.virtuoso || 40) + 25;
      pState.personality.maverick = (pState.personality.maverick || 30) + 15;

      // Relacionamento com Diretoria e Torcida
      pState.relationships = pState.relationships || { boardRelation: 65, fansRelation: 70, teammatesRelation: 75 };
      pState.relationships.fansRelation = Math.min(100, (pState.relationships.fansRelation || 70) + 4);
      pState.relationships.boardRelation = Math.min(100, (pState.relationships.boardRelation || 65) + 2);
    }

    const shotsThisMatch = Number.isFinite(Number(matchResult?.shots)) ? Math.max(goalsScored, Number(matchResult.shots)) : (goalsScored > 0 ? (goalsScored + Math.floor(Math.random() * 2) + 1) : (Math.random() < 0.65 ? Math.floor(Math.random() * 2) + 1 : 0));
    const onTargetThisMatch = Number.isFinite(Number(matchResult?.shotsOnTarget)) ? Math.min(shotsThisMatch, Math.max(goalsScored, Number(matchResult.shotsOnTarget))) : Math.min(shotsThisMatch, goalsScored + (Math.random() < 0.5 ? 1 : 0));
    stats.shots = (stats.shots || 0) + shotsThisMatch;
    stats.shotsOnTarget = (stats.shotsOnTarget || 0) + onTargetThisMatch;
    sStats.shots = (sStats.shots || 0) + shotsThisMatch;
    sStats.shotsOnTarget = (sStats.shotsOnTarget || 0) + onTargetThisMatch;

    let yellowCard = false;
    let redCard = false;
    if(Math.random() < 0.12){
      yellowCard = true;
      stats.yellowCards = (stats.yellowCards || 0) + 1;
      sStats.yellowCards = (sStats.yellowCards || 0) + 1;
    }
    if(yellowCard && Math.random() < 0.04){
      redCard = true;
      stats.redCards = (stats.redCards || 0) + 1;
      sStats.redCards = (sStats.redCards || 0) + 1;
    }

    // Histórico de atuações
    pState.matchRatingHistory = pState.matchRatingHistory || [];
    pState.matchRatingHistory.unshift({
      date: gameState.date,
      opponent: isHome ? matchResult?.a : matchResult?.h,
      score: `${goalsFor} x ${goalsAgainst}`,
      rating: finalRating,
      minutes: playedMinutes,
      goals: goalsScored,
      assists: assistsGiven,
      shots: shotsThisMatch,
      shotsOnTarget: onTargetThisMatch,
      yellowCard: yellowCard,
      redCard: redCard,
      isMvp: isMvp,
      cleanSheet: cleanSheet,
      won: won
    });
    pState.matchRatingHistory = pState.matchRatingHistory.slice(0, 30);

    // REGRA IRRESTRITA DE ESTATÍSTICAS E HISTÓRICO: Atualização do histórico acumulado da carreira
    const ch = ensurePlayerCareerHistory(pState, gameState);
    if(ch && ch.totals){
      ch.totals.games = (ch.totals.games || 0) + 1;
      if(started) ch.totals.starts = (ch.totals.starts || 0) + 1;
      ch.totals.minutes = (ch.totals.minutes || 0) + playedMinutes;
      ch.totals.goals = (ch.totals.goals || 0) + goalsScored;
      ch.totals.assists = (ch.totals.assists || 0) + assistsGiven;
      if(isMvp) ch.totals.mvp = (ch.totals.mvp || 0) + 1;
      if(yellowCard) ch.totals.yellowCards = (ch.totals.yellowCards || 0) + 1;
      if(redCard) ch.totals.redCards = (ch.totals.redCards || 0) + 1;
      ch.totals.ratingSum = Number(((ch.totals.ratingSum || 0) + finalRating).toFixed(2));

      // Atualiza melhor partida de todos os tempos se superada
      if(!ch.bestMatch || finalRating > (Number(ch.bestMatch.rating) || 0)){
        ch.bestMatch = {
          date: gameState.date || '2026-01-01',
          opponent: isHome ? matchResult?.a : matchResult?.h,
          score: `${goalsFor} x ${goalsAgainst}`,
          goals: goalsScored,
          assists: assistsGiven,
          rating: finalRating
        };
      }
    }

    // Verificação de quebra de recordes históricos da competição
    const cRec = { mostGoals: 14, mostAssists: 8, unbeatenStreak: 11 };
    pState.competitionRecordsBroken = Array.isArray(pState.competitionRecordsBroken) ? pState.competitionRecordsBroken : [];
    pState.individualAwards = Array.isArray(pState.individualAwards) ? pState.individualAwards : [];

    if(sStats.goals > cRec.mostGoals && !pState.competitionRecordsBroken.some(r => r.type === 'mostGoalsSeason' && r.year === currentSeasonYear)){
      const recItem = {
        type: 'mostGoalsSeason',
        title: 'Recorde Histórico de Gols em uma Temporada',
        compName: gameState.league || 'Campeonato Oficial',
        previousHolder: 'Lenda do Campeonato (14 gols)',
        value: sStats.goals,
        year: currentSeasonYear
      };
      pState.competitionRecordsBroken.push(recItem);
      pState.individualAwards.push({
        id: 'record_goals_' + currentSeasonYear,
        title: 'Recordista Histórico: Artilharia da Competição',
        year: currentSeasonYear,
        icon: '📜',
        desc: `Novo recorde histórico de ${sStats.goals} gols em uma única temporada!`
      });
      pState.xp = (pState.xp || 0) + 500;
      normalizePlayerProgression(pState);
      if(window.AFM_Lifestyle?.addPlayerTransaction){
        window.AFM_Lifestyle.addPlayerTransaction(pState, 15000, 'Premiação por Quebra de Recorde Histórico de Gols (Bônus)', 'in');
      }
    }

    if(sStats.assists > cRec.mostAssists && !pState.competitionRecordsBroken.some(r => r.type === 'mostAssistsSeason' && r.year === currentSeasonYear)){
      const recItem = {
        type: 'mostAssistsSeason',
        title: 'Recorde Histórico de Assistências em uma Temporada',
        compName: gameState.league || 'Campeonato Oficial',
        previousHolder: 'Meia Clássico (8 assistências)',
        value: sStats.assists,
        year: currentSeasonYear
      };
      pState.competitionRecordsBroken.push(recItem);
      pState.individualAwards.push({
        id: 'record_assists_' + currentSeasonYear,
        title: 'Recordista Histórico: Líder de Assistências',
        year: currentSeasonYear,
        icon: '📜',
        desc: `Novo recorde histórico de ${sStats.assists} assistências em uma única temporada!`
      });
      pState.xp = (pState.xp || 0) + 500;
      normalizePlayerProgression(pState);
      if(window.AFM_Lifestyle?.addPlayerTransaction){
        window.AFM_Lifestyle.addPlayerTransaction(pState, 10000, 'Premiação por Quebra de Recorde Histórico de Assistências (Bônus)', 'in');
      }
    }

    const currentStreakVal = sStats.unbeatenStreak || sStats.currentStreak || 0;
    if(currentStreakVal > cRec.unbeatenStreak && !pState.competitionRecordsBroken.some(r => r.type === 'unbeatenStreak' && r.year === currentSeasonYear)){
      const recItem = {
        type: 'unbeatenStreak',
        title: 'Recorde Histórico de Invencibilidade Consecutiva',
        compName: gameState.league || 'Campeonato Oficial',
        previousHolder: 'Esquadrão Imbatível (11 partidas)',
        value: currentStreakVal,
        year: currentSeasonYear
      };
      pState.competitionRecordsBroken.push(recItem);
      pState.individualAwards.push({
        id: 'record_streak_' + currentSeasonYear,
        title: 'Recordista Histórico: Sequência Invicta',
        year: currentSeasonYear,
        icon: '📜',
        desc: `Incríveis ${currentStreakVal} jogos consecutivos sem derrota!`
      });
      pState.xp = (pState.xp || 0) + 500;
      normalizePlayerProgression(pState);
      if(window.AFM_Lifestyle?.addPlayerTransaction){
        window.AFM_Lifestyle.addPlayerTransaction(pState, 12000, 'Premiação por Quebra de Recorde Histórico de Invencibilidade (Bônus)', 'in');
      }
    }

    const performanceReport = {
      played: true,
      status: started ? 'Titular' : 'Entrou no 2º Tempo',
      minutes: playedMinutes,
      rating: finalRating,
      goals: goalsScored,
      assists: assistsGiven,
      xpGained: xpEarned,
      trustDelta: trustDelta,
      newTrust: pState.managerTrust,
      levelUps: levelUps,
      sponsorBonus: sponsorBonusMoney,
      opponent: isHome ? matchResult?.a : matchResult?.h,
      resultText: `${goalsFor} x ${goalsAgainst}`,
      isMvp: isMvp,
      cleanSheet: cleanSheet
    };

    // Registra notícias autênticas e imediatas de atuação do atleta
    gameState.news = Array.isArray(gameState.news) ? gameState.news : [];
    const opp = isHome ? matchResult?.a : matchResult?.h;
    let matchHeadline = '';
    if(goalsScored >= 3){
      matchHeadline = `🔥 HAT-TRICK HISTÓRICO! ${pState.athleteName} destrói a zaga do ${opp}, anota 3 gols e leva o ${gameState.club} à vitória! Nota: ${finalRating.toFixed(1)} ⭐ (Craque do Jogo)`;
    } else if(goalsScored === 2){
      matchHeadline = `⚽ DOBRADINHA DE OURO! ${pState.athleteName} marca 2 gols contra o ${opp} e comanda a festa da torcida do ${gameState.club}! Nota: ${finalRating.toFixed(1)}`;
    } else if(goalsScored === 1 && assistsGiven >= 1){
      matchHeadline = `⭐ ATUAÇÃO DE GALA: ${pState.athleteName} balança as redes e dá assistência mágica contra o ${opp}! Nota: ${finalRating.toFixed(1)}`;
    } else if(goalsScored === 1){
      matchHeadline = `⚽ GOL DE CRAQUE! ${pState.athleteName} deixa sua marca contra o ${opp} com finalização precisa! Nota: ${finalRating.toFixed(1)}`;
    } else if(assistsGiven >= 1){
      matchHeadline = `🎯 PASSE DE MESTRE: ${pState.athleteName} dá assistência açucarada e brilha contra o ${opp}! Nota: ${finalRating.toFixed(1)}`;
    } else if(finalRating >= 7.5){
      matchHeadline = `🌟 DESTAQUE EM CAMPO: ${pState.athleteName} faz partida sólida de ${playedMinutes}' contra o ${opp}. Nota do treinador: ${finalRating.toFixed(1)}`;
    } else if(finalRating >= 6.5){
      matchHeadline = `📋 REGULARIDADE: ${pState.athleteName} cumpre seu papel tático na partida contra o ${opp}. Nota: ${finalRating.toFixed(1)}`;
    } else {
      matchHeadline = `⚠️ DIA DIFÍCIL: ${pState.athleteName} encontrou forte marcação contra o ${opp}. O atleta promete dedicação dobrada nos próximos treinos.`;
    }
    gameState.news.unshift(matchHeadline);

    if(trustDelta >= 5){
      gameState.news.unshift(`📈 MORAL COM O PROFESSOR: Treinador elogia a entrega de ${pState.athleteName}: "Menino de ouro, com essa raça vai longe!" (Confiança: ${pState.managerTrust}%)`);
    } else if(trustDelta <= -5){
      gameState.news.unshift(`📉 COBRANÇA TÁTICA: Treinador cobrou mais atenção de ${pState.athleteName} nas instruções: "Precisa recompor melhor" (Confiança: ${pState.managerTrust}%)`);
    }

    if(sponsorBonusMoney > 0){
      gameState.news.unshift(`👟 BÔNUS DE CHUTEIRA: Patrocinadora depositou bônus de performance de R$ ${sponsorBonusMoney.toLocaleString('pt-BR')} na conta de ${pState.athleteName} por gols marcados!`);
    }

    // =========================================================================
    // MERCADO DA BOLA NO MODO JOGADOR: PROPOSTAS DE CLUBES APENAS NA JANELA
    // =========================================================================
    const isWindowOpen = (typeof isTransferWindowOpen === 'function')
      ? isTransferWindowOpen(gameState.date)
      : (function(dStr){
          if(!dStr) return false;
          const parts = String(dStr).split('-');
          if(parts.length < 3) return false;
          const m = parseInt(parts[1], 10);
          const d = parseInt(parts[2], 10);
          return (m === 1 || m === 2 || (m === 3 && d <= 1) || m === 6 || m === 7 || (m === 8 && d <= 1));
        })(gameState.date);

    pState.agentOffers = Array.isArray(pState.agentOffers) ? pState.agentOffers : [];

    if(!isWindowOpen){
      // Fora da janela: propostas de clubes expiram e são arquivadas pelo empresário
      const activeClubOffers = pState.agentOffers.filter(o => o.type === 'transfer' || o.type === 'club_loan');
      if(activeClubOffers.length > 0){
        pState.agentOffers = pState.agentOffers.filter(o => o.type !== 'transfer' && o.type !== 'club_loan');
        gameState.news.unshift(`🔒 MERCADO DA BOLA: A janela de transferências encerrou. As propostas de clubes foram arquivadas pelo empresário até a próxima janela aberta.`);
      }
    } else {
      // DENTRO DA JANELA: Propostas de clubes chegam durante a disputa das rodadas!
      const activeClubOffersCount = pState.agentOffers.filter(o => o.type === 'transfer' || o.type === 'club_loan').length;
      if(activeClubOffersCount < 3){
        const activeListing = pState.transferListing?.status === 'active' ? pState.transferListing : null;
        const hasTransferReq = activeListing ? activeListing.type === 'transfer' : Boolean(pState.actionRequests?.request_transfer?.active);
        const hasLoanReq = activeListing ? activeListing.type === 'loan' : Boolean(pState.actionRequests?.request_loan?.active);
        let bidChance = 0.025;
        if(hasTransferReq || hasLoanReq) bidChance += 0.10;
        if(finalRating >= 8.0) bidChance += 0.08;
        else if(finalRating >= 7.5) bidChance += 0.04;
        if(goalsScored >= 1 || assistsGiven >= 1) bidChance += 0.05;
        if(pState.marketBuzzActive) bidChance += 0.04;

        if(Math.random() < Math.min(0.25, bidChance)){
          const athleteObj = (gameState.squad || []).find(p => p.id === gameState.controlledPlayerId);
          const athleteOvr = Number(athleteObj?.ovr) || Number(athleteObj?.overall) || Number(athleteObj?.fc) || Number(pState.athleteOvr) || Number(pState.overall) || 0;
          const currentClub = gameState.club;
          let candidateClubs = [];

          // Fama aumenta contatos, mas o overall ainda limita o nível esportivo dos interessados.
          const sm = pState.socialMedia || {};
          const isHighCelebrity = Boolean(sm.celebrityLevel >= 35 || sm.followers >= 40000);

          if(athleteOvr < 40){
            candidateClubs = ['Real Brasília', 'Ceilândia', 'Capital-DF', 'Paranoá', 'Samambaia', 'Sobradinho', 'Santa Maria', 'Planaltina', 'Gama', 'Brasiliense'];
          } else if(athleteOvr < 50){
            candidateClubs = ['Ceilândia', 'Capital-DF', 'Gama', 'Brasiliense', 'Volta Redonda', 'Botafogo-PB', 'Figueirense', 'Remo', 'Paysandu', 'Náutico', 'CSA', 'Caxias'];
          } else if(athleteOvr < 60){
            candidateClubs = ['Volta Redonda', 'Botafogo-PB', 'Figueirense', 'Remo', 'Paysandu', 'Náutico', 'CSA', 'Caxias', 'Athletic Club', 'Ferroviário', 'Confiança', 'Ypiranga'];
          } else if(athleteOvr < 70){
            candidateClubs = ['Sport', 'Coritiba', 'Goiás', 'Ceará', 'Vila Nova', 'América-MG', 'Avaí', 'Chapecoense', 'Novorizontino', 'Mirassol', 'Operário', 'Ponte Preta'];
          } else if(athleteOvr < 80){
            candidateClubs = ['Flamengo', 'Palmeiras', 'São Paulo', 'Atlético-MG', 'Grêmio', 'Internacional', 'Fluminense', 'Botafogo', 'Corinthians', 'Cruzeiro', 'Bahia', 'Vasco', 'Benfica', 'Porto', 'Sporting', 'Ajax', 'PSV', 'Lyon'];
          } else if(athleteOvr < 85){
            candidateClubs = ['Flamengo', 'Palmeiras', 'Benfica', 'Porto', 'Sporting', 'Ajax', 'PSV', 'Lyon', 'Marseille', 'Sevilla', 'Tottenham', 'Borussia Dortmund', 'AC Milan'];
          } else {
            candidateClubs = ['Real Madrid', 'Barcelona', 'Manchester City', 'Arsenal', 'Liverpool', 'Chelsea', 'Paris Saint-Germain', 'Bayern de Munique', 'Juventus', 'Inter de Milão', 'Al-Hilal', 'Al-Nassr', 'Al-Ittihad', 'Flamengo', 'Palmeiras'];
          }

          const eligible = candidateClubs.filter(c => norm(c) !== norm(currentClub));
          if(eligible.length > 0){
            const saudiClubs = eligible.filter(c => ['al-hilal','al-nassr','al-ittihad','al-ahli','al-sadd'].includes(norm(c)));
            const buyerClub = athleteOvr >= 78 && saudiClubs.length && Math.random() < 0.20
              ? saudiClubs[Math.floor(Math.random() * saudiClubs.length)]
              : eligible[Math.floor(Math.random() * eligible.length)];
            const isLoan = activeListing ? activeListing.type === 'loan' : (hasLoanReq && !hasTransferReq) || (athleteOvr < 52 && Math.random() < 0.6);
            const currentWage = athleteObj?.wage || (pState.weeklySalary ? pState.weeklySalary * 4 : 1500);
            const isSaudiOffer = saudiClubs.includes(buyerClub);
            const agent = getPlayerAgent(pState);
            const negotiationMultiplier = Number(agent?.wageMultiplier) || 1;
            const wageMultiplier = (isSaudiOffer ? 1.25 : isLoan ? 1.03 : 1.08) + Math.random() * (isSaudiOffer ? 0.40 : 0.18);
            const baseWageMin = athleteOvr < 40 ? 900 : athleteOvr < 50 ? 1300 : athleteOvr < 60 ? 2500 : athleteOvr < 70 ? 6000 : athleteOvr < 80 ? 15000 : athleteOvr < 85 ? 35000 : 70000;
            const saudiWageMin = athleteOvr >= 90 ? 100000 : 50000;
            const offeredWage = Math.round(Math.max(currentWage * wageMultiplier * negotiationMultiplier, isSaudiOffer ? saudiWageMin : baseWageMin));
            const durationYears = isLoan ? 1 : (2 + Math.floor(Math.random() * 2));
            const buyoutClause = Math.round((offeredWage * 12 * durationYears) * 3);

            const newOffer = {
              id: 'offer_club_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
              type: isLoan ? 'club_loan' : 'transfer',
              clubOrBrand: buyerClub,
              newClub: buyerClub,
              title: isLoan ? `Empréstimo: ${buyerClub}` : `Compra Definitiva: ${buyerClub}`,
              details: isLoan
                ? `Vínculo de ${durationYears} temporada • Salário de R$ ${offeredWage.toLocaleString('pt-BR')}/mês • Minutagem de titular garantida`
                : `Contrato de ${durationYears} anos • Salário de R$ ${offeredWage.toLocaleString('pt-BR')}/mês • Multa R$ ${buyoutClause.toLocaleString('pt-BR')}${isSaudiOffer ? ' • Oferta internacional da Arábia Saudita' : isHighCelebrity ? ' • Atraído pelo apelo midiático no FootGram!' : ''}`,
              wage: offeredWage,
              durationYears: durationYears,
              buyoutClause: buyoutClause,
              region: isSaudiOffer ? 'saudi' : 'other',
              date: gameState.date,
              isRead: false
            };

            pState.agentOffers.unshift(newOffer);
            if(pState.marketBuzzActive) pState.marketBuzzActive = false;
            gameState.news.unshift(`💼 PROPOSTA NA MESA: O ${buyerClub} formalizou proposta de ${isLoan ? 'empréstimo' : 'compra definitiva'} para seu empresário! Salário: R$ ${offeredWage.toLocaleString('pt-BR')}/mês.${isSaudiOffer ? ' (Oferta internacional com salário elevado.)' : isHighCelebrity ? ' (Clube atraído pelo seu destaque no FootGram.)' : ''} Acesse Empresário & Mercado para avaliar.`);
            window.AFM_SocialMedia?.publishTransferProposal?.(gameState, newOffer);
            if(typeof window.toast === 'function'){
              window.toast(`💼 Nova proposta na mesa do empresário: ${buyerClub}!`);
            }
          }
        }
      }
    }

    // Atualiza impacto de seguidores, fama e repercussão no FootGram
    if(typeof window !== 'undefined' && window.AFM_SocialMedia?.processPostMatchSocialImpact){
      window.AFM_SocialMedia.processPostMatchSocialImpact(gameState, matchResult, performanceReport);
    }

    // Abre o Modal Interativo de Resumo pós-partida
    if(showSummary && typeof window.AFM_PlayerMode?.showPostMatchSummaryModal === 'function'){
      window.AFM_PlayerMode.showPostMatchSummaryModal(performanceReport);
    }

    return performanceReport;
  }

  /**
   * Avanço de treino semanal (concede XP passivo conforme o foco)
   */
  function processWeeklyTraining(gameState){
    if(!gameState || gameState.gameMode !== 'player' || !gameState.playerCareerState) return;
    const pState = gameState.playerCareerState;
    const bonusMultiplier = pState.lifestylePerks?.personalTrainer ? 1.15 : 1.0;
    const xpPassivo = Math.round(75 * bonusMultiplier);

    pState.xp = (pState.xp || 0) + xpPassivo;

    normalizePlayerProgression(pState);

    const focusLabels = {
      finalizacao: 'Finalização & Chutes',
      passe: 'Passe & Criação',
      drible: 'Drible & Agilidade',
      fisico: 'Físico & Resistência',
      defesa: 'Desarme & Marcação'
    };
    const fLabel = focusLabels[pState.weeklyTrainingFocus] || 'Treino Técnico';
    gameState.news = Array.isArray(gameState.news) ? gameState.news : [];
    const clubTag = String(gameState.club || 'CLUBE').toUpperCase();
    if(!gameState.news.some(n => String(n).includes(`focado em ${fLabel}`))){
      gameState.news.unshift(`⚡ CT DO ${clubTag}: ${pState.athleteName} completou semana de treino focado em ${fLabel} (+${xpPassivo} XP). Evolução física e técnica constante!`);
    }
    if (gameState.news.length > 50) gameState.news = gameState.news.slice(0, 50);
  }

  function processMonthlyAttributeTraining(gameState, monthKey = String(gameState?.date || gameState?.currentDate || '').slice(0, 7)){
    if(!gameState || gameState.gameMode !== 'player' || !gameState.playerCareerState) return { success: false, reason: 'invalid_state' };
    const pState = gameState.playerCareerState;
    if(!/^\d{4}-\d{2}$/.test(monthKey) || pState.lastMonthlyAttributeTraining === monthKey){
      return { success: false, reason: 'already_processed' };
    }

    const focusAttributes = {
      finalizacao: ['chu'],
      passe: ['pas'],
      drible: ['dri'],
      fisico: ['vel', 'fis'],
      defesa: ['def']
    };
    const athlete = (gameState.squad || []).find(p => p.id === gameState.controlledPlayerId);
    const attrs = athlete?.attributes;
    const focus = pState.weeklyTrainingFocus || 'finalizacao';
    const targets = (focusAttributes[focus] || []).filter(key => Number(attrs?.[key] ?? 35) < 99);
    pState.lastMonthlyAttributeTraining = monthKey;
    if(!athlete || !attrs || !targets.length || Math.random() >= 0.1){
      return { success: false, reason: targets.length ? 'chance_failed' : 'attribute_capped' };
    }

    const attribute = targets[Math.floor(Math.random() * targets.length)];
    attrs[attribute] = Math.min(99, (Number(attrs[attribute]) || 35) + 1);
    const effectiveAttrs = getPlayerEffectiveAttributes(gameState, athlete);
    athlete.ovr = calculatePlayerOverall(effectiveAttrs, athlete.pos);
    athlete.overall = athlete.ovr;
    pState.athleteOvr = athlete.ovr;
    gameState.news = Array.isArray(gameState.news) ? gameState.news : [];
    gameState.news.unshift(`📈 TREINO DO MÊS: ${pState.athleteName || athlete.name} evoluiu +1 em ${attribute.toUpperCase()} após o foco mensal.`);
    gameState.news.length = Math.min(gameState.news.length, 50);
    return { success: true, attribute, value: attrs[attribute], month: monthKey };
  }

  function ensureCoachCareerOffer(gameState){
    const pState = gameState?.playerCareerState;
    if(gameState?.gameMode !== 'player' || !pState || Number(pState.age) < 35 || pState.coachCareerOfferDeclined) return null;
    pState.agentOffers = Array.isArray(pState.agentOffers) ? pState.agentOffers : [];
    let offer = pState.agentOffers.find(item => item.type === 'coach_career');
    if(!offer && !pState.hasReceived35RetirementLetter){
      const clubName = String(gameState.club || 'Real Brasília').trim();
      pState.hasReceived35RetirementLetter = true;
      offer = {
        id: `offer_coach_career_${Number(pState.birthYear) || 0}_35`,
        type: 'coach_career',
        title: 'O Ciclo se Encerra? Proposta de Transição de Carreira',
        clubOrBrand: clubName,
        newClub: clubName,
        date: gameState.date || gameState.currentDate || '2026-01-01',
        isRead: false,
        details: `Aos 35 anos de idade e com uma trajetória consolidada nos gramados, o ${clubName} oferece formalmente a oportunidade de você encerrar sua carreira como jogador e assumir imediatamente como Treinador Principal do clube! Você pode aceitar a transição agora (levando bônus exclusivos de ex-atleta) ou recusar para continuar jogando.`
      };
      pState.agentOffers.unshift(offer);
      gameState.news = Array.isArray(gameState.news) ? gameState.news : [];
      gameState.news.unshift(`📬 MESA DO EMPRESÁRIO: Aos 35 anos, ${pState.athleteName || 'o atleta'} recebeu uma carta formal com proposta para encerrar as chuteiras e assumir como Treinador Principal do ${clubName}!`);
      gameState.news = gameState.news.slice(0, 50);
    }
    return offer;
  }

  function generateCoachOfferForRetirement(gameState){
    const pState = gameState?.playerCareerState;
    if(!pState) return null;
    pState.agentOffers = Array.isArray(pState.agentOffers) ? pState.agentOffers : [];
    let offer = pState.agentOffers.find(item => item.type === 'coach_career');
    if(offer) return offer;
    const clubName = String(gameState.club || 'Real Brasília').trim();
    return {
      id: `offer_coach_career_${Date.now()}`,
      type: 'coach_career',
      title: `Proposta de Treinador: ${clubName}`,
      clubOrBrand: clubName,
      newClub: clubName,
      date: gameState.date || gameState.currentDate || '2026-01-01',
      isRead: false,
      details: `O ${clubName} ofereceu a ${pState.athleteName || 'você'} o cargo de Treinador Principal para marcar sua transição oficial dos gramados para a área técnica.`
    };
  }

  function processPlayerAging(gameState, currentDate = gameState?.date || gameState?.currentDate){
    if(gameState?.gameMode !== 'player' || !gameState.playerCareerState) return { success: false, reason: 'invalid_state' };
    const pState = gameState.playerCareerState;
    const year = Number(String(currentDate || '').slice(0, 4));
    if(!Number.isInteger(year)) return { success: false, reason: 'invalid_date' };
    const athlete = (gameState.squad || []).find(player => player.id === gameState.controlledPlayerId);
    const storedAge = Math.max(15, Number(pState.age || athlete?.age) || 15);
    pState.birthYear = Number(pState.birthYear) || year - storedAge;
    let lastYear = Number(pState.lastAgingYear);
    if(!Number.isInteger(lastYear)){
      pState.age = Math.max(storedAge, year - pState.birthYear);
      pState.lastAgingYear = year;
      lastYear = year;
    }
    const oldAge = Number(pState.age) || storedAge;
    let age = Math.max(oldAge, lastYear - pState.birthYear);
    const attributes = athlete?.attributes;
    let declined = 0;
    if(year > lastYear){
      for(let agingYear = lastYear + 1; agingYear <= year; agingYear++){
        age = Math.max(age + 1, agingYear - pState.birthYear);

        // Regra de Declínio Físico/Técnico (30+ anos):
        // 30-33 anos: -1 a -2 pontos por temporada
        // 34+ anos: -2 a -4 pontos por temporada
        let points = 0;
        if(age >= 34){
          points = 3; // base de 3 pontos (faixa de 2 a 4)
        } else if(age >= 30){
          points = 2; // base de 2 pontos (faixa de 1 a 2)
        }

        // Exceção de Manutenção:
        // Caso o jogador tenha treino físico, moral ou condição física excelentes ou staff,
        // o declínio é suavizado (-1 pt), mas NUNCA zerado após os 32 anos.
        const isFocusFisico = pState.weeklyTrainingFocus === 'fisico';
        const isGoodCondition = (Number(athlete?.fitness || 100) >= 90) || (Number(athlete?.morale || 70) >= 80) || (Number(pState.energy || 100) >= 85);
        const hasPerk = Boolean(pState.lifestylePerks?.personalTrainer || pState.lifestylePerks?.physio);
        if((isFocusFisico || isGoodCondition || hasPerk) && points > 0){
          if(age <= 32){
            points = Math.max(0, points - 1);
          } else {
            // Após os 32 anos: declínio nunca zerado (mínimo 1 ponto)
            points = Math.max(1, points - 1);
          }
        }

        if(points > 0 && attributes){
          // Prioridade para atributos físicos (velocidade/arranque e físico/fôlego)
          const physKeys = ['vel', 'fis'].filter(k => attributes[k] && Number(attributes[k]) > 1);
          const techKeys = Object.keys(attributes).filter(k => !['vel', 'fis'].includes(k) && Number(attributes[k]) > 1);

          for(let i = 0; i < points; i++){
            let key = null;
            if(physKeys.length > 0 && (Math.random() < 0.70 || techKeys.length === 0)){
              key = physKeys[Math.floor(Math.random() * physKeys.length)];
            } else if(techKeys.length > 0){
              key = techKeys[Math.floor(Math.random() * techKeys.length)];
            } else if(physKeys.length > 0){
              key = physKeys[0];
            }
            if(key){
              attributes[key] = Math.max(1, Number(attributes[key]) - 1);
              declined++;
            }
          }
        }
      }
    }
    pState.age = age;
    pState.lastAgingYear = Math.max(lastYear, year);
    if(athlete) athlete.age = age;
    if(declined && athlete){
      const effectiveAttrs = getPlayerEffectiveAttributes(gameState, athlete);
      athlete.ovr = calculatePlayerOverall(effectiveAttrs, athlete.pos);
      athlete.overall = athlete.ovr;
      pState.athleteOvr = athlete.ovr;
      gameState.news = Array.isArray(gameState.news) ? gameState.news : [];
      gameState.news.unshift(`📉 DECLÍNIO NATURAL: Aos ${age} anos, ${pState.athleteName || athlete.name} sofreu declínio natural de atributos físicos e técnicos (-${declined} pts). Foco em treinos físicos ajuda a atenuar.`);
      gameState.news = gameState.news.slice(0, 50);
    }
    if(oldAge < 30 && age >= 30){
      gameState.news = Array.isArray(gameState.news) ? gameState.news : [];
      gameState.news.unshift(`🎂 NOVA FASE DA CARREIRA: ${pState.athleteName || athlete?.name || 'O atleta'} completou 30 anos. A idade passa a influenciar gradualmente a velocidade e resistência física.`);
      gameState.news = gameState.news.slice(0, 50);
    }
    const offer = ensureCoachCareerOffer(gameState);
    return { success: true, age, declined, declinedPoints: declined, offer };
  }

  function startManagerCareerFromPlayerRetirement(gameState, offer = null){
    if(gameState?.gameMode !== 'player' || !gameState.playerCareerState) return { ok: false, error: 'Carreira de atleta inválida.' };
    const pState = gameState.playerCareerState;
    const athlete = (gameState.squad || []).find(player => player.id === gameState.controlledPlayerId);
    const age = Math.max(15, Number(pState.age || athlete?.age) || 35);
    const clubName = String(offer?.newClub || offer?.clubOrBrand || gameState.club || '').trim();
    if(!clubName) return { ok: false, error: 'Não foi possível identificar o clube da proposta.' };
    
    const summary = {
      origin: 'former_player',
      playerName: pState.athleteName || athlete?.name || gameState.manager || 'Ex-jogador',
      nationality: athlete?.nationality || pState.nationality || 'Brasil',
      nickname: pState.nickname || athlete?.nickname || '',
      retirementAge: age,
      retiredAt: gameState.date || gameState.currentDate || '2026-01-01',
      formerClub: gameState.club,
      overall: Number(athlete?.ovr || pState.athleteOvr) || 0,
      matches: Number(pState.careerStats?.matches) || 0,
      goals: Number(pState.careerStats?.goals) || 0,
      assists: Number(pState.careerStats?.assists) || 0,
      titles: Array.isArray(pState.careerStats?.titles) ? pState.careerStats.titles.slice(0, 20) : []
    };

    // Migração in-place: NÃO reseta o universo do save
    gameState.gameMode = 'manager';
    gameState.isPlayerMode = false;
    gameState.manager = summary.playerName;
    gameState.managerNationality = summary.nationality;
    gameState.managerAge = age;
    gameState.managerBirthYear = (Number(gameState.season) || 2026) - age;
    gameState.managerLegacy = summary;
    gameState.exPlayerBio = summary;
    gameState.managerReputation = 'Ex-Jogador Profissional / Ídolo';

    // Bônus exclusivos de ex-atleta no Modo Treinador
    gameState.managerCareerBonuses = { salaryPct: 10, playerSigningChancePct: 5 };
    gameState.bonusSalarioTreinador = 10;
    gameState.bonusNegociacaoJogadores = 5;

    // Respeito imediato de elenco e diretoria
    gameState.trust = { board: 85, fans: 85, squad: 88 };
    gameState.boardConfidence = 85;

    // Se assumir clube diferente ou o próprio
    if(clubName !== gameState.club){
      gameState.club = clubName;
      if(typeof playersForClub === 'function'){
        gameState.squad = playersForClub(clubName, gameState.worldGenerated);
      }
      if(typeof defaultInfrastructure === 'function'){
        gameState.infrastructure = defaultInfrastructure(clubByName(clubName) || { name: clubName });
      }
      gameState.balance = Math.max(500000, Math.round(((typeof clubByName === 'function' ? clubByName(clubName)?.budget : 5) || 5) * 1e6));
    } else {
      // Remove o atleta do elenco de linha ativo
      if(gameState.controlledPlayerId){
        gameState.squad = (gameState.squad || []).filter(p => p.id !== gameState.controlledPlayerId);
      }
    }

    // Limpeza de variáveis residuais do Modo Jogador para evitar qualquer NaN ou tela preta
    delete gameState.controlledPlayerId;
    gameState.retiredPlayerCareer = pState;
    delete gameState.playerCareerState;

    // Salário com +10% de bônus
    const clubObj = (typeof clubByName === 'function') ? clubByName(clubName) : null;
    const baseWage = clubObj ? ((clubObj.budget || 5) > 15 ? 75000 : 45000) : 45000;
    gameState.managerSalary = Math.round(baseWage * 1.10);
    gameState.managerBaseSalary = gameState.managerSalary;
    gameState.managerPersonal = gameState.managerPersonal || { personalBalance: 57000, salary: gameState.managerSalary, coursesCompleted: [], businesses: [] };
    gameState.managerPersonal.salary = gameState.managerSalary;

    gameState.news = Array.isArray(gameState.news) ? gameState.news : [];
    gameState.news.unshift(`🧑‍🏫 NOVO COMANDANTE: O ídolo ${summary.playerName} pendurou as chuteiras aos ${age} anos e assumiu como Treinador Principal do ${clubName}! Carreira técnica iniciada com moral alta e respeito imediato.`);
    gameState.news = gameState.news.slice(0, 50);

    gameState.view = 'central';
    if(typeof window !== 'undefined') window.view = 'central';

    if(typeof window.save === 'function') window.save({ allowModeReplace: true });
    if(typeof window.render === 'function') window.render();
    return { ok: true, state: gameState, legacy: summary };
  }

  /**
   * Ciclo Financeiro Mensal Realista do Atleta
   * Processa salários, patrocínios, comissões de empresário, folha de staff pessoal
   * e custo de manutenção de estilo de vida conforme o estrelato do jogador.
   */
  function processMonthlyPlayerFinances(gameState, paymentDate = gameState?.date || gameState?.currentDate){
    if(!gameState || gameState.gameMode !== 'player' || !gameState.playerCareerState) return;
    if(window.AFM_Lifestyle && typeof window.AFM_Lifestyle.processMonthlyPlayerFinances === 'function'){
      return window.AFM_Lifestyle.processMonthlyPlayerFinances(gameState, paymentDate);
    }
    const pState = gameState.playerCareerState;
    const curDate = paymentDate || gameState.date || gameState.currentDate || '2026-01-01';
    const monthKey = String(curDate).slice(0, 7);
    if(pState.lastFinancialMonth && monthKey <= pState.lastFinancialMonth) return;
    pState.lastFinancialMonth = monthKey;
    const playerObj = (gameState.squad || []).find(p => p.id === gameState.controlledPlayerId);
    const athleteOvr = Number(playerObj?.ovr || pState.athleteOvr || 45);

    // 1. Entradas Financeiras
    const salary = Math.round(Number(playerObj?.wage || (pState.weeklySalary ? pState.weeklySalary * 4 : 1500)));
    if(playerObj && pState.weeklySalary){
      playerObj.wage = salary;
    }
    const sponsorMonthly = Math.round(Number(pState.sponsorContract?.monthlyStipend || pState.sponsorContract?.monthly || 0));
    const matchBonuses = Math.round(Number(pState.monthlyMatchBonuses) || 0);
    const arrears = pState.clubSalaryArrears = pState.clubSalaryArrears || { amount: 0, months: 0, claim: null };
    const clubCash = Number(gameState.balance);
    const lateChance = !Number.isFinite(clubCash) ? 0.02 : clubCash < 0 ? 0.30 : clubCash < salary ? 0.15 : clubCash < salary * 3 ? 0.07 : 0.02;
    const salaryDelayed = Math.random() < lateChance;
    let arrearsPayment = 0;
    if(salaryDelayed){
      arrears.amount = Math.round((Number(arrears.amount) || 0) + salary);
      arrears.months = (Number(arrears.months) || 0) + 1;
      gameState.news = Array.isArray(gameState.news) ? gameState.news : [];
      gameState.news.unshift(`🚨 SALÁRIO ATRASADO: O ${gameState.club || 'clube'} enfrenta dificuldade de caixa e deve R$ ${salary.toLocaleString('pt-BR')} a ${pState.athleteName || 'você'}. Dívida acumulada: R$ ${arrears.amount.toLocaleString('pt-BR')}.`);
    } else if(Number(arrears.amount) > 0 && arrears.claim?.status !== 'pending'){
      arrearsPayment = Math.min(Number(arrears.amount), salary);
      arrears.amount = Math.max(0, Number(arrears.amount) - arrearsPayment);
      if(arrears.amount === 0) arrears.months = 0;
      arrears.lastPayment = { date: curDate, amount: arrearsPayment };
    }
    const salaryPaid = salaryDelayed ? 0 : salary;
    const totalIncome = salaryPaid + arrearsPayment + sponsorMonthly + matchBonuses;

    // 2. Saídas e Despesas Operacionais
    const agent = getPlayerAgent(pState);
    const agentSalary = Math.round(Number(agent.monthlySalary) || 0);
    const agentSponsorPct = Number(agent.sponsorCommissionPct) || 5;
    const agentSponsorComm = sponsorMonthly > 0 ? Math.round(sponsorMonthly * (agentSponsorPct / 100)) : 0;
    const totalAgentExpenses = agentSalary + agentSponsorComm;
    const staffExpenses = Math.round(calculateHiredStaffMonthlyCost(pState, athleteOvr));
    const lifestyleCost = Math.round(calculatePlayerLifestyleCost(pState, athleteOvr));
    const totalExpenses = totalAgentExpenses + staffExpenses + lifestyleCost;

    // 3. Resultado Líquido & Saldo Bancário
    const netBalance = totalIncome - totalExpenses;
    pState.personalBank = Math.round((Number(pState.personalBank) || 0) + netBalance);
    pState.monthlyMatchBonuses = 0; // Reset do acumulador de bônus do mês

    // 4. Histórico Financeiro Mensal (Extrato dos últimos 12 meses)
    pState.financialHistory = Array.isArray(pState.financialHistory) ? pState.financialHistory : [];
    pState.financialHistory.unshift({
      date: curDate,
      month: monthKey,
      salary: salaryPaid,
      salaryDue: salary,
      salaryDelayed,
      salaryArrearsPaid: arrearsPayment,
      salaryDebt: Number(arrears.amount) || 0,
      sponsorMonthly,
      matchBonuses,
      totalIncome,
      agentSalary,
      agentSponsorComm,
      totalAgentExpenses,
      agentName: agent.name,
      staffExpenses,
      lifestyleCost,
      totalExpenses,
      netBalance,
      finalBank: pState.personalBank
    });
    pState.financialHistory = pState.financialHistory.slice(0, 12);

    if(arrears.claim?.status === 'pending'){
      arrears.claim.monthsRemaining = Math.max(0, Number(arrears.claim.monthsRemaining || 0) - 1);
      if(arrears.claim.monthsRemaining === 0){
        const won = Math.random() < 0.85;
        const recovered = won ? Math.round(Number(arrears.amount) * (0.85 + Math.random() * 0.15)) : 0;
        pState.personalBank = Math.round((Number(pState.personalBank) || 0) + recovered);
        arrears.amount = Math.max(0, Number(arrears.amount) - recovered);
        arrears.months = arrears.amount ? arrears.months : 0;
        arrears.claim.status = won ? 'won' : 'lost';
        arrears.claim.resolvedDate = curDate;
        arrears.claim.recovered = recovered;
        gameState.news.unshift(won
          ? `⚖️ ACORDO TRABALHISTA: o processo contra ${gameState.club || 'o clube'} foi favorável. R$ ${recovered.toLocaleString('pt-BR')} foram pagos ao atleta.`
          : `⚖️ PROCESSO TRABALHISTA: a cobrança contra ${gameState.club || 'o clube'} não foi aceita. A dívida salarial continua registrada.`);
      }
    }

    // 5. Notícias e Alertas Financeiros
    gameState.news = Array.isArray(gameState.news) ? gameState.news : [];
    gameState.news.unshift(`💵 EXTRATO PESSOAL: Entradas R$ ${totalIncome.toLocaleString('pt-BR')} (Salário: R$ ${salary.toLocaleString('pt-BR')}${sponsorMonthly > 0 ? ` + Patrocínio: R$ ${sponsorMonthly.toLocaleString('pt-BR')}` : ''}) | Despesas R$ ${totalExpenses.toLocaleString('pt-BR')} (Empresário: R$ ${totalAgentExpenses.toLocaleString('pt-BR')} + Staff: R$ ${staffExpenses.toLocaleString('pt-BR')} + Custo de Vida: R$ ${lifestyleCost.toLocaleString('pt-BR')}) | Saldo: R$ ${pState.personalBank.toLocaleString('pt-BR')}.`);

    if(pState.personalBank < 0){
      gameState.news.unshift(`⚠️ ALERTA FINANCEIRO: Sua conta bancária pessoal está no vermelho (R$ ${pState.personalBank.toLocaleString('pt-BR')})! Avalie dispensar membros do staff ou reduzir custos de estilo de vida.`);
    }
    if (gameState.news.length > 50) gameState.news = gameState.news.slice(0, 50);
  }

  function filePlayerSalaryClaim(gameState){
    if(gameState?.gameMode !== 'player' || !gameState.playerCareerState) return { ok: false, error: 'Carreira de jogador inválida.' };
    const pState = gameState.playerCareerState;
    const arrears = pState.clubSalaryArrears = pState.clubSalaryArrears || { amount: 0, months: 0, claim: null };
    if(Number(arrears.amount) <= 0) return { ok: false, error: 'Não há salários atrasados para cobrar.' };
    if(arrears.claim?.status === 'pending') return { ok: false, error: 'Já existe um processo em andamento.' };
    const fee = Math.max(300, Math.min(1000, Math.round(Number(arrears.amount) * 0.08)));
    if(Number(pState.personalBank) < fee) return { ok: false, error: `Saldo insuficiente para contratar o advogado (R$ ${fee.toLocaleString('pt-BR')}).` };
    pState.personalBank = Math.round(Number(pState.personalBank) - fee);
    arrears.claim = { status: 'pending', filedDate: gameState.date, monthsRemaining: 3, fee, lawyer: 'Advogado trabalhista' };
    gameState.news = Array.isArray(gameState.news) ? gameState.news : [];
    gameState.news.unshift(`⚖️ AÇÃO TRABALHISTA: ${pState.athleteName || 'O atleta'} contratou advogado e iniciou cobrança de R$ ${Number(arrears.amount).toLocaleString('pt-BR')} contra ${gameState.club || 'o clube'}. Prazo estimado: 3 meses.`);
    return { ok: true, fee, amount: Number(arrears.amount) };
  }

  function registerPlayerTransferListing(gameState, type, options = {}){
    if(gameState?.gameMode !== 'player' || !gameState.playerCareerState || !['loan','transfer'].includes(type)) return { ok: false, error: 'Pedido de mercado inválido.' };
    const pState = gameState.playerCareerState;
    if(pState.transferListing?.status === 'active') return { ok: false, error: 'Você já está listado para negociar uma saída.' };
    pState.transferListing = { type, status: 'active', club: gameState.club || '', date: gameState.date || '', options: { ...options } };
    pState.actionRequests = pState.actionRequests || {};
    pState.actionRequests.request_loan = type === 'loan' ? { status: 'accepted', date: gameState.date, active: true } : { status: 'inactive', active: false };
    pState.actionRequests.request_transfer = type === 'transfer' ? { status: 'accepted', date: gameState.date, active: true } : { status: 'inactive', active: false };
    gameState.news = Array.isArray(gameState.news) ? gameState.news : [];
    const description = type === 'loan' ? 'lista de empréstimos' : 'lista de transferências';
    const headline = `🤝 MERCADO: ${gameState.club || 'O clube'} aceitou o pedido de ${pState.athleteName || 'seu atleta'} e o incluiu na ${description}. Propostas serão avaliadas durante a janela de transferências.`;
    gameState.news.unshift(headline);
    gameState.news = gameState.news.slice(0, 50);
    window.AFM_SocialMedia?.publishPlayerListing?.(gameState, pState.transferListing);
    return { ok: true, listing: pState.transferListing };
  }

  function searchPlayerTransferMarket(gameState){
    if(gameState?.gameMode !== 'player' || !gameState.playerCareerState) return { ok: false, error: 'Carreira de jogador inválida.' };
    const currentDate = gameState.date || gameState.currentDate;
    const isWindowOpen = typeof isTransferWindowOpen === 'function'
      ? isTransferWindowOpen(currentDate)
      : (function(){
          const [, month, day] = String(currentDate || '').split('-').map(Number);
          return Boolean(gameState.freeTransferWindow) || [1, 2, 6, 7].includes(month) || ([3, 8].includes(month) && day === 1);
        })();
    if(!isWindowOpen) return { ok: false, error: 'As propostas de clubes só podem ser buscadas durante a janela de transferências.' };

    const pState = gameState.playerCareerState;
    pState.agentOffers = Array.isArray(pState.agentOffers) ? pState.agentOffers : [];
    if(pState.agentOffers.filter(offer => offer.type === 'transfer' || offer.type === 'club_loan').length >= 3){
      return { ok: false, error: 'Você já tem três propostas de clubes em análise. Avalie uma delas antes de buscar outras.' };
    }
    if(pState.lastAgentMarketSearchDate === currentDate){
      return { ok: false, error: 'Seu empresário já consultou os clubes hoje. Avance a carreira para uma nova busca.' };
    }

    const athlete = (gameState.squad || []).find(player => player.id === gameState.controlledPlayerId || player.isControlled) || {};
    const ovr = Math.max(1, Number(athlete.ovr || athlete.overall || pState.athleteOvr || pState.overall) || 35);
    const candidates = ovr < 40
      ? ['Ceilândia', 'Gama', 'Real Brasília', 'Capital-DF', 'Paranoá', 'Samambaia', 'Sobradinho', 'Planaltina']
      : ovr < 50
        ? ['Ceilândia', 'Gama', 'Brasiliense', 'Volta Redonda', 'Botafogo-PB', 'Figueirense', 'Remo', 'Paysandu', 'Náutico']
        : ovr < 60
          ? ['Volta Redonda', 'Botafogo-PB', 'Náutico', 'Ponte Preta', 'Paysandu', 'Chapecoense', 'Guarani', 'Criciúma']
          : ovr < 70
            ? ['Sport', 'Coritiba', 'Goiás', 'Ceará', 'Vila Nova', 'Avaí', 'Chapecoense', 'Novorizontino']
            : ovr < 80
              ? ['Flamengo', 'Palmeiras', 'São Paulo', 'Grêmio', 'Internacional', 'Fluminense', 'Cruzeiro', 'Bahia']
              : ['Real Madrid', 'Barcelona', 'Manchester City', 'Arsenal', 'Liverpool', 'Paris Saint-Germain', 'Bayern de Munique', 'Flamengo'];
    const eligible = candidates.filter(club => norm(club) !== norm(gameState.club));
    if(!eligible.length) return { ok: false, error: 'Não encontramos um clube compatível para consultar neste momento.' };

    const buyerClub = eligible[Math.floor(Math.random() * eligible.length)];
    const listingType = pState.transferListing?.status === 'active' ? pState.transferListing.type : null;
    const isLoan = listingType ? listingType === 'loan' : ovr < 52 && Math.random() < 0.5;
    const currentWage = Math.max(800, Number(athlete.wage || pState.monthlySalary || (pState.weeklySalary || 0) * 4) || 1500);
    const wageFloor = ovr < 40 ? 900 : ovr < 50 ? 1300 : ovr < 60 ? 2500 : ovr < 70 ? 6000 : ovr < 80 ? 15000 : 35000;
    const offeredWage = Math.round(Math.max(wageFloor, currentWage * (0.95 + Math.random() * 0.3)));
    const durationYears = isLoan ? 1 : 2 + Math.floor(Math.random() * 2);
    const offer = {
      id: `offer_search_${String(currentDate).replace(/-/g, '')}_${Math.floor(Math.random() * 100000)}`,
      type: isLoan ? 'club_loan' : 'transfer',
      clubOrBrand: buyerClub,
      newClub: buyerClub,
      title: isLoan ? `Empréstimo: ${buyerClub}` : `Compra Definitiva: ${buyerClub}`,
      details: isLoan
        ? `Empréstimo de ${durationYears} temporada • Salário de R$ ${offeredWage.toLocaleString('pt-BR')}/mês • Em avaliação pelo clube atual`
        : `Contrato de ${durationYears} anos • Salário de R$ ${offeredWage.toLocaleString('pt-BR')}/mês • Interesse compatível com OVR ${ovr}`,
      wage: offeredWage,
      durationYears,
      buyoutClause: Math.round(offeredWage * 12 * durationYears * 3),
      date: currentDate,
      isRead: false
    };
    pState.agentOffers.unshift(offer);
    pState.lastAgentMarketSearchDate = currentDate;
    gameState.news = Array.isArray(gameState.news) ? gameState.news : [];
    gameState.news.unshift(`💼 PROPOSTA NA MESA: ${buyerClub} consultou o empresário sobre ${isLoan ? 'um empréstimo' : 'uma contratação'} de ${pState.athleteName || athlete.name || 'seu atleta'}. Salário proposto: R$ ${offeredWage.toLocaleString('pt-BR')}/mês.`);
    gameState.news.length = Math.min(gameState.news.length, 50);
    window.AFM_SocialMedia?.publishTransferProposal?.(gameState, offer);
    return { ok: true, offer };
  }

  function addDaysToIso(isoDateStr, days){
    const parts = String(isoDateStr || '2026-01-01').split('-');
    const y = Number(parts[0]) || 2026;
    const m = (Number(parts[1]) || 1) - 1;
    const d = Number(parts[2]) || 1;
    const dt = new Date(y, m, d, 12, 0, 0);
    dt.setDate(dt.getDate() + Number(days));
    const ny = dt.getFullYear();
    const nm = String(dt.getMonth() + 1).padStart(2, '0');
    const nd = String(dt.getDate()).padStart(2, '0');
    return `${ny}-${nm}-${nd}`;
  }

  function getDaysBetween(isoDate1, isoDate2){
    const p1 = String(isoDate1 || '2026-01-01').split('-');
    const p2 = String(isoDate2 || '2026-01-01').split('-');
    const d1 = new Date(Number(p1[0]), Number(p1[1]) - 1, Number(p1[2]), 12, 0, 0);
    const d2 = new Date(Number(p2[0]), Number(p2[1]) - 1, Number(p2[2]), 12, 0, 0);
    return Math.round((d2 - d1) / (1000 * 60 * 60 * 24));
  }

  /**
   * Monitoramento diário do tempo de contrato de material esportivo
   * Ao expirar, a empresa analisa o rendimento do atleta e envia proposta formal de renovação
   */
  function processDailySponsorTurn(gameState){
    if(!gameState || gameState.gameMode !== 'player' || !gameState.playerCareerState) return;
    const pState = gameState.playerCareerState;
    const currentDate = gameState.date || gameState.currentDate || '2026-01-18';

    // Limpeza / expiração de ofertas de clubes na mesa caso a janela tenha fechado
    const isWindowOpen = (typeof isTransferWindowOpen === 'function')
      ? isTransferWindowOpen(currentDate)
      : (function(dStr){
          if(!dStr) return false;
          const parts = String(dStr).split('-');
          if(parts.length < 3) return false;
          const m = parseInt(parts[1], 10);
          const d = parseInt(parts[2], 10);
          return (m === 1 || m === 2 || (m === 3 && d <= 1) || m === 6 || m === 7 || (m === 8 && d <= 1));
        })(currentDate);

    if(!isWindowOpen && Array.isArray(pState.agentOffers)){
      const clubOffers = pState.agentOffers.filter(o => o.type === 'transfer' || o.type === 'club_loan');
      if(clubOffers.length > 0){
        pState.agentOffers = pState.agentOffers.filter(o => o.type !== 'transfer' && o.type !== 'club_loan');
        gameState.news = Array.isArray(gameState.news) ? gameState.news : [];
        gameState.news.unshift(`🔒 MERCADO DA BOLA: A janela de transferências encerrou. As propostas de clubes foram arquivadas pelo empresário até a próxima janela aberta.`);
      }
    }

    if(!pState.sponsorContract) return;

    const sp = pState.sponsorContract;

    // Inicializa datas caso save legado
    if(!sp.endDate){
      sp.startDate = sp.startDate || currentDate;
      sp.totalDays = sp.totalDays || 180;
      sp.endDate = addDaysToIso(sp.startDate, sp.totalDays);
    }

    const daysLeft = getDaysBetween(currentDate, sp.endDate);
    sp.daysRemaining = Math.max(0, daysLeft);

    // Se o contrato de patrocínio chegou ao fim
    if(daysLeft <= 0){
      const goals = Number(sp.goalsDuringContract) || 0;
      const matches = Number(sp.matchesDuringContract) || 0;
      const ratings = Array.isArray(sp.ratingsList) ? sp.ratingsList : [];
      const avgRating = ratings.length ? (ratings.reduce((a, b) => a + b, 0) / ratings.length) : 6.0;

      let multiplier = 1.0;
      let renewalBonus = 0;
      let reasonText = '';

      const renewalDuration = Math.max(30, Number(sp.totalDays || sp.durationDays) || 180);
      if(goals >= 3 || avgRating >= 7.0 || matches >= 6){
        multiplier = 1.35; // +35% de valorização
        renewalBonus = Math.round((sp.monthlyStipend || 1500) * 1.5);
        reasonText = `Desempenho Estelar! Com ${goals} gols e nota média ${avgRating.toFixed(1)}, a ${sp.brand} oferece renovação valorizada com +35% de mensalidade e bônus de luvas de R$ ${renewalBonus.toLocaleString('pt-BR')}!`;
      } else if(goals >= 1 || avgRating >= 6.2 || matches >= 2){
        multiplier = 1.15; // +15% de reajuste
        renewalBonus = Math.round((sp.monthlyStipend || 1500) * 0.5);
        reasonText = `Bom rendimento esportivo! A ${sp.brand} quer continuar a parceria por mais ${renewalDuration} dias com reajuste de 15%.`;
      } else {
        multiplier = 1.0;
        reasonText = `A ${sp.brand} oferece mais ${renewalDuration} dias de contrato para você ganhar sequência e provar seu talento.`;
      }

      const newMonthly = Math.round((sp.monthlyStipend || 1500) * multiplier);
      const newBonusGoal = Math.round((sp.bonusGoal || 500) * multiplier);
      const newBonusWin = Math.round((sp.bonusWin || 500) * multiplier);

      pState.agentOffers = pState.agentOffers || [];
      const renewOffer = {
        id: 'offer_renew_' + (sp.brand || 'brand').toLowerCase() + '_' + Date.now(),
        type: 'sponsor',
        isRenewal: true,
        isRead: false,
        brand: sp.brand,
        clubOrBrand: sp.name || `${sp.brand} Sports`,
        title: `✨ Proposta de Renovação: ${sp.name}`,
        details: `Vínculo de ${renewalDuration} Dias • Mensalidade: R$ ${newMonthly.toLocaleString('pt-BR')}/mês • Bônus Gol: R$ ${newBonusGoal.toLocaleString('pt-BR')}${renewalBonus > 0 ? ` • Luvas: R$ ${renewalBonus.toLocaleString('pt-BR')}` : ''}`,
        monthly: newMonthly,
        monthlyStipend: newMonthly,
        bonusGoal: newBonusGoal,
        bonusWin: newBonusWin,
        renewalBonus: renewalBonus,
        durationDays: renewalDuration,
        date: currentDate,
        reasonText: reasonText
      };
      pState.agentOffers.unshift(renewOffer);

      gameState.news = Array.isArray(gameState.news) ? gameState.news : [];
      gameState.news.unshift(`📰 [MATERIAL ESPORTIVO] Seu contrato com a ${sp.brand} chegou ao fim! A empresa enviou uma proposta formal de renovação para a mesa do seu empresário. Você está livre no mercado para renovar ou escolher outra marca esportiva!`);

      pState.expiredSponsorHistory = pState.expiredSponsorHistory || [];
      pState.expiredSponsorHistory.unshift({
        brand: sp.brand,
        name: sp.name,
        goals: goals,
        matches: matches,
        avgRating: avgRating.toFixed(2),
        expiredDate: currentDate
      });

      // Libera o contrato ativo para permitir assinar outra marca no catálogo ou aceitar a renovação
      pState.sponsorContract = null;
    }
    if(Array.isArray(gameState.news) && gameState.news.length > 50) gameState.news = gameState.news.slice(0, 50);
  }

  /**
   * MOTOR DE PRÊMIOS DE FIM DE TEMPORADA (AWARDS ENGINE)
   * Apura os Melhores do Mundo, Chuteira de Ouro, Golden Boy, Prêmios da Liga e Recordes Históricos
   */
  function processEndOfSeasonAwards(gameState, finishedYear){
    if(!gameState || gameState.gameMode !== 'player' || !gameState.playerCareerState) return null;
    const pState = gameState.playerCareerState;
    const targetSeason = Number(finishedYear) || Number(gameState.season) || 2026;

    // Idempotência: se os prêmios da temporada já foram apurados, reutiliza o registro
    if(pState.lastSeasonGalaAwards && pState.lastSeasonGalaAwards.season === targetSeason){
      return pState.lastSeasonGalaAwards;
    }

    // Inicialização segura de arrays e objetos de estado
    pState.personality = pState.personality || { maverick: 30, heartbeat: 30, virtuoso: 40 };
    pState.relationships = pState.relationships || { boardRelation: 65, fansRelation: 70, teammatesRelation: 75 };
    pState.individualAwards = Array.isArray(pState.individualAwards) ? pState.individualAwards : [];
    pState.competitionRecordsBroken = Array.isArray(pState.competitionRecordsBroken) ? pState.competitionRecordsBroken : [];

    const controlledId = gameState.controlledPlayerId;
    const athlete = controlledId == null ? null : (gameState.squad || []).find(p => p.id === controlledId);
    const sStats = pState.seasonStats || {};
    const seasonHistory = (pState.matchRatingHistory || []).filter(match => Number(String(match.date || '').slice(0, 4)) === targetSeason);
    const hasCurrentSeasonStats = !sStats.season || Number(sStats.season) === targetSeason;
    const userGoals = seasonHistory.length
      ? seasonHistory.reduce((sum, match) => sum + (Number(match.goals) || 0), 0)
      : (hasCurrentSeasonStats ? Number(sStats.goals) || 0 : Number(pState.careerStats?.goals) || 0);
    const userAssists = seasonHistory.length
      ? seasonHistory.reduce((sum, match) => sum + (Number(match.assists) || 0), 0)
      : (hasCurrentSeasonStats ? Number(sStats.assists) || 0 : Number(pState.careerStats?.assists) || 0);
    const userCleanSheets = Number(sStats.cleanSheets ?? 0);
    const userMvpCount = Number(sStats.mvpCount ?? sStats.manOfTheMatch ?? 0);
    const userAvgRating = seasonHistory.length
      ? Number((seasonHistory.reduce((sum, match) => sum + (Number(match.rating) || 0), 0) / seasonHistory.length).toFixed(2))
      : Number(sStats.avgRating ?? sStats.averageRating ?? pState.careerStats?.avgRating ?? 6.5);
    const userOvr = Number(athlete?.ovr ?? athlete?.overall ?? pState.athleteOvr ?? 45);
    const userAge = Number(athlete?.age ?? pState.age ?? 16);
    const userClub = gameState.club || 'Clube';
    const userCompId = gameState.compId || 'bra-est-df';
    const userCompName = gameState.competition || 'Campeonato';

    // Bônus por títulos conquistados pelo clube nesta temporada
    const titlesThisSeason = (gameState.titles || []).filter(t => {
      const yr = (typeof t === 'object' && t.year) ? Number(t.year) : targetSeason;
      return yr === targetSeason;
    });
    const hasMajorTitle = titlesThisSeason.some(t => {
      const tName = ((typeof t === 'object' ? t.name : t) || '').toLowerCase();
      return tName.includes('série') || tName.includes('serie') || tName.includes('libertadores') || tName.includes('copa do brasil') || tName.includes('mundial');
    });
    const userTrophiesBonus = hasMajorTitle ? 25 : (titlesThisSeason.length > 0 ? 12 : 0);

    const topTierComps = ['bra-a', 'eng-1', 'esp-1', 'ita-1', 'ger-1', 'fra-1', 'ucl'];
    const midHighTierComps = ['bra-b', 'por-1', 'ned-1', 'lib', 'uel', 'arg-1'];
    const midTierComps = ['bra-c', 'esp-2', 'eng-2', 'ita-2', 'ger-2', 'sud'];
    const userLeagueMultiplier = topTierComps.includes(userCompId) ? 2.0 :
      (midHighTierComps.includes(userCompId) ? 1.8 :
      (midTierComps.includes(userCompId) ? 1.4 :
      (userCompId === 'bra-d' ? 1.2 : 1.0)));

    // Candidato Usuário
    const userCandidate = {
      id: controlledId || 'user_player',
      name: athlete?.name || pState.athleteName || 'Você',
      club: userClub,
      age: userAge,
      ovr: userOvr,
      pos: athlete?.pos || pState.position || 'ATA',
      goals: userGoals,
      assists: userAssists,
      cleanSheets: userCleanSheets,
      averageRating: userAvgRating,
      mvpCount: userMvpCount,
      teamTrophiesBonus: userTrophiesBonus,
      leagueMultiplier: userLeagueMultiplier,
      isUser: true,
      photo: athlete?.photo || pState.appearance?.customFacePhoto || pState.appearance?.facePhoto || null
    };

    // Pack Mundial de Atletas da IA (com variabilidade controlada por temporada)
    const baseWorldStars = [
      { name: 'Vinícius Jr', club: 'Real Madrid', age: 24, ovr: 90, pos: 'PON', baseGoals: 25, baseAssists: 12, cleanSheets: 0, baseRating: 8.24, mvpCount: 8, teamTrophiesBonus: 25, leagueMultiplier: 2.0 },
      { name: 'Erling Haaland', club: 'Manchester City', age: 24, ovr: 91, pos: 'ATA', baseGoals: 36, baseAssists: 6, cleanSheets: 0, baseRating: 8.22, mvpCount: 9, teamTrophiesBonus: 25, leagueMultiplier: 2.0 },
      { name: 'Kylian Mbappé', club: 'Real Madrid', age: 26, ovr: 91, pos: 'ATA', baseGoals: 32, baseAssists: 9, cleanSheets: 0, baseRating: 8.25, mvpCount: 8, teamTrophiesBonus: 25, leagueMultiplier: 2.0 },
      { name: 'Rodri', club: 'Manchester City', age: 28, ovr: 91, pos: 'VOL', baseGoals: 8, baseAssists: 14, cleanSheets: 18, baseRating: 8.36, mvpCount: 6, teamTrophiesBonus: 25, leagueMultiplier: 2.0 },
      { name: 'Jude Bellingham', club: 'Real Madrid', age: 22, ovr: 90, pos: 'MEI', baseGoals: 19, baseAssists: 14, cleanSheets: 0, baseRating: 8.12, mvpCount: 6, teamTrophiesBonus: 25, leagueMultiplier: 2.0 },
      { name: 'Harry Kane', club: 'Bayern de Munique', age: 31, ovr: 90, pos: 'ATA', baseGoals: 34, baseAssists: 9, cleanSheets: 0, baseRating: 8.16, mvpCount: 7, teamTrophiesBonus: 20, leagueMultiplier: 2.0 },
      { name: 'Lamine Yamal', club: 'Barcelona', age: 18, ovr: 86, pos: 'PON', baseGoals: 16, baseAssists: 18, cleanSheets: 0, baseRating: 8.19, mvpCount: 7, teamTrophiesBonus: 20, leagueMultiplier: 2.0 },
      { name: 'Mohamed Salah', club: 'Liverpool', age: 32, ovr: 89, pos: 'PON', baseGoals: 25, baseAssists: 14, cleanSheets: 0, baseRating: 8.10, mvpCount: 6, teamTrophiesBonus: 15, leagueMultiplier: 2.0 },
      { name: 'Florian Wirtz', club: 'Bayer Leverkusen', age: 22, ovr: 88, pos: 'MEI', baseGoals: 16, baseAssists: 17, cleanSheets: 0, baseRating: 8.12, mvpCount: 5, teamTrophiesBonus: 20, leagueMultiplier: 2.0 },
      { name: 'Pedro', club: 'Flamengo', age: 27, ovr: 82, pos: 'ATA', baseGoals: 26, baseAssists: 6, cleanSheets: 0, baseRating: 7.78, mvpCount: 5, teamTrophiesBonus: 18, leagueMultiplier: 2.0 },
      { name: 'Estêvão', club: 'Palmeiras', age: 18, ovr: 80, pos: 'PON', baseGoals: 15, baseAssists: 9, cleanSheets: 0, baseRating: 7.72, mvpCount: 4, teamTrophiesBonus: 15, leagueMultiplier: 2.0 },
      { name: 'Endrick', club: 'Real Madrid', age: 19, ovr: 81, pos: 'ATA', baseGoals: 14, baseAssists: 5, cleanSheets: 0, baseRating: 7.62, mvpCount: 3, teamTrophiesBonus: 25, leagueMultiplier: 2.0 },
      { name: 'Arda Güler', club: 'Real Madrid', age: 20, ovr: 81, pos: 'MEI', baseGoals: 12, baseAssists: 8, cleanSheets: 0, baseRating: 7.68, mvpCount: 3, teamTrophiesBonus: 25, leagueMultiplier: 2.0 },
      { name: 'Kobbie Mainoo', club: 'Manchester United', age: 20, ovr: 82, pos: 'VOL', baseGoals: 6, baseAssists: 8, cleanSheets: 10, baseRating: 7.65, mvpCount: 3, teamTrophiesBonus: 10, leagueMultiplier: 2.0 },
      { name: 'Pau Cubarsí', club: 'Barcelona', age: 18, ovr: 81, pos: 'ZAG', baseGoals: 2, baseAssists: 3, cleanSheets: 16, baseRating: 7.82, mvpCount: 3, teamTrophiesBonus: 20, leagueMultiplier: 2.0 }
    ];

    const worldCandidates = baseWorldStars.map(s => {
      const goalsVar = Math.floor(Math.sin(targetSeason + s.ovr) * 3);
      const assistsVar = Math.floor(Math.cos(targetSeason + s.ovr) * 2);
      return {
        ...s,
        goals: Math.max(0, s.baseGoals + goalsVar),
        assists: Math.max(0, s.baseAssists + assistsVar),
        averageRating: Number((s.baseRating + (Math.sin(s.ovr) * 0.08)).toFixed(2)),
        isUser: false
      };
    });

    const allGlobalCandidates = [userCandidate, ...worldCandidates];

    // Fórmula da Bola de Ouro (Ballon d'Or)
    function calcBallonScore(p){
      const ovr = Number(p.ovr) || 50;
      const g = Number(p.goals) || 0;
      const a = Number(p.assists) || 0;
      const cs = Number(p.cleanSheets) || 0;
      const r = Number(p.averageRating) || 6.5;
      const mvp = Number(p.mvpCount) || 0;
      const bonus = Number(p.teamTrophiesBonus) || 0;
      return (ovr * 1.2) + (g * 1.5) + (a * 1.2) + (cs * 0.8) + (r * 8.0) + (mvp * 2.0) + bonus;
    }

    allGlobalCandidates.forEach(p => {
      p.ballonScore = Number(calcBallonScore(p).toFixed(1));
      p.goldenBootPoints = Number(((p.goals || 0) * (p.leagueMultiplier || 1.0)).toFixed(1));
    });

    // 1. PÓDIO DA BOLA DE OURO (BALLON D'OR)
    const sortedBallon = [...allGlobalCandidates].sort((a,b) => b.ballonScore - a.ballonScore);
    const ballonDorTop3 = sortedBallon.slice(0, 3);
    const userWonBallonDor = (ballonDorTop3[0]?.isUser === true);

    // 2. PÓDIO DA CHUTEIRA DE OURO MUNDIAL
    const sortedGoldenBoot = [...allGlobalCandidates].sort((a,b) => (b.goldenBootPoints - a.goldenBootPoints) || (b.goals - a.goals));
    const goldenBootTop3 = sortedGoldenBoot.slice(0, 3);
    const userWonGoldenBoot = (goldenBootTop3[0]?.isUser === true);

    // 3. PÓDIO DO GOLDEN BOY & TROFÉU KOPA (SUB-21)
    const u21Candidates = allGlobalCandidates.filter(p => (Number(p.age) || 25) <= 21);
    const sortedGoldenBoy = [...u21Candidates].sort((a,b) => b.ballonScore - a.ballonScore);
    const goldenBoyTop3 = sortedGoldenBoy.slice(0, 3);
    const userWonGoldenBoy = (goldenBoyTop3[0]?.isUser === true);

    // 4. PRÊMIOS DA LIGA DO ATLETA (COMPETIÇÃO ATUAL)
    const compStats = (typeof getStateCompStats === 'function') ? getStateCompStats(userCompId) : null;
    const leagueTopScorerObj = [...(compStats?.scorers || [])].sort((a, b) => (Number(b.goals) || 0) - (Number(a.goals) || 0))[0];
    const leagueTopAssistObj = [...(compStats?.assists || [])].sort((a, b) => (Number(b.assists) || 0) - (Number(a.assists) || 0))[0];

    const userWonLeagueTopScorer = userGoals > 0 && userGoals >= (leagueTopScorerObj?.goals || 0);

    const userWonLeagueAssists = userAssists > 0 && userAssists >= (leagueTopAssistObj?.assists || 0);

    const userWonLeagueMvp = userAvgRating >= 7.6 && (userGoals >= 5 || userAssists >= 4 || userMvpCount >= 3);
    const isDefenderOrGk = ['GOL', 'GK', 'ZAG', 'CB', 'LAT', 'LB', 'RB', 'LE', 'LD', 'VOL', 'DM'].includes(athlete?.pos || pState.position);
    const userWonLeagueCleanSheets = isDefenderOrGk && userCleanSheets >= 5;

    const leagueAwards = {
      compName: userCompName,
      mvp: {
        title: `Melhor Jogador do ${userCompName} (MVP da Liga)`,
        winnerName: userWonLeagueMvp ? userCandidate.name : (compStats?.mvp?.name || 'A definir'),
        winnerClub: userWonLeagueMvp ? userClub : (compStats?.mvp?.club || '—'),
        isUser: userWonLeagueMvp,
        score: userWonLeagueMvp ? userAvgRating.toFixed(2) : (Number(compStats?.mvp?.rating) || '—')
      },
      topScorer: {
        title: `Bota de Ouro do ${userCompName} (Artilheiro)`,
        winnerName: userWonLeagueTopScorer ? userCandidate.name : (leagueTopScorerObj?.name || 'A definir'),
        winnerClub: userWonLeagueTopScorer ? userClub : (leagueTopScorerObj?.club || '—'),
        isUser: userWonLeagueTopScorer,
        goals: userWonLeagueTopScorer ? userGoals : (Number(leagueTopScorerObj?.goals) || 0)
      },
      assistLeader: {
        title: `Garçom da Temporada (Líder em Passes Decisivos)`,
        winnerName: userWonLeagueAssists ? userCandidate.name : (leagueTopAssistObj?.name || 'A definir'),
        winnerClub: userWonLeagueAssists ? userClub : (leagueTopAssistObj?.club || '—'),
        isUser: userWonLeagueAssists,
        assists: userWonLeagueAssists ? userAssists : (Number(leagueTopAssistObj?.assists) || 0)
      },
      goldenGlove: {
        title: `Luva de Ouro / Muralha (Clean Sheets)`,
        winnerName: userWonLeagueCleanSheets ? userCandidate.name : (compStats?.cleanSheets?.name || 'A definir'),
        winnerClub: userWonLeagueCleanSheets ? userClub : (compStats?.cleanSheets?.club || '—'),
        isUser: userWonLeagueCleanSheets,
        cleanSheets: userWonLeagueCleanSheets ? userCleanSheets : (Number(compStats?.cleanSheets?.count) || 0)
      }
    };

    // 5. VERIFICADOR DE RECORDES HISTÓRICOS DA COMPETIÇÃO
    gameState.competitionRecords = gameState.competitionRecords || {};
    const compKey = userCompId || 'bra-est-df';
    if(!gameState.competitionRecords[compKey]){
      if(compKey === 'bra-a'){
        gameState.competitionRecords[compKey] = {
          compName: 'Campeonato Brasileiro Série A',
          mostGoalsSeason: { holder: 'Washington (Coração Valente)', club: 'Athletico-PR', value: 34, year: 2004 },
          mostAssistsSeason: { holder: 'Arrascaeta', club: 'Flamengo', value: 14, year: 2019 },
          longestUnbeatenStreak: { holder: 'Flamengo', club: 'Flamengo', value: 24, year: 2019 }
        };
      } else if(compKey === 'bra-b'){
        gameState.competitionRecords[compKey] = {
          compName: 'Campeonato Brasileiro Série B',
          mostGoalsSeason: { holder: 'Bruno Rangel', club: 'Chapecoense', value: 31, year: 2013 },
          mostAssistsSeason: { holder: 'Camilo', club: 'Chapecoense', value: 13, year: 2014 },
          longestUnbeatenStreak: { holder: 'Corinthians', club: 'Corinthians', value: 19, year: 2008 }
        };
      } else if(compKey === 'bra-c' || compKey === 'bra-d'){
        gameState.competitionRecords[compKey] = {
          compName: compKey === 'bra-c' ? 'Série C' : 'Série D',
          mostGoalsSeason: { holder: 'Tuta', club: 'Brasiliense', value: 16, year: 2021 },
          mostAssistsSeason: { holder: 'Marcos Aurélio', club: 'Brasiliense', value: 10, year: 2022 },
          longestUnbeatenStreak: { holder: 'Ferroviário', club: 'Ferroviário', value: 15, year: 2023 }
        };
      } else {
        gameState.competitionRecords[compKey] = {
          compName: userCompName || 'Campeonato Candango',
          mostGoalsSeason: { holder: 'Tatu', club: 'Gama', value: 14, year: 2022 },
          mostAssistsSeason: { holder: 'Romarinho', club: 'Brasiliense', value: 8, year: 2023 },
          longestUnbeatenStreak: { holder: 'Ceilândia', club: 'Ceilândia', value: 11, year: 2024 }
        };
      }
    }

    const cRec = gameState.competitionRecords[compKey];
    const recordsBroken = [];

    // Checagem de Recorde de Gols
    if(userGoals > cRec.mostGoalsSeason.value){
      const prev = { ...cRec.mostGoalsSeason };
      cRec.mostGoalsSeason = { holder: userCandidate.name, club: userClub, value: userGoals, year: targetSeason };
      const recItem = {
        type: 'mostGoalsSeason',
        title: 'Maior Artilheiro em uma Única Edição',
        compName: cRec.compName,
        value: userGoals,
        previousHolder: `${prev.holder} (${prev.value} gols)`,
        year: targetSeason
      };
      recordsBroken.push(recItem);
      pState.competitionRecordsBroken.push(recItem);
      pState.individualAwards.push({
        id: 'record_goals_' + targetSeason,
        title: 'Recordista Histórico: Artilharia da Competição',
        year: targetSeason,
        icon: '📜',
        desc: `Novo recorde histórico de ${userGoals} gols em uma única temporada do ${cRec.compName}!`
      });
      pState.personality.maverick = (pState.personality.maverick || 30) + 40;
      pState.personality.virtuoso = (pState.personality.virtuoso || 40) + 30;
      pState.relationships.fansRelation = 100;
      if(athlete) athlete.marketValueMi = Number(((athlete.marketValueMi || 0.5) * 1.10).toFixed(2));
      gameState.news = Array.isArray(gameState.news) ? gameState.news : [];
      gameState.news.unshift(`📜 RECORDE HISTÓRICO! ${userCandidate.name} superou ${prev.holder} e se tornou o Maior Artilheiro da história do ${cRec.compName} em um único ano (${userGoals} gols)!`);
    }

    // Checagem de Recorde de Assistências
    if(userAssists > cRec.mostAssistsSeason.value){
      const prev = { ...cRec.mostAssistsSeason };
      cRec.mostAssistsSeason = { holder: userCandidate.name, club: userClub, value: userAssists, year: targetSeason };
      const recItem = {
        type: 'mostAssistsSeason',
        title: 'Maior Garçom em uma Única Edição',
        compName: cRec.compName,
        value: userAssists,
        previousHolder: `${prev.holder} (${prev.value} assistências)`,
        year: targetSeason
      };
      recordsBroken.push(recItem);
      pState.competitionRecordsBroken.push(recItem);
      pState.individualAwards.push({
        id: 'record_assists_' + targetSeason,
        title: 'Recordista Histórico: Líder de Assistências',
        year: targetSeason,
        icon: '📜',
        desc: `Novo recorde de ${userAssists} assistências no ${cRec.compName}!`
      });
      pState.personality.heartbeat = (pState.personality.heartbeat || 30) + 40;
      pState.personality.virtuoso = (pState.personality.virtuoso || 40) + 30;
      pState.relationships.fansRelation = 100;
      if(athlete) athlete.marketValueMi = Number(((athlete.marketValueMi || 0.5) * 1.10).toFixed(2));
      gameState.news = Array.isArray(gameState.news) ? gameState.news : [];
      gameState.news.unshift(`📜 RECORDE HISTÓRICO! ${userCandidate.name} quebrou o recorde de passes decisivos do ${cRec.compName} com ${userAssists} assistências!`);
    }

    // Checagem de Sequência Invicta
    const userStreak = Number(sStats.unbeatenStreak || 0);
    if(userStreak > cRec.longestUnbeatenStreak.value){
      const prev = { ...cRec.longestUnbeatenStreak };
      cRec.longestUnbeatenStreak = { holder: `${userCandidate.name} / ${userClub}`, club: userClub, value: userStreak, year: targetSeason };
      const recItem = {
        type: 'longestUnbeatenStreak',
        title: 'Maior Sequência Invicta',
        compName: cRec.compName,
        value: userStreak,
        previousHolder: `${prev.holder} (${prev.value} jogos)`,
        year: targetSeason
      };
      recordsBroken.push(recItem);
      pState.competitionRecordsBroken.push(recItem);
      pState.individualAwards.push({
        id: 'record_streak_' + targetSeason,
        title: 'Recordista Histórico: Sequência Invicta',
        year: targetSeason,
        icon: '📜',
        desc: `Incríveis ${userStreak} jogos consecutivos sem derrota!`
      });
      pState.personality.virtuoso = (pState.personality.virtuoso || 40) + 40;
      pState.relationships.boardRelation = 100;
    }

    // 6. ATRIBUIÇÃO DE PRÊMIOS CONQUISTADOS PELO ATLETA
    let wonAnyAward = false;

    if(userWonBallonDor){
      wonAnyAward = true;
      pState.individualAwards.push({
        id: 'ballon_dor_' + targetSeason,
        title: 'Bola de Ouro (Melhor do Mundo)',
        year: targetSeason,
        icon: '👑',
        badge: 'MELHOR DO MUNDO',
        desc: `Eleito o melhor jogador de futebol do planeta na temporada ${targetSeason}!`
      });
      if(athlete) athlete.marketValueMi = Number(((athlete.marketValueMi || 0.5) * 1.35).toFixed(2));
      pState.clubVisibility = 100;
      pState.personality.maverick = (pState.personality.maverick || 30) + 45;
      pState.personality.virtuoso = (pState.personality.virtuoso || 40) + 45;
      pState.relationships.fansRelation = 100;
      pState.relationships.boardRelation = 100;
      gameState.news = Array.isArray(gameState.news) ? gameState.news : [];
      gameState.news.unshift(`👑 HISTÓRICO! BOLA DE OURO! ${userCandidate.name} é eleito o MELHOR JOGADOR DO MUNDO na cerimônia de gala! A consagração máxima do futebol!`);
    }

    if(userWonGoldenBoot){
      wonAnyAward = true;
      pState.individualAwards.push({
        id: 'golden_boot_' + targetSeason,
        title: 'Chuteira de Ouro Mundial',
        year: targetSeason,
        icon: '👟',
        badge: 'ARTILHEIRO MUNDIAL',
        desc: `Maior artilheiro do futebol mundial com ${userGoals} gols (${userCandidate.goldenBootPoints} pts)!`
      });
      if(athlete) athlete.marketValueMi = Number(((athlete.marketValueMi || 0.5) * 1.25).toFixed(2));
      pState.personality.maverick = (pState.personality.maverick || 30) + 35;
      gameState.news = Array.isArray(gameState.news) ? gameState.news : [];
      gameState.news.unshift(`👟 CHUTEIRA DE OURO MUNDIAL! ${userCandidate.name} supera os maiores goleadores da Europa e fatura a Chuteira de Ouro com ${userGoals} gols!`);
    }

    if(userWonGoldenBoy){
      wonAnyAward = true;
      pState.individualAwards.push({
        id: 'golden_boy_' + targetSeason,
        title: 'Golden Boy & Troféu Kopa',
        year: targetSeason,
        icon: '🌟',
        badge: 'MELHOR SUB-21 DO MUNDO',
        desc: `Consagrado como o melhor jovem jogador sub-21 do planeta!`
      });
      if(athlete) athlete.marketValueMi = Number(((athlete.marketValueMi || 0.5) * 1.35).toFixed(2));
      pState.clubVisibility = 95;
      pState.personality.virtuoso = (pState.personality.virtuoso || 40) + 40;
      gameState.news = Array.isArray(gameState.news) ? gameState.news : [];
      gameState.news.unshift(`🌟 GOLDEN BOY! ${userCandidate.name} vence o Troféu Kopa / Golden Boy como a maior revelação mundial do futebol!`);
    }

    if(userWonLeagueMvp){
      wonAnyAward = true;
      pState.individualAwards.push({
        id: 'league_mvp_' + targetSeason,
        title: `Craque do ${userCompName} (MVP)`,
        year: targetSeason,
        icon: '🏅',
        badge: 'CRAQUE DO CAMPEONATO',
        desc: `Eleito o melhor atleta da competição com média ${userAvgRating.toFixed(2)}!`
      });
      if(athlete) athlete.marketValueMi = Number(((athlete.marketValueMi || 0.5) * 1.15).toFixed(2));
      pState.personality.virtuoso = (pState.personality.virtuoso || 40) + 25;
      pState.clubVisibility = Math.max(pState.clubVisibility || 50, 80);
    }

    if(userWonLeagueTopScorer){
      wonAnyAward = true;
      pState.individualAwards.push({
        id: 'league_top_scorer_' + targetSeason,
        title: `Bota de Ouro do ${userCompName}`,
        year: targetSeason,
        icon: '⚽',
        badge: 'ARTILHEIRO DA LIGA',
        desc: `Artilheiro máximo da competição com ${userGoals} gols!`
      });
      if(athlete) athlete.marketValueMi = Number(((athlete.marketValueMi || 0.5) * 1.15).toFixed(2));
      pState.personality.maverick = (pState.personality.maverick || 30) + 30;
      pState.clubVisibility = Math.max(pState.clubVisibility || 50, 80);
    }

    if(userWonLeagueAssists){
      wonAnyAward = true;
      pState.individualAwards.push({
        id: 'league_assists_' + targetSeason,
        title: `Garçom do ${userCompName}`,
        year: targetSeason,
        icon: '🎯',
        badge: 'LÍDER DE ASSISTÊNCIAS',
        desc: `Líder em passes decisivos da competição com ${userAssists} assistências!`
      });
      pState.personality.heartbeat = (pState.personality.heartbeat || 30) + 30;
      pState.relationships.teammatesRelation = Math.min(100, (pState.relationships.teammatesRelation || 75) + 15);
    }

    if(userWonLeagueCleanSheets){
      wonAnyAward = true;
      pState.individualAwards.push({
        id: 'league_clean_sheets_' + targetSeason,
        title: `Luva de Ouro / Muralha do ${userCompName}`,
        year: targetSeason,
        icon: '🧤',
        badge: 'PAREDÃO DO CAMPEONATO',
        desc: `Defesa menos vazada com ${userCleanSheets} jogos sem sofrer gols!`
      });
      pState.personality.heartbeat = (pState.personality.heartbeat || 30) + 30;
      pState.relationships.teammatesRelation = Math.min(100, (pState.relationships.teammatesRelation || 75) + 15);
    }

    if(recordsBroken.length > 0) wonAnyAward = true;

    // Remove duplicatas de troféus individuais por ID
    const uniqueAwardsMap = new Map();
    (pState.individualAwards || []).forEach(aw => {
      if(!uniqueAwardsMap.has(aw.id)) uniqueAwardsMap.set(aw.id, aw);
    });
    pState.individualAwards = [...uniqueAwardsMap.values()];

    // Arquiva temporada no histórico de temporadas do atleta (seasonHistory)
    pState.careerStats = pState.careerStats || {};
    pState.careerStats.seasonHistory = Array.isArray(pState.careerStats.seasonHistory) ? pState.careerStats.seasonHistory : [];
    pState.seasonHistory = Array.isArray(pState.seasonHistory) ? pState.seasonHistory : [];
    
    const seasonSnapshot = {
      season: targetSeason,
      club: userClub,
      competition: userCompName,
      matches: Number(sStats.matches || 0),
      goals: userGoals,
      assists: userAssists,
      cleanSheets: userCleanSheets,
      mvpCount: userMvpCount,
      avgRating: userAvgRating,
      minutesPlayed: Number(sStats.minutesPlayed || 0),
      awards: (pState.individualAwards || []).filter(aw => Number(aw.year) === targetSeason).map(aw => aw.title || aw.name || aw.id),
      recordsBroken: recordsBroken.map(r => r.title),
      overall: userOvr,
      marketValue: athlete?.marketValueMi || pState.marketValue || 0
    };

    const existIdx = pState.careerStats.seasonHistory.findIndex(h => Number(h.season) === targetSeason);
    if(existIdx >= 0){
      pState.careerStats.seasonHistory[existIdx] = seasonSnapshot;
    } else {
      pState.careerStats.seasonHistory.push(seasonSnapshot);
    }
    pState.seasonHistory = pState.careerStats.seasonHistory;

    // Sincroniza linha do tempo acumulada em careerHistory.seasons
    const chAwards = ensurePlayerCareerHistory(pState, gameState);
    if(chAwards && Array.isArray(chAwards.seasons)){
      const existCareerIdx = chAwards.seasons.findIndex(h => Number(h.year) === targetSeason);
      const chSnapshot = {
        year: targetSeason,
        club: userClub,
        division: gameState.division || userCompName || 'Divisão Principal',
        games: Number(sStats.matches || 0),
        goals: userGoals,
        assists: userAssists,
        avgRating: userAvgRating,
        ovrEnd: userOvr,
        titles: (gameState.titles || []).filter(t => ((typeof t === 'object' && t.year) ? Number(t.year) : targetSeason) === targetSeason).map(t => typeof t === 'object' ? t.name : t)
      };
      if(existCareerIdx >= 0){
        chAwards.seasons[existCareerIdx] = chSnapshot;
      } else {
        chAwards.seasons.unshift(chSnapshot);
      }
    }

    const galaData = {
      season: targetSeason,
      ballonDorTop3: ballonDorTop3,
      goldenBootTop3: goldenBootTop3,
      goldenBoyTop3: goldenBoyTop3,
      leagueAwards: leagueAwards,
      recordsBroken: recordsBroken,
      competitionRecords: gameState.competitionRecords[compKey],
      userCandidate: userCandidate,
      userWonAny: wonAnyAward,
      userWonBallonDor: userWonBallonDor,
      userWonGoldenBoot: userWonGoldenBoot,
      userWonGoldenBoy: userWonGoldenBoy,
      userWonLeagueMvp: userWonLeagueMvp,
      userWonLeagueTopScorer: userWonLeagueTopScorer,
      userWonLeagueAssists: userWonLeagueAssists,
      userWonLeagueCleanSheets: userWonLeagueCleanSheets
    };

    pState.lastSeasonGalaAwards = galaData;

    // Gera novas propostas dinâmicas de patrocínio esportivo para a nova temporada
    try {
      generateSeasonSponsorOffers(gameState);
    } catch(err){
      console.warn('Aviso ao gerar patrocínios de fim de temporada:', err);
    }

    return galaData;
  }

  function getClubPrimaryCompetitionId(clubName, preferredCompId = null){
    if(typeof window !== 'undefined' && typeof window.getClubPrimaryCompetitionId === 'function' && window.getClubPrimaryCompetitionId !== getClubPrimaryCompetitionId){
      return window.getClubPrimaryCompetitionId(clubName, preferredCompId);
    }
    if(!clubName) return preferredCompId || 'bra-est-df';
    const normName = String(clubName).toLowerCase().trim();
    // Times do DF (Candangão e Série D)
    if(['brasília', 'brasilia', 'brasiliense', 'gama', 'ceilândia', 'ceilandia', 'real brasília', 'real brasilia', 'capital-df', 'paranoá', 'paranoa', 'samambaia', 'sobradinho', 'taguatinga', 'santa maria'].includes(normName)){
      return 'bra-est-df';
    }
    // Times da Série A
    if(['corinthians', 'palmeiras', 'flamengo', 'são paulo', 'sao paulo', 'grêmio', 'gremio', 'internacional', 'atlético-mg', 'atletico-mg', 'cruzeiro', 'botafogo', 'fluminense', 'vasco', 'bahia', 'fortaleza', 'athletico-pr'].includes(normName)){
      return 'bra-a';
    }
    return preferredCompId || 'bra-est-df';
  }

  function normalizePlayerProgression(pState){
    if(!pState) return 0;
    let levelUps = 0;
    pState.level = Math.max(1, Number(pState.level) || 1);
    pState.xp = Math.max(0, Number(pState.xp) || 0);
    pState.skillPoints = Math.max(0, Number(pState.skillPoints) || 0);
    pState.xpToNextLevel = Math.max(1, Number(pState.xpToNextLevel) || 400);
    while(pState.xp >= pState.xpToNextLevel){
      pState.xp -= pState.xpToNextLevel;
      pState.level++;
      pState.skillPoints += 2;
      pState.availablePoints = (pState.availablePoints || 0) + 2;
      pState.xpToNextLevel = Math.round(pState.xpToNextLevel * 1.25);
      levelUps++;
    }
    return levelUps;
  }

  function syncDailyTrainingLimit(playerState, currentGameDate){
    if(!playerState) return null;
    const dateStr = String(currentGameDate || '2026-01-01');
    if(!playerState.trainingState){
      playerState.trainingState = { dailyCount: 0, lastTrainingDate: dateStr, maxDailyLimit: 3 };
    }
    if(playerState.trainingState.lastTrainingDate !== dateStr){
      playerState.trainingState.dailyCount = 0;
      playerState.trainingState.lastTrainingDate = dateStr;
    }
    playerState.trainingState.maxDailyLimit = 3;
    return playerState;
  }

  function executePracticalTraining({ type, isGoal, playerState, currentGameDate }){
    if(!playerState) return { blocked: true, message: "Estado do jogador inválido." };
    const dateStr = String(currentGameDate || '2026-01-01');
    syncDailyTrainingLimit(playerState, dateStr);

    if(playerState.trainingState.dailyCount >= 3){
      return { blocked: true, message: "Limite diário de 3 treinos atingido!" };
    }

    playerState.trainingState.dailyCount += 1;
    playerState.trainingState.lastTrainingDate = dateStr;

    const xpEarned = isGoal
      ? (type === 'penalty' ? 20 : 35)
      : (type === 'penalty' ? 3 : 5);

    playerState.xp = (playerState.xp || 0) + xpEarned;
    playerState.shootingXp = (playerState.shootingXp || 0) + xpEarned;

    let gainedAttributePoint = false;
    while(playerState.xp >= (playerState.xpToNextLevel || 100)){
      playerState.xp -= (playerState.xpToNextLevel || 100);
      playerState.level = (playerState.level || 1) + 1;
      playerState.availablePoints = (playerState.availablePoints || 0) + 1;
      playerState.skillPoints = (playerState.skillPoints || 0) + 1;
      playerState.xpToNextLevel = Math.round((playerState.xpToNextLevel || 100) * 1.2);
      gainedAttributePoint = true;
    }

    playerState.availablePoints = Math.max(playerState.availablePoints || 0, playerState.skillPoints || 0);
    playerState.skillPoints = playerState.availablePoints;

    if(typeof window.save === 'function'){
      try { window.save(); } catch(_) {}
    }

    return {
      blocked: false,
      isGoal,
      xpEarned,
      gainedAttributePoint,
      remainingToday: Math.max(0, playerState.trainingState.maxDailyLimit - playerState.trainingState.dailyCount)
    };
  }

  // Exporta o motor global
  window.AFM_PlayerEngine = {
    BRAZILIAN_REGIONS_DATA,
    ARCHETYPES,
    PENEIRA_TIERS,
    STARTER_BOOTS,
    SPONSOR_OFFERS,
    SPONSOR_TIERS_CATALOG,
    createStarterSponsorOffer,
    getSponsorTerminationFee,
    signSponsorContract,
    terminateSponsorContract,
    AGENTS_CATALOG,
    STAFF_CATALOG,
    getPlayerAgent,
    hirePlayerAgent,
    hireStaffMember,
    dismissStaffMember,
    calculatePlayerLifestyleCost,
    calculateHiredStaffMonthlyCost,
    generateSeasonSponsorOffers,
    getPlayerSponsorOffers,
    ensureCoachCareerOffer,
    generateCoachOfferForRetirement,
    processPlayerAging,
    startManagerCareerFromPlayerRetirement,
    LIFESTYLE_CATALOG,
    getClubPrimaryCompetitionId,
    calculatePlayerOverall,
    normalizePlayerProgression,
    syncDailyTrainingLimit,
    executePracticalTraining,
    recoverDailyEnergy,
    isPlayerAvailableForMatch,
    calculateBodyModifiers,
    getTrustRole,
    simulateTryoutMatch,
    startPlayerCareer,
    processMatchPerformance,
    processWeeklyTraining,
    processMonthlyAttributeTraining,
    getPlayerEffectiveAttributes,
    getSponsorBootBonus,
    processMonthlyPlayerFinances,
    filePlayerSalaryClaim,
    registerPlayerTransferListing,
    searchPlayerTransferMarket,
    processDailySponsorTurn,
    processEndOfSeasonAwards,
    ensurePlayerCareerHistory,
    lifestyle: (typeof window !== 'undefined' ? window.AFM_Lifestyle : null)
  };
  window.AFM_PlayerCareerEngine = window.AFM_PlayerEngine;

})(window);
