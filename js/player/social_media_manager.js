/**
 * ==============================================================================
 * SISTEMA OFICIAL DE REDE SOCIAL ("FOOTGRAM / INSTAFUT") - AFM 2026
 * MODO CARREIRA JOGADOR
 * ==============================================================================
 * Simulação de rede social estilo Instagram/Threads/X focada em postagens de
 * texto/cards estilizados (sem upload pesado de fotos para economizar save),
 * com engajamento, seguidores, IA de comentários realistas e impacto direto na
 * fama, patrocínios e interesse de clubes gigantes mundiais.
 * ==============================================================================
 */

(function(window){
  'use strict';

  // Catálogo de perfis influentes do mundo esportivo (Imprensa, Clubes e Craques)
  const WORLD_PROFILES = [
    {
      handle: '@FabrizioTransfer',
      name: 'Fabrizio Romano',
      badge: '✓',
      isVerified: true,
      role: 'press',
      avatarText: 'FR',
      avatarBg: '#0284c7',
      bio: 'Here we go! 🚨 Notícias e bastidores do mercado da bola 24h.'
    },
    {
      handle: '@GloboEsporteCom',
      name: 'ge.globo',
      badge: '✓',
      isVerified: true,
      role: 'press',
      avatarText: 'GE',
      avatarBg: '#16a34a',
      bio: 'O maior portal de esportes do Brasil. Notícias, jogos e lances.'
    },
    {
      handle: '@TNTSportsBR',
      name: 'TNT Sports Brasil',
      badge: '✓',
      isVerified: true,
      role: 'press',
      avatarText: 'TNT',
      avatarBg: '#dc2626',
      bio: 'A emoção do futebol sem limites. Casa da Champions League!'
    },
    {
      handle: '@CentralDaBola',
      name: 'Central da Bola',
      badge: '✓',
      isVerified: true,
      role: 'press',
      avatarText: 'CB',
      avatarBg: '#9333ea',
      bio: 'Estatísticas, scouting, promessas e rumores de transferências.'
    },
    {
      handle: '@FuxicoDaBola', name: 'Fuxico da Bola', badge: '✓', isVerified: true,
      role: 'gossip', avatarText: 'FX', avatarBg: '#db2777',
      bio: 'Bastidores, rumores e histórias dos jogadores dentro e fora de campo.'
    },
    {
      handle: '@ArquibancadaDoClube', name: 'Arquibancada Organizada', badge: '', isVerified: false,
      role: 'fans', avatarText: 'TO', avatarBg: '#dc2626',
      bio: 'A voz da torcida: apoio nos bons momentos e cobrança por entrega.'
    },
    {
      handle: '@ViniJr',
      name: 'Vini Jr.',
      badge: '✓',
      isVerified: true,
      role: 'star',
      avatarText: 'VJ',
      avatarBg: '#eab308',
      avatarUrl: 'img/players/tm_371998.jpg',
      bio: 'Baila sempre! ⚡ Atleta do Real Madrid e Seleção Brasileira.'
    },
    {
      handle: '@RodrygoGoes',
      name: 'Rodrygo Goes',
      badge: '✓',
      isVerified: true,
      role: 'star',
      avatarText: 'RG',
      avatarBg: '#f97316',
      avatarUrl: 'img/players/tm_412363.jpg',
      bio: 'Deus no comando sempre! 🙏⚽ Atleta profissional.'
    },
    {
      handle: '@Endrick',
      name: 'Endrick',
      badge: '✓',
      isVerified: true,
      role: 'star',
      avatarText: 'EK',
      avatarBg: '#10b981',
      bio: 'Toda glória a Deus! 🦁 Rumo ao topo.'
    }
  ];

  // Helper de escape HTML seguro
  function safeEsc(str){
    if(typeof window.esc === 'function') return window.esc(str);
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Otimização de URL de foto de perfil via proxy ou canvas minificado
  function optimizeAvatarUrl(rawUrl){
    if(!rawUrl || typeof rawUrl !== 'string') return null;
    const trimmed = rawUrl.trim();
    if(trimmed.startsWith('data:image')) return trimmed; // Já é base64 comprimido
    if(trimmed.startsWith('http://') || trimmed.startsWith('https://')){
      // Proxy wsrv.nl para entregar imagem em WebP minificada (80x80px com 60% qualidade)
      return `https://wsrv.nl/?url=${encodeURIComponent(trimmed)}&w=80&h=80&output=webp&q=60`;
    }
    return trimmed;
  }

  // Formatação de contagem de seguidores / likes (Ex: 12.4K, 1.5M)
  function formatFollowersCount(num){
    const n = Math.max(0, Number(num) || 0);
    if(n >= 1000000){
      return (n / 1000000).toFixed(1).replace('.0', '') + 'M';
    }
    if(n >= 1000){
      return (n / 1000).toFixed(1).replace('.0', '') + 'K';
    }
    return n.toLocaleString('pt-BR');
  }

  // Tiers de celebridade por contagem de seguidores
  function getFollowerTier(followers){
    const f = Math.max(0, Number(followers) || 0);
    if(f >= 10000000){
      return { tier: 6, label: 'Ícone Mundial 👑', color: '#facc15', perk: 'Maior atração midiática do planeta. Patrocínios globais multimilionários.' };
    }
    if(f >= 1000000){
      return { tier: 5, label: 'Estrela Global 🌟', color: '#a855f7', perk: 'Monitorado pelos maiores clubes europeus. Bônus publicitário massivo.' };
    }
    if(f >= 250000){
      return { tier: 4, label: 'Fenômeno das Redes 🚀', color: '#38bdf8', perk: 'Alto engajamento. Propostas de gigantes nacionais e marcas de grande porte.' };
    }
    if(f >= 50000){
      return { tier: 3, label: 'Verificado Oficial ✓', color: '#10b981', perk: 'Selo azul de verificado ativo! Aumento na procura de fornecedores de chuteiras.' };
    }
    if(f >= 10000){
      return { tier: 2, label: 'Influenciador Regional 📱', color: '#fb923c', perk: 'Destaque local. Início de monetização com permutas e incentivos do comércio.' };
    }
    return { tier: 1, label: 'Promessa da Base ⚽', color: '#94a3b8', perk: 'Iniciando trajetória nas redes sociais. Ganhe seguidores jogando bem.' };
  }

  // Inicialização e migração idempotente do estado de Rede Social
  function initSocialMediaState(gameState){
    if(!gameState || !gameState.playerCareerState) return null;
    const pState = gameState.playerCareerState;
    if(!pState.socialMedia){
      const athleteName = pState.athleteName || 'Atleta';
      const cleanHandle = '@' + (athleteName.split(' ')[0] || 'craque').toLowerCase().replace(/[^a-z0-9]/g, '') + '10';
      const clubName = gameState.club || 'Clube';
      
      pState.socialMedia = {
        handle: cleanHandle,
        bio: `⚽ Atleta profissional do ${clubName} | Foco no objetivo! 🇧🇷`,
        avatarUrl: null,
        isVerified: false,
        followers: Math.floor(800 + Math.random() * 800), // Começa humilde (800 - 1.600)
        celebrityLevel: 10,
        postedToday: false,
        lastPostDate: null,
        totalPostsCount: 0,
        feedPosts: []
      };
    }

    const sm = pState.socialMedia;
    sm.handle = sm.handle || '@craque10';
    sm.bio = sm.bio || 'Atleta de futebol profissional.';
    sm.followers = Math.max(100, Number(sm.followers) || 1000);
    sm.celebrityLevel = Math.max(1, Math.min(100, Number(sm.celebrityLevel) || 10));
    sm.postedToday = Boolean(sm.postedToday);
    sm.feedPosts = Array.isArray(sm.feedPosts) ? sm.feedPosts : [];

    // Verificação automática se passar de 50.000 seguidores ou se já jogou pela Seleção
    if(!sm.isVerified && (sm.followers >= 50000 || (pState.internationalStats?.caps || 0) > 0)){
      sm.isVerified = true;
    }

    // Se o feed estiver vazio na primeira abertura, semeia posts de boas-vindas do mundo
    if(sm.feedPosts.length === 0){
      seedInitialWorldPosts(gameState);
    }

    return sm;
  }

  function getAthleteAvatar(gameState){
    const athlete = (gameState?.squad || []).find(p => p.id === gameState.controlledPlayerId || p.isControlled) || {};
    return gameState?.playerCareerState?.socialMedia?.avatarUrl || window.resolvePlayerPhotoUrl?.(athlete) || athlete.photo || null;
  }

  // Gera posts iniciais do mundo para o feed já começar vivo e interessante
  function seedInitialWorldPosts(gameState){
    const pState = gameState.playerCareerState;
    const sm = pState.socialMedia;
    const club = gameState.club || 'Clube';
    const athleteName = pState.athleteName || 'Atleta';

    sm.feedPosts.push({
      id: 'post_world_init_1',
      authorName: `${club} Oficial`,
      handle: `@${club.toLowerCase().replace(/[^a-z0-9]/g, '')}_oficial`,
      avatarText: club.slice(0, 2).toUpperCase(),
      avatarBg: '#0284c7',
      isVerified: true,
      isUser: false,
      timestamp: 'Hoje às 10:15',
      category: 'club',
      text: `Bem-vindos ao FootGram oficial do ${club}! Temporada 2026 começou com tudo e o elenco está 100% focado nos treinamentos diários. Vamos juntos! 🏟️⚽ #Avante`,
      likes: Math.floor(1200 + Math.random() * 800),
      reposts: Math.floor(180 + Math.random() * 90),
      userLiked: false,
      comments: [
        {
          id: 'c_init_1',
          authorName: 'Torcida Fiel',
          handle: '@torcedor_raiz',
          text: 'Vamo pra cima! Queremos ver raça e gols nessa temporada!',
          timestamp: 'Há 2 horas',
          likes: 42
        },
        {
          id: 'c_init_2',
          authorName: 'Central do Futebol',
          handle: '@centralfutebol',
          text: 'Olho nos jovens talentos da base que foram promovidos ao elenco principal!',
          timestamp: 'Há 1 hora',
          likes: 19
        }
      ]
    });

    sm.feedPosts.push({
      id: 'post_world_init_2',
      authorName: 'Fabrizio Romano',
      handle: '@FabrizioTransfer',
      avatarText: 'FR',
      avatarBg: '#0ea5e9',
      isVerified: true,
      isUser: false,
      timestamp: 'Ontem às 18:30',
      category: 'press',
      text: `🚨 Olheiros de clubes nacionais e internacionais estão de olho nas categorias de base e jovens talentos do futebol brasileiro para 2026. Grandes histórias começam agora! Here we go! 🇧🇷✨`,
      likes: Math.floor(8500 + Math.random() * 2000),
      reposts: Math.floor(1450 + Math.random() * 300),
      userLiked: false,
      comments: [
        {
          id: 'c_init_3',
          authorName: 'Scout BR',
          handle: '@scoutbrasil',
          text: 'Muitos nomes promissores surgindo nas divisões e copas de base.',
          timestamp: 'Ontem',
          likes: 85
        }
      ]
    });
  }

  // Gera opções dinâmicas de postagens pré-definidas para o jogador escolher
  function getDynamicPostTemplates(gameState){
    if(!gameState || !gameState.playerCareerState) return [];
    const pState = gameState.playerCareerState;
    const club = gameState.club || 'Clube';
    const athlete = (gameState.squad || []).find(p => p.id === gameState.controlledPlayerId || p.isControlled) || {};
    const athleteName = athlete.name || pState.athleteName || 'Atleta';
    
    // Próximo adversário no calendário
    let nextOpponent = 'Próximo Adversário';
    if(Array.isArray(gameState.schedule) && gameState.schedule[gameState.round]){
      const roundFixtures = gameState.schedule[gameState.round];
      const clubNorm = (typeof window.norm === 'function' ? window.norm(club) : club.toLowerCase());
      const fix = roundFixtures.find(g => Array.isArray(g) && (
        (typeof window.norm === 'function' ? window.norm(g[0]) : g[0].toLowerCase()) === clubNorm ||
        (typeof window.norm === 'function' ? window.norm(g[1]) : g[1].toLowerCase()) === clubNorm
      ));
      if(fix){
        nextOpponent = (typeof window.norm === 'function' && window.norm(fix[0]) === clubNorm) ? fix[1] : fix[0];
      }
    }

    // Histórico de desempenho recente
    const ratingHist = pState.matchRatingHistory || [];
    const lastRating = ratingHist.length ? ratingHist[0] : 6.5;
    const goalsThisSeason = pState.careerStats?.goals || 0;

    return [
      {
        id: 'tpl_training_1',
        category: 'training',
        categoryLabel: '🏋️‍♂️ Treino & Foco (Profissional)',
        categoryColor: '#10b981',
        personalityGain: { virtuoso: 5 },
        trustGain: 2,
        teammateGain: 2,
        risk: 'Baixo (Elogiado pela comissão)',
        text: `Foco absoluto na preparação no CT do ${club}! A temporada é longa e cada gota de suor conta. Seguimos trabalhando duro dia após dia! 💪⚽ #TrabalhoDuro #Foco #${club.replace(/\s+/g, '')}`,
        impactDesc: '+5 Virtuoso · +2 Confiança do Treinador · crescimento moderado'
      },
      {
        id: 'tpl_training_2',
        category: 'training',
        categoryLabel: '🏋️‍♂️ Treino & Foco (Profissional)',
        categoryColor: '#10b981',
        personalityGain: { virtuoso: 5 },
        trustGain: 2,
        teammateGain: 2,
        risk: 'Baixo (Elogiado pela comissão)',
        text: `Sem atalhos para o sucesso. Ajustando a pontaria e o físico para o confronto contra o ${nextOpponent}. Quem quer vencer não escolhe hora! 🏃‍♂️🎯 #TreinoPesado #FutebolArte`,
        impactDesc: '+5 Virtuoso · +2 Relação com Elenco · crescimento moderado'
      },
      {
        id: 'tpl_fans_1',
        category: 'fans',
        categoryLabel: '👥 Torcida & Grupo (Líder)',
        categoryColor: '#38bdf8',
        personalityGain: { heartbeat: 6 },
        fansGain: 4,
        teammateGain: 2,
        risk: 'Muito Baixo (Fortalece laços com a torcida)',
        text: `Nossa força vem diretamente de vocês nas arquibancadas! Essa torcida do ${club} é apaixonada e dá show em todo jogo. Vamos juntos buscar nossos objetivos! 🏟️❤️ #Nação${club.replace(/\s+/g, '')} #JuntosSomosMaisFortes`,
        impactDesc: '+6 Heartbeat · +4 Relação com a Torcida · crescimento moderado'
      },
      {
        id: 'tpl_fans_2',
        category: 'fans',
        categoryLabel: '👥 Torcida & Grupo (Líder)',
        categoryColor: '#38bdf8',
        personalityGain: { heartbeat: 6 },
        fansGain: 4,
        teammateGain: 2,
        risk: 'Muito Baixo (Fortalece laços com a torcida)',
        text: `Grupo unido e fechado! Próxima batalha contra o ${nextOpponent} será uma verdadeira decisão. Contamos com a energia de cada um de vocês nos apoiando! 🤝🔥 #Familia${club.replace(/\s+/g, '')}`,
        impactDesc: '+6 Heartbeat · +2 Elenco · crescimento moderado'
      },
      {
        id: 'tpl_lifestyle_1',
        category: 'lifestyle',
        categoryLabel: '💎 Estilo de Vida & Marra (Astro)',
        categoryColor: '#facc15',
        personalityGain: { maverick: 8 },
        risk: lastRating < 6.0 ? '⚠️ ALTO RISCO (Você jogou mal recentemente e a torcida vai cobrar!)' : 'Moderado (Engajamento explosivo)',
        text: `Dia de folga merecido recarregando as energias! A mente tem que estar tão blindada quanto o futebol. Preparado para o que der e vier! ✨🏖️😎 #EstiloDeVida #FocoNoTopo`,
        impactDesc: '+8 Maverick · ganho moderado (com risco de cobrança na fase ruim)'
      },
      {
        id: 'tpl_lifestyle_2',
        category: 'lifestyle',
        categoryLabel: '💎 Estilo de Vida & Marra (Astro)',
        categoryColor: '#facc15',
        personalityGain: { maverick: 8 },
        risk: 'Moderado (Viraliza nas redes)',
        text: `Eles falam lá fora, a gente resolve dentro das quatro linhas! A confiança está no teto e ninguém para quem tem estrela. O show não pode parar! 🚀⚽🌟 #MarraDeCraque #Ousadia`,
        impactDesc: '+8 Maverick · ganho moderado de seguidores'
      },
      {
        id: 'tpl_market_1',
        category: 'market',
        categoryLabel: '👀 Indireta de Mercado / Futuro',
        categoryColor: '#a855f7',
        personalityGain: { maverick: 6 },
        marketBuzz: true,
        risk: 'Alto (Agita especulações de transferência, mas irrita a diretoria)',
        text: `Coisas grandes estão por vir... O futuro pertence a quem tem coragem de sonhar alto e encarar novos desafios. O tempo é o senhor da razão! ⏳✈️🌍 #NovosDesafios #FutebolSemFronteiras`,
        impactDesc: '+10 pontos percentuais na chance de proposta durante a janela · -4 Diretoria'
      },
      {
        id: 'tpl_market_2',
        category: 'market',
        categoryLabel: '👀 Indireta de Mercado / Futuro',
        categoryColor: '#a855f7',
        personalityGain: { maverick: 6 },
        marketBuzz: true,
        risk: 'Alto (Imprensa internacional repercute)',
        text: `Grato pelo momento presente, mas a ambição nunca dorme. Em breve novidades importantes nos gramados! Silêncio, trabalho e estratégia. 💼🤫⚽ #MercadoDaBola #VisãoDeFuturo`,
        impactDesc: '+10 pontos percentuais na chance de proposta durante a janela · -4 Diretoria'
      }
    ];
  }

  // Gera comentários simulados da IA de acordo com a fase do atleta e o tipo de post
  function generateSimulatedAIComments(template, gameState){
    const pState = gameState.playerCareerState;
    const club = gameState.club || 'Clube';
    const comments = [];
    const ratingHist = pState.matchRatingHistory || [];
    const lastRating = ratingHist.length ? ratingHist[0] : 6.8;
    const isBadPhase = lastRating < 6.0;

    // 1. Companheiro real de elenco do clube atual
    const teammates = (gameState.squad || []).filter(p => p.id !== gameState.controlledPlayerId && !p.isControlled);
    if(teammates.length > 0){
      const teammate = teammates[Math.floor(Math.random() * teammates.length)];
      let tmText = 'Tamo junto irmão! Voando nos treinos! 🔥⚽';
      if(template.category === 'training'){
        tmText = 'A dedicação de hoje é a nossa vitória no fim de semana! Vamo! 💪';
      } else if(template.category === 'lifestyle'){
        tmText = 'Folga merecida meu parceiro, mas segunda-feira é trabalho duro de novo kkkk 🏖️🤙';
      } else if(template.category === 'market'){
        tmText = '👀👀 Segura esse homem!';
      }
      comments.push({
        id: 'c_' + Date.now() + '_1',
        authorName: teammate.name,
        handle: '@' + teammate.name.toLowerCase().replace(/[^a-z0-9]/g, ''),
        avatarText: (teammate.pos || 'AT').slice(0, 2),
        avatarBg: '#3b82f6',
        isVerified: (teammate.overall || 65) >= 78,
        text: tmText,
        timestamp: 'Há 15 min',
        likes: Math.floor(15 + Math.random() * 40)
      });
    }

    // 2. Torcedor / Página de torcedores do clube
    if(isBadPhase && template.category === 'lifestyle'){
      // Torcida cobrando furiosamente por postar ostentação/folga após jogar mal!
      comments.push({
        id: 'c_' + Date.now() + '_2',
        authorName: `Torcida Organizada do ${club}`,
        handle: `@organizada_${club.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
        avatarText: 'TO',
        avatarBg: '#dc2626',
        isVerified: true,
        text: 'Jogou nada no último jogo, nota baixa em campo e tá postando foto na folga?! Menos foto e mais respeito com a camisa!',
        timestamp: 'Há 28 min',
        likes: Math.floor(80 + Math.random() * 120)
      });
      comments.push({
        id: 'c_' + Date.now() + '_3',
        authorName: 'Marcos Torcedor',
        handle: '@marcos_fiel',
        avatarText: 'MT',
        avatarBg: '#64748b',
        isVerified: false,
        text: 'Vai treinar finalização, cara! Domingo precisamos dos 3 pontos!',
        timestamp: 'Há 12 min',
        likes: 34
      });
    } else {
      // Torcida elogiando ou apoiando
      let fanText = 'Joga demais! Orgulho de ver com a nossa camisa! 👏🔥';
      if(template.category === 'market'){
        fanText = 'Não inventa de sair do nosso time agora, pelo amor de Deus! Fica e vira ídolo! 🥺🙏';
      } else if(template.category === 'fans'){
        fanText = 'A arquibancada é sua casa! Domingo estaremos lá cantando os 90 minutos!';
      }
      comments.push({
        id: 'c_' + Date.now() + '_2',
        authorName: `Portal do ${club}`,
        handle: `@portal_${club.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
        avatarText: 'PT',
        avatarBg: '#059669',
        isVerified: true,
        text: fanText,
        timestamp: 'Há 25 min',
        likes: Math.floor(45 + Math.random() * 70)
      });
    }

    // 3. Jornalista Esportivo / Página de Scout
    if(template.category === 'market'){
      comments.push({
        id: 'c_' + Date.now() + '_4',
        authorName: 'Fabrizio Romano',
        handle: '@FabrizioTransfer',
        avatarText: 'FR',
        avatarBg: '#0284c7',
        isVerified: true,
        text: '🚨 Informação de bastidores: clubes da Europa e gigantes nacionais monitoram a situação contratual. Conversas em andamento para a janela! ⏳',
        timestamp: 'Há 8 min',
        likes: Math.floor(120 + Math.random() * 200)
      });
    } else {
      comments.push({
        id: 'c_' + Date.now() + '_4',
        authorName: 'Central da Bola',
        handle: '@CentralDaBola',
        avatarText: 'CB',
        avatarBg: '#8b5cf6',
        isVerified: true,
        text: lastRating >= 7.5 ? 'Excelente momento na temporada. Estatísticas ofensivas chamando a atenção de analistas!' : 'Evoluindo a cada rodada. Foco no trabalho!',
        timestamp: 'Há 10 min',
        likes: Math.floor(25 + Math.random() * 50)
      });
    }

    return comments;
  }

  // Executa a publicação do post escolhido pelo jogador
  function publishUserPost(templateId, gameState){
    if(templateId && typeof templateId === 'object' && templateId.playerCareerState){
      const tmp = templateId;
      templateId = gameState;
      gameState = tmp;
    }
    if(!gameState || !gameState.playerCareerState) return { ok: false, success: false, error: 'Carreira inválida.' };
    const pState = gameState.playerCareerState;
    const sm = initSocialMediaState(gameState);

    if(sm.postedToday){
      return { ok: false, success: false, error: 'Você já fez uma publicação hoje! O engajamento está rolando. Avance o dia no calendário para uma nova publicação.' };
    }

    const templates = getDynamicPostTemplates(gameState);
    let tpl = (typeof templateId === 'string') 
      ? (templates.find(t => t.id === templateId || t.text === templateId) || templates.find(t => t.category === templateId))
      : null;
    if(!tpl) tpl = templates[0];
    if(!tpl) return { ok: false, success: false, error: 'Modelo de postagem não encontrado.' };

    const athleteName = pState.athleteName || 'Atleta';
    const followers = sm.followers || 1000;
    const ratingHist = pState.matchRatingHistory || [];
    const lastRating = ratingHist.length ? ratingHist[0] : 6.8;
    const isBadPhase = lastRating < 6.0;

    // Cálculo realista de engajamento imediato baseado na base de seguidores
    const engagementRatio = 0.08 + Math.random() * 0.12; // 8% a 20% da base curte
    let likes = Math.max(12, Math.floor(followers * engagementRatio));
    let reposts = Math.max(3, Math.floor(likes * (0.15 + Math.random() * 0.15)));

    // Gera comentários contextuais por IA
    const comments = generateSimulatedAIComments(tpl, gameState);

    // Cria o card do post
    const newPost = {
      id: 'post_user_' + Date.now(),
      authorName: athleteName,
      handle: sm.handle,
      avatarUrl: getAthleteAvatar(gameState),
      avatarText: athleteName.slice(0, 2).toUpperCase(),
      avatarBg: '#10b981',
      isVerified: Boolean(sm.isVerified),
      isUser: true,
      timestamp: 'Agora mesmo',
      category: tpl.category,
      categoryLabel: tpl.categoryLabel,
      text: tpl.text,
      likes: likes,
      reposts: reposts,
      userLiked: false,
      comments: comments
    };

    // Previne estouro de memória: limita rigidamente aos últimos 25 posts no feed
    sm.feedPosts.unshift(newPost);
    if(sm.feedPosts.length > 25){
      sm.feedPosts = sm.feedPosts.slice(0, 25);
    }

    sm.postedToday = true;
    sm.lastPostDate = gameState.date;
    sm.totalPostsCount = (sm.totalPostsCount || 0) + 1;

    // Aplica ganhos/perdas de seguidores e relacionamentos
    const hasMarketing = !!(pState?.hiredStaff?.marketing_team || pState?.lifestylePerks?.pressAgent);
    let followersDelta = 0;
    if(isBadPhase && tpl.category === 'lifestyle'){
      // Torcida cobrou: perde seguidores e confiança (a equipe de marketing amortece a perda)
      const baseLoss = Math.floor(60 + Math.random() * 100);
      followersDelta = hasMarketing ? -Math.floor(baseLoss * 0.5) : -baseLoss;
      pState.relationships = pState.relationships || { boardRelation: 65, fansRelation: 70, teammatesRelation: 75 };
      pState.relationships.fansRelation = Math.max(10, (pState.relationships.fansRelation || 70) - (hasMarketing ? 2 : 4));
      pState.managerTrust = Math.max(5, (pState.managerTrust || 35) - (hasMarketing ? 1 : 2));
      gameState.news = Array.isArray(gameState.news) ? gameState.news : [];
      gameState.news.unshift(`📱 REDES SOCIAIS: A torcida do ${gameState.club} criticou a postagem de ${athleteName} em dia de folga após atuação abaixo do esperado.${hasMarketing ? ' Sua Equipe de Marketing agiu rápido na moderação para conter o cancelamento!' : ''}`);
    } else {
      // Equipe de marketing modera o ganho para evitar crescimento desproporcional.
      const baseGain = Math.floor(80 + Math.random() * 141) + (tpl.category === 'lifestyle' ? 100 : 0);
      followersDelta = hasMarketing ? Math.round(baseGain * 1.2) : baseGain;
      if(tpl.category === 'fans') {
        pState.relationships = pState.relationships || { boardRelation: 65, fansRelation: 70, teammatesRelation: 75 };
        pState.relationships.fansRelation = Math.min(100, (pState.relationships.fansRelation || 70) + (hasMarketing ? 4 : 3));
      }
      if(tpl.category === 'training') {
        pState.managerTrust = Math.min(100, (pState.managerTrust || 35) + 2);
      }
    }

    if(tpl.marketBuzz){
      pState.marketBuzzActive = true;
      pState.relationships = pState.relationships || { boardRelation: 65, fansRelation: 70, teammatesRelation: 75 };
      pState.relationships.boardRelation = Math.max(10, (pState.relationships.boardRelation || 65) - 4);
      gameState.news = Array.isArray(gameState.news) ? gameState.news : [];
      gameState.news.unshift(`💼 MERCADO AQUECIDO: Post enigmático de ${athleteName} desperta rumores de transferência e agita olheiros nacionais e internacionais!`);
    }

    sm.followers = Math.max(200, sm.followers + followersDelta);
    sm.celebrityLevel = Math.min(100, Math.max(1, Math.round(10 + Math.log10(sm.followers) * 18)));

    // Verifica se atingiu verificado oficial
    if(!sm.isVerified && sm.followers >= 50000){
      sm.isVerified = true;
      if(typeof window.toast === 'function'){
        window.toast('🎉 PARABÉNS! Você atingiu 50.000 seguidores e conquistou o SELO AZUL DE VERIFICADO oficial!');
      }
    }

    // Aplica pontos de personalidade
    pState.personality = pState.personality || { maverick: 30, heartbeat: 30, virtuoso: 40 };
    if(tpl.personalityGain?.virtuoso) pState.personality.virtuoso = (pState.personality.virtuoso || 40) + tpl.personalityGain.virtuoso;
    if(tpl.personalityGain?.heartbeat) pState.personality.heartbeat = (pState.personality.heartbeat || 30) + tpl.personalityGain.heartbeat;
    if(tpl.personalityGain?.maverick) pState.personality.maverick = (pState.personality.maverick || 30) + tpl.personalityGain.maverick;

    return {
      ok: true,
      success: true,
      post: newPost,
      followersDelta,
      newFollowersTotal: sm.followers,
      isBadPhase
    };
  }

  // Atualização de impacto de redes sociais após cada partida do atleta
  function processPostMatchSocialImpact(gameState, matchResult, performanceReport){
    if(!gameState || !gameState.playerCareerState) return;
    const sm = initSocialMediaState(gameState);
    const pState = gameState.playerCareerState;
    const athleteName = pState.athleteName || 'Atleta';
    const club = gameState.club || 'Clube';

    const goals = Number(performanceReport?.goals || 0);
    const assists = Number(performanceReport?.assists || 0);
    const rating = Number(performanceReport?.rating || 6.5);
    const isMvp = Boolean(performanceReport?.isMvp);
    const isIntMatch = Boolean(window.internationalMatchSession);

    let followerGains = 0;
    let celebrityGains = 0;

    if(isIntMatch){
      // Partida internacional da Seleção dá salto gigantesco de seguidores
      followerGains += Math.floor(2500 + Math.random() * 3500);
      celebrityGains += 5;
      if(goals > 0) followerGains += goals * 2500;
      if(assists > 0) followerGains += assists * 1200;
    } else {
      // Partida de clube
      if(goals > 0){
        followerGains += goals * Math.floor(400 + Math.random() * 600);
        celebrityGains += goals * 2;
      }
      if(assists > 0){
        followerGains += assists * Math.floor(200 + Math.random() * 400);
        celebrityGains += assists * 1;
      }
      if(isMvp || rating >= 8.0){
        followerGains += Math.floor(800 + Math.random() * 1200);
        celebrityGains += 3;
      } else if(rating >= 7.0){
        followerGains += Math.floor(200 + Math.random() * 400);
        celebrityGains += 1;
      } else if(rating < 5.8){
        // Atuação muito apagada perde alguns seguidores
        followerGains -= Math.floor(100 + Math.random() * 250);
      }
    }

    sm.followers = Math.max(300, sm.followers + followerGains);
    sm.celebrityLevel = Math.min(100, Math.max(1, sm.celebrityLevel + celebrityGains));

    if(!sm.isVerified && sm.followers >= 50000){
      sm.isVerified = true;
    }

    // A imprensa repercute toda atuação; o texto usa o placar e os dados reais do relatório.
    {
      const resultLine = `${club} ${performanceReport?.resultText || 'placar indisponível'} ${performanceReport?.opponent || 'Adversário'}`;
      gameState.news = Array.isArray(gameState.news) ? gameState.news : [];
      gameState.news.unshift(`📰 PÓS-JOGO: ${resultLine}. ${athleteName} recebeu nota ${rating.toFixed(1)}, marcou ${goals} gol(s) e deu ${assists} assistência(s)${isMvp ? ' — eleito Craque do Jogo.' : '.'}`);
      gameState.news.length = Math.min(gameState.news.length, 50);
      const pressPost = {
        id: `post_press_${gameState.date || Date.now()}_${Date.now()}`,
        authorName: isIntMatch ? 'CBF Oficial' : 'ge.globo',
        handle: isIntMatch ? '@cbf_oficial' : '@GloboEsporteCom',
        avatarText: isIntMatch ? 'BR' : 'GE',
        avatarBg: isIntMatch ? '#facc15' : '#16a34a',
        isVerified: true,
        isUser: false,
        timestamp: 'Hoje após o apito final',
        category: 'press',
        text: `${isIntMatch ? '🇧🇷' : '⚽'} FIM DE JOGO: ${resultLine}. ${athleteName}: nota ${rating.toFixed(1)}, ${goals} gol(s), ${assists} assistência(s)${isMvp ? ' e eleito Craque do Jogo 🏆' : ''}. #FutebolBrasileiro`,
        likes: Math.floor(3500 + Math.random() * 5000),
        reposts: Math.floor(600 + Math.random() * 1200),
        userLiked: false,
        comments: [
          {
            id: 'cp_1_' + Date.now(),
            authorName: 'Fã de Futebol',
            handle: '@futebolemtudo',
            text: 'Que partida absurda desse garoto! Joga muito fácil!',
            timestamp: 'Há 5 min',
            likes: 88
          },
          {
            id: 'cp_2_' + Date.now(),
            authorName: 'Scout Internacional',
            handle: '@scouteurope',
            text: 'Anotem esse nome. O teto de evolução dele é absurdo.',
            timestamp: 'Há 3 min',
            likes: 45
          }
        ]
      };
      sm.feedPosts.unshift(pressPost);
      if(sm.feedPosts.length > 25) sm.feedPosts = sm.feedPosts.slice(0, 25);
    }
    if(!isIntMatch && rating < 6.0){
      const loss = rating < 5.8 ? 0 : Math.floor(80 + Math.random() * 141);
      sm.followers = Math.max(300, sm.followers - loss);
      const clubSlug = club.toLowerCase().replace(/[^a-z0-9]/g, '');
      sm.feedPosts.unshift({
        id: `post_fans_${gameState.date || Date.now()}_${Date.now()}`,
        authorName: `Torcida Organizada do ${club}`, handle: `@organizada_${clubSlug}`,
        avatarText: 'TO', avatarBg: '#dc2626', isVerified: false, isUser: false,
        timestamp: 'Hoje após o apito final', category: 'fans',
        text: `📣 A torcida cobra ${athleteName} após nota ${rating.toFixed(1)} contra ${performanceReport?.opponent || 'o adversário'}: queremos mais entrega e reação no próximo jogo.`,
        likes: Math.floor(90 + Math.random() * 250), reposts: Math.floor(15 + Math.random() * 70), userLiked: false,
        comments: [{ id: `cf_${Date.now()}`, authorName: 'Torcedor da arquibancada', handle: '@voz_da_arquibancada', text: 'Apoio não falta, mas a camisa exige resposta dentro de campo.', timestamp: 'Há 5 min', likes: 18 }]
      });
      if(sm.feedPosts.length > 25) sm.feedPosts.length = 25;
    }
  }

  function publishTransferProposal(gameState, offer){
    if(gameState?.gameMode !== 'player' || !gameState.playerCareerState || !offer) return false;
    const sm = initSocialMediaState(gameState);
    const club = offer.newClub || offer.clubOrBrand || 'um clube interessado';
    sm.feedPosts.unshift({
      id: `post_offer_${offer.id || Date.now()}`, authorName: 'Central da Bola', handle: '@CentralDaBola',
      avatarText: 'CB', avatarBg: '#9333ea', isVerified: true, isUser: false,
      timestamp: 'Agora', category: 'market',
      text: `🚨 MERCADO: ${club} enviou uma proposta de ${offer.type === 'club_loan' ? 'empréstimo' : 'transferência'} por ${gameState.playerCareerState.athleteName || 'o atleta'}. A oferta está com o empresário para avaliação.`,
      likes: Math.floor(250 + Math.random() * 900), reposts: Math.floor(30 + Math.random() * 180), userLiked: false,
      comments: [{ id: `co_${Date.now()}`, authorName: 'Fuxico da Bola', handle: '@FuxicoDaBola', text: 'Bastidores indicam que a proposta será analisada com cuidado. 👀', timestamp: 'Agora', likes: 12 }]
    });
    if(sm.feedPosts.length > 25) sm.feedPosts.length = 25;
    return true;
  }

  function publishPlayerListing(gameState, listing){
    if(gameState?.gameMode !== 'player' || !gameState.playerCareerState || !listing) return false;
    const sm = initSocialMediaState(gameState);
    const club = gameState.club || 'Clube';
    const athlete = gameState.playerCareerState.athleteName || 'Atleta';
    sm.feedPosts.unshift({
      id: `post_listing_${listing.type}_${listing.date || Date.now()}`,
      authorName: `${club} Oficial`,
      handle: `@${club.toLowerCase().replace(/[^a-z0-9]/g, '')}_oficial`,
      avatarText: club.slice(0, 2).toUpperCase(), avatarBg: '#0284c7', isVerified: true, isUser: false,
      timestamp: 'Agora', category: 'market',
      text: `📋 ${club} aceitou o pedido de ${athlete} e o colocou na lista de ${listing.type === 'loan' ? 'empréstimos' : 'transferências'}. Propostas serão divulgadas quando chegarem ao empresário.`,
      likes: Math.floor(80 + Math.random() * 220), reposts: Math.floor(8 + Math.random() * 35), userLiked: false,
      comments: []
    });
    if(sm.feedPosts.length > 25) sm.feedPosts.length = 25;
    return true;
  }

  function publishPlayerInterview(gameState, quote, report){
    if(gameState?.gameMode !== 'player' || !gameState.playerCareerState || !report?.isMvp || !String(quote || '').trim()) return false;
    const pState = gameState.playerCareerState;
    const sm = initSocialMediaState(gameState);
    const athleteName = pState.athleteName || 'Atleta';
    const opponent = report.opponent || 'adversário';
    const article = `📰 ENTREVISTA PÓS-JOGO: ${athleteName} fala após ser eleito Craque da Partida contra o ${opponent}: “${quote}”`;
    gameState.news = Array.isArray(gameState.news) ? gameState.news : [];
    gameState.news.unshift(article);
    gameState.news = gameState.news.slice(0, 50);
    sm.feedPosts = Array.isArray(sm.feedPosts) ? sm.feedPosts : [];
    sm.feedPosts.unshift({
      id: 'post_interview_' + Date.now(),
      authorName: athleteName,
      handle: sm.handle,
      avatarUrl: getAthleteAvatar(gameState),
      avatarText: athleteName.slice(0, 2).toUpperCase(),
      avatarBg: '#10b981',
      isVerified: Boolean(sm.isVerified),
      isUser: true,
      timestamp: 'Agora mesmo · entrevista pós-jogo',
      category: 'interview',
      text: `🎙️ Eleito Craque da Partida contra o ${opponent}, ${athleteName} falou à imprensa: “${quote}” #CraqueDaPartida`,
      likes: 0,
      reposts: 0,
      userLiked: false,
      comments: []
    });
    sm.feedPosts = sm.feedPosts.slice(0, 25);
    return true;
  }

  // Processa a virada de dia no calendário: reseta limite diário e gera posts orgânicos
  function onDayAdvance(gameState, nextDate){
    if(gameState?.gameMode !== 'player' || !gameState.playerCareerState) return;
    const pState = gameState.playerCareerState;
    const sm = initSocialMediaState(gameState);

    // 1. Reseta o limite de postagem diária
    sm.postedToday = false;

    // 2. Crescimento orgânico leve de likes em posts recentes
    if(Array.isArray(sm.feedPosts)){
      sm.feedPosts.slice(0, 5).forEach(post => {
        post.likes = Math.round((post.likes || 10) * (1.02 + Math.random() * 0.05));
        post.reposts = Math.round((post.reposts || 2) * (1.01 + Math.random() * 0.04));
      });
    }

    // Uma página esportiva publica por data; evita feed parado e duplicatas em avanços repetidos.
    if(nextDate && pState.lastSocialWorldPostDate !== nextDate){
      for(let postIndex = 0; postIndex < 3; postIndex++) generateRandomWorldPost(gameState, postIndex, nextDate);
      pState.lastSocialWorldPostDate = nextDate;
    }

    // 4. Ação da Equipe de Marketing & Assessoria de Imprensa (FootGram PR)
    if(nextDate && pState.lastDailyNewsDate !== nextDate){
      const name = pState.athleteName || 'O atleta';
      const headlines = [
        `📱 ${name} segue a rotina de preparação no ${gameState.club || 'clube'} e mantém o foco na temporada.`,
        `⚽ Bastidores: ${name} trabalha para ganhar espaço e ajudar o ${gameState.club || 'clube'} nos próximos desafios.`,
        `📰 ${name} continua em evolução no ${gameState.club || 'clube'}; comissão acompanha o desenvolvimento do jovem atleta.`
      ];
      gameState.news = Array.isArray(gameState.news) ? gameState.news : [];
      gameState.news.unshift(headlines[new Date(`${nextDate}T12:00:00`).getDate() % headlines.length]);
      gameState.news = gameState.news.slice(0, 50);
      pState.lastDailyNewsDate = nextDate;
    }
    const hasMarketing = !!(pState?.hiredStaff?.marketing_team || pState?.lifestylePerks?.pressAgent);
    if(hasMarketing){
      const ovr = Number(pState.athleteOvr || 45);
      const mktGain = Math.floor((25 + Math.random() * 50) * Math.max(1, (ovr - 40) * 0.05));
      sm.followers = Math.max(100, (sm.followers || 500) + mktGain);
      sm.celebrityLevel = Math.min(100, Math.max(1, Math.round(10 + Math.log10(sm.followers) * 18)));
      if(!sm.isVerified && sm.followers >= 50000){
        sm.isVerified = true;
        if(typeof window.toast === 'function'){
          window.toast('🎉 PARABÉNS! Você atingiu 50.000 seguidores e conquistou o SELO AZUL DE VERIFICADO!');
        }
      }
    }
  }

  // Gera posts do mundo aleatórios (Rumores de mercado de gigantes, outros craques, etc.)
  function generateRandomWorldPost(gameState, postIndex = 0, postDate = null){
    const pState = gameState.playerCareerState;
    const sm = pState.socialMedia;
    const athleteName = pState.athleteName || 'Atleta';
    const club = gameState.club || 'Clube';
    const celebrity = sm.celebrityLevel || 10;
    const recentRating = Number(pState.matchRatingHistory?.[0]?.rating ?? pState.matchRatingHistory?.[0]) || 6.5;
    if(recentRating < 6 && postIndex === 0){
      const dateKey = String(postDate || gameState.date || Date.now()).slice(0, 10);
      sm.feedPosts.unshift({
        id: `post_fans_day_${dateKey}_${postIndex}`, authorName: `Torcida Organizada do ${club}`,
        handle: `@organizada_${club.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
        avatarText: 'TO', avatarBg: '#dc2626', isVerified: false, isUser: false,
        timestamp: 'Hoje', category: 'fans',
        text: `📣 A fase pede reação: a torcida do ${club} espera mais de ${athleteName} depois das últimas atuações. Apoio existe, mas queremos entrega!`,
        likes: Math.floor(250 + Math.random() * 700), reposts: Math.floor(20 + Math.random() * 100), userLiked: false,
        comments: [{ id: `cw_${dateKey}`, authorName: 'Torcedor', handle: '@futebol_raiz', text: 'Tem que responder em campo no próximo jogo.', timestamp: 'Há 1 hora', likes: 14 }]
      });
      if(sm.feedPosts.length > 25) sm.feedPosts.length = 25;
      return;
    }

    let worldPost = null;

    if(celebrity >= 30 && Math.random() < 0.5){
      // Rumor de transferência para gigantes mundiais
      const giants = ['Real Madrid', 'Barcelona', 'Manchester City', 'Paris Saint-Germain', 'Bayern de Munique', 'Arsenal', 'Flamengo', 'Palmeiras'];
      const giant = giants[Math.floor(Math.random() * giants.length)];
      worldPost = {
        id: `post_rumor_${String(postDate || gameState.date || Date.now()).slice(0, 10)}_${postIndex}`,
        authorName: 'Fabrizio Romano',
        handle: '@FabrizioTransfer',
        avatarText: 'FR',
        avatarBg: '#0284c7',
        isVerified: true,
        isUser: false,
        timestamp: 'Há 1 hora',
        category: 'market',
        text: `🚨 Sondagem de peso: Olheiros do ${giant} acompanham de perto os relatórios de ${athleteName} no ${club}. O apelo de mídia e a evolução em campo chamam atenção para as próximas janelas! ⏳👀`,
        likes: Math.floor(12000 + Math.random() * 6000),
        reposts: Math.floor(2800 + Math.random() * 1500),
        userLiked: false,
        comments: [
          {
            id: 'cr_1',
            authorName: 'Fanático por Futebol',
            handle: '@futebolnaveia',
            text: `Seria uma contratação gigantesca pro ${giant}!`,
            timestamp: 'Há 45 min',
            likes: 310
          }
        ]
      };
    } else {
      // Página de fofoca acompanha a trajetória do atleta do save.
      const star = { name: 'Fuxico da Bola', handle: '@FuxicoDaBola', avatarText: 'FX', avatarBg: '#db2777' };
      worldPost = {
        id: `post_star_${String(postDate || gameState.date || Date.now()).slice(0, 10)}_${postIndex}`,
        authorName: star.name,
        handle: star.handle,
        avatarText: star.avatarText,
        avatarBg: star.avatarBg,
        isVerified: true,
        isUser: false,
        timestamp: 'Há 3 horas',
        category: 'gossip',
        text: celebrity >= 30
          ? `👀 Bastidores do ${club}: ${athleteName} está chamando atenção pelo crescimento dentro e fora de campo. Será que vem novidade na carreira? #MercadoDaBola`
          : `📸 No radar: ${athleteName} segue trabalhando no ${club} e começa a despertar comentários entre torcedores e páginas esportivas. Vamos acompanhar!`,
        likes: Math.floor(250 + Math.random() * 1800),
        reposts: Math.floor(25 + Math.random() * 350),
        userLiked: false,
        comments: [
          {
            id: 'cs_1',
            authorName: 'Fã Clube Oficial',
            handle: '@fc_estrelas',
            text: 'Inspiração total para as novas gerações!',
            timestamp: 'Há 2 horas',
            likes: 540
          }
        ]
      };
    }

    if(worldPost){
      sm.feedPosts.unshift(worldPost);
      if(sm.feedPosts.length > 25) sm.feedPosts = sm.feedPosts.slice(0, 25);
    }
  }

  // Atualização do `@handle`
  function updateProfileHandle(newHandle, gameState){
    if(!gameState || !gameState.playerCareerState) return false;
    const sm = initSocialMediaState(gameState);
    let clean = String(newHandle || '').trim();
    if(!clean.startsWith('@')) clean = '@' + clean;
    clean = clean.toLowerCase().replace(/[^a-z0-9_@]/g, '');
    if(clean.length < 3) clean = '@craque10';
    sm.handle = clean;
    return true;
  }

  // Atualização da Bio do perfil
  function updateProfileBio(newBio, gameState){
    if(!gameState || !gameState.playerCareerState) return false;
    const sm = initSocialMediaState(gameState);
    sm.bio = String(newBio || '').trim().slice(0, 160);
    return true;
  }

  // Atualização de Foto via URL (Proxy wsrv.nl) ou Canvas
  function updateProfileAvatar(urlOrData, gameState){
    if(!gameState || !gameState.playerCareerState) return false;
    const sm = initSocialMediaState(gameState);
    sm.avatarUrl = optimizeAvatarUrl(urlOrData);
    return true;
  }

  // Curtir / Descurtir um post do feed
  function toggleLikePost(postId, gameState){
    if(!gameState || !gameState.playerCareerState) return;
    const sm = initSocialMediaState(gameState);
    const p = sm.feedPosts.find(post => post.id === postId);
    if(!p) return;
    if(p.userLiked){
      p.userLiked = false;
      p.likes = Math.max(0, (p.likes || 1) - 1);
    } else {
      p.userLiked = true;
      p.likes = (p.likes || 0) + 1;
    }
  }

  // Adiciona um comentário do jogador em qualquer post
  function addCommentToPost(postId, commentText, gameState){
    if(!gameState || !gameState.playerCareerState) return false;
    const sm = initSocialMediaState(gameState);
    const p = sm.feedPosts.find(post => post.id === postId);
    if(!p) return false;
    const txt = String(commentText || '').trim();
    if(!txt) return false;

    p.comments = Array.isArray(p.comments) ? p.comments : [];
    p.comments.unshift({
      id: 'c_user_' + Date.now(),
      authorName: gameState.playerCareerState.athleteName || 'Você',
      handle: sm.handle,
      avatarUrl: getAthleteAvatar(gameState),
      avatarText: (gameState.playerCareerState.athleteName || 'VC').slice(0, 2).toUpperCase(),
      avatarBg: '#10b981',
      isVerified: Boolean(sm.isVerified),
      text: txt,
      timestamp: 'Agora mesmo',
      likes: 1
    });

    return true;
  }

  // =========================================================================
  // EXPORTAÇÃO GLOBAL
  // =========================================================================
  window.AFM_SocialMedia = {
    WORLD_PROFILES,
    initSocialMediaState,
    getFollowerTier,
    formatFollowersCount,
    getDynamicPostTemplates,
    publishUserPost,
    processPostMatchSocialImpact,
    publishTransferProposal,
    publishPlayerListing,
    publishPlayerInterview,
    onDayAdvance,
    updateProfileHandle,
    updateProfileBio,
    updateProfileAvatar,
    toggleLikePost,
    addCommentToPost,
    optimizeAvatarUrl
  };

})(window);
