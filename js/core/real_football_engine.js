/**
 * AFM Manager 2027 - Real Football Engine & 3D / 2.5D Graphics Enhancer
 * 
 * 1. Kit Colors & Patterns: Cores e uniformes autênticos de clubes (Brasil, América do Sul, Europa, Ásia)
 * 2. Regras Oficiais do Futebol (IFAB/FIFA/CONMEBOL):
 *    - 5 substituições em até 3 paradas durante a partida (intervalo livre)
 *    - +1 substituição e +1 parada em prorrogações de mata-mata
 *    - Acréscimos realistas (1º e 2º tempo com placa do 4º árbitro)
 *    - Prorrogação (2x 15 min) e Pênaltis alternados para jogos eliminatórios empatados
 *    - Suspensões automáticas por 3 amarelos ou cartão vermelho direto
 * 3. Renderização 3D/2.5D com perspectiva, sombras dinâmicas, texturas e redes tridimensionais
 */

(function(window){
  'use strict';

  // =========================================================================
  // 1. BANCO DE CORES E UNIFORMES REAIS DE CLUBES (KITS AUTÊNTICOS)
  // =========================================================================
  const CLUB_KITS = {
    // SÉRIE A & B BRASIL EXPANDIDO
    'criciuma': {
      home: { primary: '#f59e0b', secondary: '#111111', tertiary: '#ffffff', pattern: 'stripes_h_tricolor', shorts: '#111111', socks: '#ffffff', number: '#ffffff' },
      away: { primary: '#ffffff', secondary: '#f59e0b', pattern: 'solid', shorts: '#111111', socks: '#ffffff', number: '#111111' },
      gk: { primary: '#16a34a', secondary: '#ffffff', shorts: '#16a34a' }
    },
    'cuiaba': {
      home: { primary: '#15803d', secondary: '#facc15', pattern: 'solid', shorts: '#15803d', socks: '#15803d', number: '#facc15' },
      away: { primary: '#ffffff', secondary: '#15803d', pattern: 'solid', shorts: '#ffffff', socks: '#ffffff', number: '#15803d' },
      gk: { primary: '#0284c7', secondary: '#ffffff', shorts: '#0284c7' }
    },
    'juventude': {
      home: { primary: '#15803d', secondary: '#ffffff', pattern: 'stripes_v', shorts: '#ffffff', socks: '#15803d', number: '#ffffff' },
      away: { primary: '#ffffff', secondary: '#15803d', pattern: 'solid', shorts: '#15803d', socks: '#ffffff', number: '#15803d' },
      gk: { primary: '#f59e0b', secondary: '#ffffff', shorts: '#f59e0b' }
    },
    'vitoria': {
      home: { primary: '#dc2626', secondary: '#111111', pattern: 'stripes_h', shorts: '#111111', socks: '#dc2626', number: '#ffffff' },
      away: { primary: '#ffffff', secondary: '#dc2626', pattern: 'solid', shorts: '#111111', socks: '#ffffff', number: '#dc2626' },
      gk: { primary: '#16a34a', secondary: '#ffffff', shorts: '#16a34a' }
    },
    'atletico goianiense': {
      home: { primary: '#dc2626', secondary: '#111111', pattern: 'stripes_h', shorts: '#111111', socks: '#111111', number: '#ffffff' },
      away: { primary: '#ffffff', secondary: '#dc2626', pattern: 'solid', shorts: '#ffffff', socks: '#ffffff', number: '#dc2626' },
      gk: { primary: '#0284c7', secondary: '#ffffff', shorts: '#0284c7' }
    },
    'vila nova': {
      home: { primary: '#dc2626', secondary: '#ffffff', pattern: 'solid', shorts: '#ffffff', socks: '#dc2626', number: '#ffffff' },
      away: { primary: '#ffffff', secondary: '#dc2626', pattern: 'solid', shorts: '#dc2626', socks: '#ffffff', number: '#dc2626' },
      gk: { primary: '#111111', secondary: '#ffffff', shorts: '#111111' }
    },
    'sport': {
      home: { primary: '#dc2626', secondary: '#111111', pattern: 'stripes_h', shorts: '#111111', socks: '#111111', number: '#ffffff' },
      away: { primary: '#ffffff', secondary: '#dc2626', pattern: 'solid', shorts: '#ffffff', socks: '#ffffff', number: '#dc2626' },
      gk: { primary: '#f59e0b', secondary: '#ffffff', shorts: '#f59e0b' }
    },
    'ceara': {
      home: { primary: '#111111', secondary: '#ffffff', pattern: 'stripes_v', shorts: '#111111', socks: '#111111', number: '#ffffff' },
      away: { primary: '#ffffff', secondary: '#111111', pattern: 'solid', shorts: '#ffffff', socks: '#ffffff', number: '#111111' },
      gk: { primary: '#0284c7', secondary: '#ffffff', shorts: '#0284c7' }
    },
    'coritiba': {
      home: { primary: '#ffffff', secondary: '#006437', pattern: 'chest_band', shorts: '#111111', socks: '#ffffff', number: '#006437' },
      away: { primary: '#006437', secondary: '#ffffff', pattern: 'stripes_v', shorts: '#ffffff', socks: '#006437', number: '#ffffff' },
      gk: { primary: '#f59e0b', secondary: '#ffffff', shorts: '#f59e0b' }
    },
    'goias': {
      home: { primary: '#006437', secondary: '#ffffff', pattern: 'solid', shorts: '#ffffff', socks: '#006437', number: '#ffffff' },
      away: { primary: '#ffffff', secondary: '#006437', pattern: 'solid', shorts: '#006437', socks: '#ffffff', number: '#006437' },
      gk: { primary: '#111111', secondary: '#ffffff', shorts: '#111111' }
    },
    'avai': {
      home: { primary: '#004d98', secondary: '#ffffff', pattern: 'stripes_v', shorts: '#ffffff', socks: '#004d98', number: '#ffffff' },
      away: { primary: '#ffffff', secondary: '#004d98', pattern: 'solid', shorts: '#004d98', socks: '#ffffff', number: '#004d98' },
      gk: { primary: '#eab308', secondary: '#ffffff', shorts: '#eab308' }
    },
    'chapecoense': {
      home: { primary: '#006437', secondary: '#ffffff', pattern: 'solid', shorts: '#ffffff', socks: '#006437', number: '#ffffff' },
      away: { primary: '#ffffff', secondary: '#006437', pattern: 'solid', shorts: '#006437', socks: '#ffffff', number: '#006437' },
      gk: { primary: '#111111', secondary: '#ffffff', shorts: '#111111' }
    },
    'guarani': {
      home: { primary: '#006437', secondary: '#ffffff', pattern: 'solid', shorts: '#ffffff', socks: '#006437', number: '#ffffff' },
      away: { primary: '#ffffff', secondary: '#006437', pattern: 'solid', shorts: '#006437', socks: '#ffffff', number: '#006437' },
      gk: { primary: '#f59e0b', secondary: '#ffffff', shorts: '#f59e0b' }
    },
    'ponte preta': {
      home: { primary: '#ffffff', secondary: '#111111', pattern: 'sash_diagonal', shorts: '#111111', socks: '#ffffff', number: '#111111' },
      away: { primary: '#111111', secondary: '#ffffff', pattern: 'sash_diagonal', shorts: '#ffffff', socks: '#111111', number: '#ffffff' },
      gk: { primary: '#0284c7', secondary: '#ffffff', shorts: '#0284c7' }
    },
    'novorizontino': {
      home: { primary: '#ffdd00', secondary: '#111111', pattern: 'stripes_h', shorts: '#111111', socks: '#ffdd00', number: '#ffffff' },
      away: { primary: '#ffffff', secondary: '#ffdd00', pattern: 'solid', shorts: '#111111', socks: '#ffffff', number: '#111111' },
      gk: { primary: '#16a34a', secondary: '#ffffff', shorts: '#16a34a' }
    },
    'mirassol': {
      home: { primary: '#ffdd00', secondary: '#15803d', pattern: 'solid', shorts: '#ffdd00', socks: '#ffdd00', number: '#15803d' },
      away: { primary: '#ffffff', secondary: '#ffdd00', pattern: 'solid', shorts: '#ffffff', socks: '#ffffff', number: '#15803d' },
      gk: { primary: '#0284c7', secondary: '#ffffff', shorts: '#0284c7' }
    },
    'operario': {
      home: { primary: '#111111', secondary: '#ffffff', pattern: 'stripes_v', shorts: '#111111', socks: '#111111', number: '#ffffff' },
      away: { primary: '#ffffff', secondary: '#111111', pattern: 'solid', shorts: '#ffffff', socks: '#ffffff', number: '#111111' },
      gk: { primary: '#eab308', secondary: '#ffffff', shorts: '#eab308' }
    },
    'paysandu': {
      home: { primary: '#0099ff', secondary: '#ffffff', pattern: 'stripes_v', shorts: '#ffffff', socks: '#0099ff', number: '#ffffff' },
      away: { primary: '#ffffff', secondary: '#0099ff', pattern: 'solid', shorts: '#0099ff', socks: '#ffffff', number: '#0099ff' },
      gk: { primary: '#f59e0b', secondary: '#ffffff', shorts: '#f59e0b' }
    },
    'crb': {
      home: { primary: '#dc2626', secondary: '#ffffff', pattern: 'chest_band', shorts: '#ffffff', socks: '#dc2626', number: '#ffffff' },
      away: { primary: '#ffffff', secondary: '#dc2626', pattern: 'solid', shorts: '#dc2626', socks: '#ffffff', number: '#dc2626' },
      gk: { primary: '#111111', secondary: '#ffffff', shorts: '#111111' }
    },
    'amazonas': {
      home: { primary: '#facc15', secondary: '#111111', pattern: 'solid', shorts: '#111111', socks: '#facc15', number: '#111111' },
      away: { primary: '#ffffff', secondary: '#facc15', pattern: 'solid', shorts: '#ffffff', socks: '#ffffff', number: '#111111' },
      gk: { primary: '#16a34a', secondary: '#ffffff', shorts: '#16a34a' }
    },
    'brusque': {
      home: { primary: '#ffdd00', secondary: '#dc2626', pattern: 'stripes_v', shorts: '#ffffff', socks: '#ffdd00', number: '#dc2626' },
      away: { primary: '#ffffff', secondary: '#ffdd00', pattern: 'solid', shorts: '#ffffff', socks: '#ffffff', number: '#dc2626' },
      gk: { primary: '#0284c7', secondary: '#ffffff', shorts: '#0284c7' }
    },
    'ituano': {
      home: { primary: '#dc2626', secondary: '#111111', pattern: 'stripes_v', shorts: '#111111', socks: '#dc2626', number: '#ffffff' },
      away: { primary: '#ffffff', secondary: '#dc2626', pattern: 'solid', shorts: '#ffffff', socks: '#ffffff', number: '#dc2626' },
      gk: { primary: '#16a34a', secondary: '#ffffff', shorts: '#16a34a' }
    },
    'botafogo-sp': {
      home: { primary: '#dc2626', secondary: '#ffffff', tertiary: '#111111', pattern: 'chest_tricolor', shorts: '#ffffff', socks: '#ffffff', number: '#dc2626' },
      away: { primary: '#111111', secondary: '#dc2626', pattern: 'solid', shorts: '#111111', socks: '#111111', number: '#ffffff' },
      gk: { primary: '#f59e0b', secondary: '#ffffff', shorts: '#f59e0b' }
    },

    // BRASIL - SÉRIE A & PRINCIPAIS
    'corinthians': {
      home: { primary: '#ffffff', secondary: '#111111', pattern: 'solid', shorts: '#111111', socks: '#ffffff', number: '#111111' },
      away: { primary: '#111111', secondary: '#ffffff', pattern: 'stripes_v_fine', shorts: '#ffffff', socks: '#111111', number: '#ffffff' },
      gk: { primary: '#facc15', secondary: '#111111', shorts: '#111111' }
    },
    'palmeiras': {
      home: { primary: '#006437', secondary: '#ffffff', pattern: 'solid', shorts: '#ffffff', socks: '#006437', number: '#ffffff' },
      away: { primary: '#ffffff', secondary: '#006437', pattern: 'solid', shorts: '#006437', socks: '#ffffff', number: '#006437' },
      gk: { primary: '#0284c7', secondary: '#ffffff', shorts: '#0284c7' }
    },
    'flamengo': {
      home: { primary: '#c00000', secondary: '#111111', pattern: 'stripes_h', shorts: '#ffffff', socks: '#c00000', number: '#ffffff' },
      away: { primary: '#ffffff', secondary: '#c00000', pattern: 'chest_band', shorts: '#111111', socks: '#ffffff', number: '#c00000' },
      gk: { primary: '#16a34a', secondary: '#ffffff', shorts: '#16a34a' }
    },
    'sao paulo': {
      home: { primary: '#ffffff', secondary: '#dc2626', tertiary: '#111111', pattern: 'chest_tricolor', shorts: '#ffffff', socks: '#ffffff', number: '#dc2626' },
      away: { primary: '#dc2626', secondary: '#111111', tertiary: '#ffffff', pattern: 'stripes_v_tricolor', shorts: '#111111', socks: '#111111', number: '#ffffff' },
      gk: { primary: '#2563eb', secondary: '#ffffff', shorts: '#2563eb' }
    },
    'santos': {
      home: { primary: '#ffffff', secondary: '#111111', pattern: 'solid', shorts: '#ffffff', socks: '#ffffff', number: '#111111' },
      away: { primary: '#111111', secondary: '#ffffff', pattern: 'stripes_v', shorts: '#111111', socks: '#111111', number: '#ffffff' },
      gk: { primary: '#0284c7', secondary: '#111111', shorts: '#0284c7' }
    },
    'gremio': {
      home: { primary: '#0d80c6', secondary: '#111111', tertiary: '#ffffff', pattern: 'stripes_v_tricolor', shorts: '#111111', socks: '#ffffff', number: '#ffffff' },
      away: { primary: '#ffffff', secondary: '#0d80c6', pattern: 'solid', shorts: '#0d80c6', socks: '#ffffff', number: '#0d80c6' },
      gk: { primary: '#facc15', secondary: '#111111', shorts: '#facc15' }
    },
    'internacional': {
      home: { primary: '#d00000', secondary: '#ffffff', pattern: 'solid', shorts: '#ffffff', socks: '#d00000', number: '#ffffff' },
      away: { primary: '#ffffff', secondary: '#d00000', pattern: 'solid', shorts: '#d00000', socks: '#ffffff', number: '#d00000' },
      gk: { primary: '#1e3a8a', secondary: '#ffffff', shorts: '#1e3a8a' }
    },
    'atletico mineiro': {
      home: { primary: '#111111', secondary: '#ffffff', pattern: 'stripes_v', shorts: '#111111', socks: '#ffffff', number: '#ffffff' },
      away: { primary: '#ffffff', secondary: '#111111', pattern: 'solid', shorts: '#ffffff', socks: '#ffffff', number: '#111111' },
      gk: { primary: '#ea580c', secondary: '#ffffff', shorts: '#ea580c' }
    },
    'cruzeiro': {
      home: { primary: '#003399', secondary: '#ffffff', pattern: 'solid', shorts: '#ffffff', socks: '#003399', number: '#ffffff' },
      away: { primary: '#ffffff', secondary: '#003399', pattern: 'solid', shorts: '#003399', socks: '#ffffff', number: '#003399' },
      gk: { primary: '#f59e0b', secondary: '#ffffff', shorts: '#f59e0b' }
    },
    'botafogo': {
      home: { primary: '#111111', secondary: '#ffffff', pattern: 'stripes_v', shorts: '#111111', socks: '#111111', number: '#ffffff' },
      away: { primary: '#111111', secondary: '#ffffff', pattern: 'solid', shorts: '#111111', socks: '#111111', number: '#ffffff' },
      gk: { primary: '#0284c7', secondary: '#ffffff', shorts: '#0284c7' }
    },
    'fluminense': {
      home: { primary: '#7a0026', secondary: '#006039', tertiary: '#ffffff', pattern: 'stripes_v_tricolor', shorts: '#ffffff', socks: '#ffffff', number: '#ffffff' },
      away: { primary: '#ffffff', secondary: '#7a0026', pattern: 'solid', shorts: '#7a0026', socks: '#ffffff', number: '#7a0026' },
      gk: { primary: '#1e3a8a', secondary: '#ffffff', shorts: '#1e3a8a' }
    },
    'vasco': {
      home: { primary: '#111111', secondary: '#ffffff', pattern: 'sash_diagonal', shorts: '#ffffff', socks: '#111111', number: '#ffffff' },
      away: { primary: '#ffffff', secondary: '#111111', pattern: 'sash_diagonal', shorts: '#111111', socks: '#ffffff', number: '#111111' },
      gk: { primary: '#dc2626', secondary: '#ffffff', shorts: '#dc2626' }
    },
    'bahia': {
      home: { primary: '#ffffff', secondary: '#003399', pattern: 'solid', shorts: '#003399', socks: '#d00000', number: '#003399' },
      away: { primary: '#003399', secondary: '#d00000', tertiary: '#ffffff', pattern: 'stripes_v_tricolor', shorts: '#ffffff', socks: '#003399', number: '#ffffff' },
      gk: { primary: '#16a34a', secondary: '#ffffff', shorts: '#16a34a' }
    },
    'fortaleza': {
      home: { primary: '#003399', secondary: '#d00000', tertiary: '#ffffff', pattern: 'stripes_h_tricolor', shorts: '#003399', socks: '#ffffff', number: '#ffffff' },
      away: { primary: '#ffffff', secondary: '#003399', pattern: 'solid', shorts: '#003399', socks: '#ffffff', number: '#003399' },
      gk: { primary: '#eab308', secondary: '#111111', shorts: '#eab308' }
    },
    'athletico paranaense': {
      home: { primary: '#c00000', secondary: '#111111', pattern: 'stripes_diag', shorts: '#111111', socks: '#111111', number: '#ffffff' },
      away: { primary: '#ffffff', secondary: '#c00000', pattern: 'solid', shorts: '#111111', socks: '#ffffff', number: '#c00000' },
      gk: { primary: '#0284c7', secondary: '#ffffff', shorts: '#0284c7' }
    },
    'bragantino': {
      home: { primary: '#ffffff', secondary: '#dc2626', pattern: 'solid', shorts: '#111111', socks: '#ffffff', number: '#dc2626' },
      away: { primary: '#111111', secondary: '#dc2626', pattern: 'solid', shorts: '#111111', socks: '#111111', number: '#ffffff' },
      gk: { primary: '#16a34a', secondary: '#ffffff', shorts: '#16a34a' }
    },

    // AMÉRICA DO SUL
    'boca juniors': {
      home: { primary: '#001a4e', secondary: '#ffb800', pattern: 'chest_band', shorts: '#001a4e', socks: '#001a4e', number: '#ffb800' },
      away: { primary: '#ffffff', secondary: '#001a4e', pattern: 'chest_band', shorts: '#001a4e', socks: '#ffffff', number: '#001a4e' },
      gk: { primary: '#16a34a', secondary: '#ffffff', shorts: '#16a34a' }
    },
    'river plate': {
      home: { primary: '#ffffff', secondary: '#d30000', pattern: 'sash_diagonal', shorts: '#111111', socks: '#ffffff', number: '#d30000' },
      away: { primary: '#d30000', secondary: '#ffffff', pattern: 'solid', shorts: '#111111', socks: '#d30000', number: '#ffffff' },
      gk: { primary: '#2563eb', secondary: '#ffffff', shorts: '#2563eb' }
    },
    'penarol': {
      home: { primary: '#fed100', secondary: '#111111', pattern: 'stripes_v', shorts: '#111111', socks: '#fed100', number: '#ffffff' },
      away: { primary: '#111111', secondary: '#fed100', pattern: 'solid', shorts: '#111111', socks: '#111111', number: '#fed100' },
      gk: { primary: '#0284c7', secondary: '#ffffff', shorts: '#0284c7' }
    },
    'nacional': {
      home: { primary: '#ffffff', secondary: '#003399', pattern: 'solid', shorts: '#003399', socks: '#003399', number: '#003399' },
      away: { primary: '#d00000', secondary: '#003399', pattern: 'solid', shorts: '#003399', socks: '#d00000', number: '#ffffff' },
      gk: { primary: '#eab308', secondary: '#111111', shorts: '#eab308' }
    },
    'colo-colo': {
      home: { primary: '#ffffff', secondary: '#111111', pattern: 'solid', shorts: '#111111', socks: '#ffffff', number: '#111111' },
      away: { primary: '#111111', secondary: '#ffffff', pattern: 'solid', shorts: '#111111', socks: '#111111', number: '#ffffff' },
      gk: { primary: '#eab308', secondary: '#111111', shorts: '#eab308' }
    },
    'atletico nacional': {
      home: { primary: '#008037', secondary: '#ffffff', pattern: 'stripes_v', shorts: '#ffffff', socks: '#008037', number: '#ffffff' },
      away: { primary: '#ffffff', secondary: '#008037', pattern: 'solid', shorts: '#008037', socks: '#ffffff', number: '#008037' },
      gk: { primary: '#1e3a8a', secondary: '#ffffff', shorts: '#1e3a8a' }
    },
    'platense': {
      home: { primary: '#6e3c15', secondary: '#ffffff', pattern: 'chest_band', shorts: '#ffffff', socks: '#6e3c15', number: '#ffffff' },
      away: { primary: '#ffffff', secondary: '#6e3c15', pattern: 'chest_band', shorts: '#6e3c15', socks: '#ffffff', number: '#6e3c15' },
      gk: { primary: '#16a34a', secondary: '#ffffff', shorts: '#16a34a' }
    },

    // EUROPA
    'real madrid': {
      home: { primary: '#ffffff', secondary: '#eab308', pattern: 'solid', shorts: '#ffffff', socks: '#ffffff', number: '#001a4e' },
      away: { primary: '#0f172a', secondary: '#f97316', pattern: 'solid', shorts: '#0f172a', socks: '#0f172a', number: '#ffffff' },
      gk: { primary: '#22c55e', secondary: '#ffffff', shorts: '#22c55e' }
    },
    'fc barcelona': {
      home: { primary: '#004d98', secondary: '#a50044', pattern: 'stripes_v', shorts: '#004d98', socks: '#a50044', number: '#eab308' },
      away: { primary: '#eab308', secondary: '#a50044', pattern: 'solid', shorts: '#004d98', socks: '#eab308', number: '#004d98' },
      gk: { primary: '#16a34a', secondary: '#ffffff', shorts: '#16a34a' }
    },
    'barcelona': {
      home: { primary: '#004d98', secondary: '#a50044', pattern: 'stripes_v', shorts: '#004d98', socks: '#a50044', number: '#eab308' },
      away: { primary: '#eab308', secondary: '#a50044', pattern: 'solid', shorts: '#004d98', socks: '#eab308', number: '#004d98' },
      gk: { primary: '#16a34a', secondary: '#ffffff', shorts: '#16a34a' }
    },
    'arsenal': {
      home: { primary: '#db0007', secondary: '#ffffff', pattern: 'sleeves_white', shorts: '#ffffff', socks: '#ffffff', number: '#ffffff' },
      away: { primary: '#0f172a', secondary: '#bef264', pattern: 'solid', shorts: '#0f172a', socks: '#0f172a', number: '#bef264' },
      gk: { primary: '#22c55e', secondary: '#ffffff', shorts: '#22c55e' }
    },
    'manchester city': {
      home: { primary: '#6cabdd', secondary: '#ffffff', pattern: 'solid', shorts: '#ffffff', socks: '#6cabdd', number: '#001a4e' },
      away: { primary: '#001a4e', secondary: '#f59e0b', pattern: 'solid', shorts: '#001a4e', socks: '#001a4e', number: '#f59e0b' },
      gk: { primary: '#10b981', secondary: '#ffffff', shorts: '#10b981' }
    },
    'liverpool': {
      home: { primary: '#c8102e', secondary: '#ffffff', pattern: 'solid', shorts: '#c8102e', socks: '#c8102e', number: '#ffffff' },
      away: { primary: '#004638', secondary: '#ffffff', pattern: 'solid', shorts: '#004638', socks: '#004638', number: '#ffffff' },
      gk: { primary: '#111111', secondary: '#ffffff', shorts: '#111111' }
    },
    'bayern munchen': {
      home: { primary: '#dc052d', secondary: '#ffffff', pattern: 'solid', shorts: '#dc052d', socks: '#dc052d', number: '#ffffff' },
      away: { primary: '#111111', secondary: '#a855f7', pattern: 'solid', shorts: '#111111', socks: '#111111', number: '#ffffff' },
      gk: { primary: '#eab308', secondary: '#ffffff', shorts: '#eab308' }
    },
    'inter': {
      home: { primary: '#001ea0', secondary: '#111111', pattern: 'stripes_v', shorts: '#111111', socks: '#001ea0', number: '#eab308' },
      away: { primary: '#ffffff', secondary: '#001ea0', pattern: 'solid', shorts: '#ffffff', socks: '#ffffff', number: '#001ea0' },
      gk: { primary: '#f97316', secondary: '#ffffff', shorts: '#f97316' }
    },
    'milan': {
      home: { primary: '#dc2626', secondary: '#111111', pattern: 'stripes_v', shorts: '#ffffff', socks: '#111111', number: '#ffffff' },
      away: { primary: '#ffffff', secondary: '#dc2626', pattern: 'solid', shorts: '#ffffff', socks: '#ffffff', number: '#dc2626' },
      gk: { primary: '#16a34a', secondary: '#ffffff', shorts: '#16a34a' }
    },
    'juventus': {
      home: { primary: '#ffffff', secondary: '#111111', pattern: 'stripes_v', shorts: '#ffffff', socks: '#ffffff', number: '#eab308' },
      away: { primary: '#fbcfe8', secondary: '#111111', pattern: 'solid', shorts: '#111111', socks: '#111111', number: '#111111' },
      gk: { primary: '#3b82f6', secondary: '#ffffff', shorts: '#3b82f6' }
    },
    'psg': {
      home: { primary: '#001c38', secondary: '#dc2626', pattern: 'chest_band_v', shorts: '#001c38', socks: '#001c38', number: '#ffffff' },
      away: { primary: '#ffffff', secondary: '#001c38', pattern: 'solid', shorts: '#ffffff', socks: '#ffffff', number: '#001c38' },
      gk: { primary: '#eab308', secondary: '#ffffff', shorts: '#eab308' }
    },

    // ÁSIA
    'al-hilal': {
      home: { primary: '#003399', secondary: '#ffffff', pattern: 'solid', shorts: '#003399', socks: '#003399', number: '#ffffff' },
      away: { primary: '#ffffff', secondary: '#003399', pattern: 'solid', shorts: '#ffffff', socks: '#ffffff', number: '#003399' },
      gk: { primary: '#eab308', secondary: '#111111', shorts: '#eab308' }
    },
    'al-nassr': {
      home: { primary: '#ffdd00', secondary: '#003399', pattern: 'solid', shorts: '#003399', socks: '#ffdd00', number: '#003399' },
      away: { primary: '#001a4e', secondary: '#ffdd00', pattern: 'solid', shorts: '#001a4e', socks: '#001a4e', number: '#ffdd00' },
      gk: { primary: '#10b981', secondary: '#ffffff', shorts: '#10b981' }
    },
    'vissel kobe': {
      home: { primary: '#8a1538', secondary: '#ffffff', pattern: 'solid', shorts: '#111111', socks: '#8a1538', number: '#ffffff' },
      away: { primary: '#ffffff', secondary: '#8a1538', pattern: 'solid', shorts: '#ffffff', socks: '#ffffff', number: '#8a1538' },
      gk: { primary: '#22c55e', secondary: '#ffffff', shorts: '#22c55e' }
    },
    'ulsan hd': {
      home: { primary: '#002b66', secondary: '#0284c7', pattern: 'stripes_v', shorts: '#002b66', socks: '#002b66', number: '#ffffff' },
      away: { primary: '#ffffff', secondary: '#002b66', pattern: 'solid', shorts: '#ffffff', socks: '#ffffff', number: '#002b66' },
      gk: { primary: '#eab308', secondary: '#111111', shorts: '#eab308' }
    }
  };

  function normalizeClubKey(name){
    return String(name || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
  }

  function getClubKit(clubName, isAway = false){
    const key = normalizeClubKey(clubName);

    // SUPORTE AO MODO CRIAR SEU TIME (CUSTOM KITS)
    if(typeof window !== 'undefined' && window.CUSTOM_CLUB_KITS && window.CUSTOM_CLUB_KITS[key]){
      const customK = window.CUSTOM_CLUB_KITS[key];
      const kit = isAway ? (customK.away || customK.home) : customK.home;
      return {
        primary: kit.shirtColor || '#1e3a8a',
        secondary: kit.secondaryColor || '#ffffff',
        pattern: kit.style || 'solid',
        shorts: kit.shortsColor || '#1e3a8a',
        socks: kit.socksColor || '#ffffff',
        number: kit.secondaryColor || '#ffffff',
        gk: { primary: '#16a34a', secondary: '#ffffff', shorts: '#16a34a' }
      };
    }
    if(typeof state !== 'undefined' && state && state.customClub && normalizeClubKey(state.club) === key){
      const kit = isAway ? (state.customClub.awayKit || state.customClub.homeKit) : state.customClub.homeKit;
      return {
        primary: kit.shirtColor || '#1e3a8a',
        secondary: kit.secondaryColor || '#ffffff',
        pattern: kit.style || 'solid',
        shorts: kit.shortsColor || '#1e3a8a',
        socks: kit.socksColor || '#ffffff',
        number: kit.secondaryColor || '#ffffff',
        gk: { primary: '#16a34a', secondary: '#ffffff', shorts: '#16a34a' }
      };
    }
    let kitData = CLUB_KITS[key];
    if(!kitData){
      // Tenta correspondência parcial (ex: 'Flamengo RJ' -> 'flamengo')
      for(const k of Object.keys(CLUB_KITS)){
        if(key.includes(k) || k.includes(key)){
          kitData = CLUB_KITS[k];
          break;
        }
      }
    }

    if(kitData){
      const kit = isAway ? (kitData.away || kitData.home) : kitData.home;
      return {
        ...kit,
        gk: kitData.gk || { primary: '#16a34a', secondary: '#ffffff', shorts: '#16a34a' }
      };
    }

    // Gerador determinístico de cores baseado no nome do clube
    let hash = 0;
    for(let i = 0; i < key.length; i++) hash = (hash << 5) - hash + key.charCodeAt(i);
    const hues = [210, 0, 140, 45, 270, 180, 25, 340];
    const baseHue = hues[Math.abs(hash) % hues.length];
    const isLight = (Math.abs(hash) % 2 === 0);

    return {
      primary: isAway ? (isLight ? '#111111' : '#ffffff') : `hsl(${baseHue}, 80%, 42%)`,
      secondary: isAway ? `hsl(${baseHue}, 80%, 55%)` : '#ffffff',
      pattern: 'solid',
      shorts: isAway ? '#ffffff' : (baseHue === 0 || baseHue === 210 ? '#ffffff' : '#111111'),
      socks: `hsl(${baseHue}, 75%, 45%)`,
      number: isAway ? (isLight ? '#ffffff' : '#111111') : '#ffffff',
      gk: { primary: '#22c55e', secondary: '#ffffff', shorts: '#22c55e' }
    };
  }

  // =========================================================================
  // 2. REGRAS DO FUTEBOL DE VERDADE (IFAB / FIFA)
  // =========================================================================
  const RealFootballRules = {
    // Regra das 5 substituições em até 3 paradas durante o tempo regulamentar
    // Substituições no intervalo não gastam parada de jogo
    MAX_SUBS_REGULAR: 5,
    MAX_WINDOWS_REGULAR: 3,
    EXTRA_SUB_EXTRA_TIME: 1, // +1 substituição na prorrogação
    EXTRA_WINDOW_EXTRA_TIME: 1, // +1 parada na prorrogação

    // Calcula tempo de acréscimo realista baseado nos eventos do tempo
    calculateStoppageTime(arg1 = [], arg2 = 1) {
      const events = Array.isArray(arg1) ? arg1 : (Array.isArray(arg2) ? arg2 : []);
      const half = typeof arg1 === 'number' ? arg1 : (typeof arg2 === 'number' ? arg2 : 1);
      let stoppageSec = 0;
      const filtered = events.filter(e => {
        const min = Number(e.min) || 0;
        return half === 1 ? (min <= 45) : (min > 45 && min <= 90);
      });

      // Cada gol adiciona ~45s
      const goals = filtered.filter(e => e.type === 'gol').length;
      stoppageSec += goals * 45;

      // Cada cartão amarelo/vermelho adiciona ~30s
      const cards = filtered.filter(e => e.type === 'cartao_amarelo' || e.type === 'cartao_vermelho').length;
      stoppageSec += cards * 30;

      // Cada substituição adiciona ~25s
      const subs = filtered.filter(e => e.type === 'substituicao').length;
      stoppageSec += subs * 25;

      // Atendimento médico / VAR
      const varReviews = filtered.filter(e => e.type === 'var' || (e.text && e.text.includes('VAR'))).length;
      stoppageSec += varReviews * 75;

      // Base mínima: 1º tempo = 1 a 3 min; 2º tempo = 3 a 6 min
      const baseMin = half === 1 ? 1 : 3;
      const calculatedMin = Math.round(stoppageSec / 60);
      const totalMin = Math.max(baseMin, Math.min(half === 1 ? 4 : 8, baseMin + calculatedMin));
      return totalMin;
    },

    // Verifica se o clube do usuário pode fazer substituição de acordo com as regras
    canSubstitute(matchStateOrTracker, isHalfTime = false, isExtraTime = false) {
      if(!matchStateOrTracker) return { allowed: false, reason: 'Sem partida em andamento.' };
      const isET = isExtraTime || matchStateOrTracker.isExtraTime || (matchStateOrTracker.phase && String(matchStateOrTracker.phase).startsWith('EXTRA'));
      const usedSubs = matchStateOrTracker.substitutionsCount ?? matchStateOrTracker.count ?? (5 - (matchStateOrTracker.subsLeft ?? 5));
      const maxSubs = isET ? (this.MAX_SUBS_REGULAR + this.EXTRA_SUB_EXTRA_TIME) : this.MAX_SUBS_REGULAR;
      if(usedSubs >= maxSubs){
        return { allowed: false, reason: `Limite de ${maxSubs} substituições atingido.` };
      }

      const isHT = isHalfTime || matchStateOrTracker.phase === 'HALF_TIME';
      if(!isHT){
        const usedWindows = matchStateOrTracker.subsWindowsUsed ?? matchStateOrTracker.windowsUsed ?? 0;
        const maxWindows = isET ? (this.MAX_WINDOWS_REGULAR + this.EXTRA_WINDOW_EXTRA_TIME) : this.MAX_WINDOWS_REGULAR;
        if(usedWindows >= maxWindows){
          return { allowed: false, reason: `Limite de ${maxWindows} paradas técnicas durante o jogo atingido. No intervalo as trocas são livres.` };
        }
      }

      return { allowed: true, remainingSubs: maxSubs - usedSubs };
    },

    // Registra uma substituição consumindo janela de parada caso não seja intervalo
    recordSubstitution(matchStateOrTracker, minute = 0, isHalfTime = false) {
      if(!matchStateOrTracker) return;
      const curCount = matchStateOrTracker.substitutionsCount ?? matchStateOrTracker.count ?? 0;
      matchStateOrTracker.substitutionsCount = curCount + 1;
      matchStateOrTracker.count = curCount + 1;

      if(matchStateOrTracker.subsLeft !== undefined){
        matchStateOrTracker.subsLeft = Math.max(0, matchStateOrTracker.subsLeft - 1);
      }

      const isHT = isHalfTime || matchStateOrTracker.phase === 'HALF_TIME';
      if(!isHT){
        const curMin = (typeof minute === 'number' && minute > 0) ? minute : (matchStateOrTracker.minute ?? 0);
        if(matchStateOrTracker.lastSubMinute !== curMin){
          const curWins = matchStateOrTracker.subsWindowsUsed ?? matchStateOrTracker.windowsUsed ?? 0;
          matchStateOrTracker.subsWindowsUsed = curWins + 1;
          matchStateOrTracker.windowsUsed = curWins + 1;
          matchStateOrTracker.lastSubMinute = curMin;
        }
      }
    },

    // Gestão de Suspensões por Cartões na Competição
    checkSuspension(player, competitionId, gameState) {
      if(!player || !gameState) return { suspended: false };
      // 1. Suspensão por Cartão Vermelho direto
      if(player.redCardSuspensionRounds && player.redCardSuspensionRounds > 0){
        return { suspended: true, reason: `Suspenso por expulsão (${player.redCardSuspensionRounds} rodada(s) restante(s))` };
      }

      // 2. Acúmulo de 3 cartões amarelos no mesmo campeonato
      const compStats = gameState.competitionStats?.[competitionId] || {};
      const playerYellows = compStats.yellowCards?.[player.name] || player.seasonYellows || 0;
      if(playerYellows > 0 && playerYellows % 3 === 0 && !player.yellowSuspensionServed){
        return { suspended: true, reason: 'Suspenso pelo acúmulo de 3 cartões amarelos' };
      }

      return { suspended: false };
    },

    // Controle em Tempo Real: Carrinhos, Dribles 1v1, Troca de Passes até o Gol, Impedimento e VAR
    handleLiveMatchAction(s, isPlaying, notifyFn, passFn, shotFn) {
      if(!s || !isPlaying || s.phase === 'HALF_TIME' || s.done) return;
      const ball = s.ball;
      if(!ball) return;
      const carrier = ball.carrier;
      const allPlayers = [...(s.homePlayers || []), ...(s.awayPlayers || [])];

      // 1. Atualização e Redução de Timers (Carrinho, Falta, Drible, etc.)
      allPlayers.forEach(p => {
        if(p.slideTimer > 0){
          p.slideTimer -= 0.04;
          if(p.slideTimer <= 0) p.sliding = false;
        }
        if(p.dribbleTimer > 0){
          p.dribbleTimer -= 0.04;
          if(p.dribbleTimer <= 0) p.dribbling = false;
        }
        if(p.fouledTimer > 0) p.fouledTimer -= 0.035;
        if(p.stunTimer > 0) p.stunTimer -= 0.035;
        if(p.dribbleCooldown > 0) p.dribbleCooldown--;
        if(p.tackleCooldown > 0) p.tackleCooldown--;
      });

      // 2. Posicionamento e Corrida dos Bandeirinhas (Linesmen) nas Linhas Laterais
      s.linesmen = s.linesmen || [
        { id: 'top', side: 'top', x: 50, y: 1.2, flagRaised: false, animFrame: 0, flagRaisedTimer: 0 },
        { id: 'bottom', side: 'bottom', x: 50, y: 98.8, flagRaised: false, animFrame: 0, flagRaisedTimer: 0 }
      ];
      const lmTop = s.linesmen[0];
      const lmBottom = s.linesmen[1];

      // Acompanha linha do penúltimo defensor (linha de impedimento)
      const awayDefs = (s.awayPlayers || []).filter(p => !p.isGK && !p.redCard).sort((a,b) => b.x - a.x);
      const homeDefs = (s.homePlayers || []).filter(p => !p.isGK && !p.redCard).sort((a,b) => a.x - b.x);
      const offsideX_top = awayDefs[1] ? awayDefs[1].x : (awayDefs[0] ? awayDefs[0].x : 70);
      const offsideX_bottom = homeDefs[1] ? homeDefs[1].x : (homeDefs[0] ? homeDefs[0].x : 30);

      lmTop.animFrame = (lmTop.animFrame || 0) + 0.2;
      lmBottom.animFrame = (lmBottom.animFrame || 0) + 0.2;
      lmTop.x += (offsideX_top - lmTop.x) * 0.08;
      lmBottom.x += (offsideX_bottom - lmBottom.x) * 0.08;

      if(lmTop.flagRaisedTimer > 0){
        lmTop.flagRaisedTimer -= 0.03;
        lmTop.flagRaised = lmTop.flagRaisedTimer > 0;
      }
      if(lmBottom.flagRaisedTimer > 0){
        lmBottom.flagRaisedTimer -= 0.03;
        lmBottom.flagRaised = lmBottom.flagRaisedTimer > 0;
      }

      // 3. Atualização da Checagem de VAR
      if(s.varCheck){
        s.varCheck.timer = (s.varCheck.timer || 2.5) - 0.03;
        if(s.varCheck.timer <= 0){
          const v = s.varCheck;
          s.varCheck = null;
          if(typeof v.callback === 'function') v.callback();
        }
        return; // Jogo em pausa enquanto o VAR analisa no monitor
      }

      // Se a bola estiver em modo de chute ou passe, a física da bola comanda
      if(ball.mode === 'shot' || ball.mode === 'pass') return;

      // 4. Interação 1v1: Carrinhos / Desarmes vs Dribles de Habilidade
      if(carrier && !carrier.isGK && !carrier.redCard && ball.mode === 'play'){
        const oppTeam = (carrier.team === 'home') ? s.awayPlayers : s.homePlayers;
        const oppDefenders = (oppTeam || []).filter(d => !d.isGK && !d.redCard && (d.stunTimer || 0) <= 0);

        // Encontra o zagueiro/marcador mais próximo
        let nearestDef = null;
        let minDist = 999;
        oppDefenders.forEach(d => {
          const dist = Math.hypot(d.x - carrier.x, d.y - carrier.y);
          if(dist < minDist){ minDist = dist; nearestDef = d; }
        });

        // Quando o marcador se aproxima (distância de combate <= 4.2%)
        if(nearestDef && minDist <= 4.2){
          const carrierDribble = carrier.attrs?.dribbling || carrier.overall || 70;
          const defTackle = nearestDef.attrs?.tackling || nearestDef.overall || 70;
          const isStarDribbler = carrierDribble >= 74 || ['ST','CF','LW','RW','AM'].includes(carrier.pos);

          // CENÁRIO A: ATACANTE DRIBLA O ADVERSÁRIO E PARTE SOZINHO PRO GOL!
          if(isStarDribbler && (carrier.dribbleCooldown || 0) <= 0 && Math.random() < 0.58){
            carrier.dribbling = true;
            carrier.dribbleTimer = 0.95;
            carrier.dribbleCooldown = 55;
            const dribbleAdv = (carrier.team === 'home') ? 4.5 : -4.5;
            carrier.x = Math.max(5, Math.min(95, carrier.x + dribbleAdv));
            carrier.y = Math.max(15, Math.min(85, carrier.y + (carrier.y < 50 ? 3.5 : -3.5)));
            nearestDef.stunTimer = 1.3;
            nearestDef.unbalanced = true;

            const dribbleNames = ['Ginga e Cortada Seca', 'Pedalada Desconcertante', 'Drible da Vaca', 'Elástico Invertido', 'Finta de Corpo'];
            const chosenMove = dribbleNames[Math.floor(Math.random() * dribbleNames.length)];
            if(notifyFn) notifyFn(carrier.x, carrier.y, `🪄 ${carrier.name.toUpperCase()}: ${chosenMove}!`, '#facc15');

            // Se após o drible ele entrou na área sozinho, ganha vantagem de espaço
            const inBox = (carrier.team === 'home' && carrier.x >= 78) || (carrier.team === 'away' && carrier.x <= 22);
            if(inBox && notifyFn){
              notifyFn(carrier.x, carrier.y, `🔥 INVASÃO PERIGOSA NA ÁREA!`, '#ef4444');
            }
            carrier.dribbleCooldown = 75;
            return;
          }

          // CENÁRIO B: ZAGUEIRO DÁ UM CARRINHO NO BOTE!
          if((nearestDef.tackleCooldown || 0) <= 0 && Math.random() < 0.65){
            nearestDef.sliding = true;
            nearestDef.slideTimer = 1.1;
            nearestDef.tackleCooldown = 60;
            nearestDef.slideDir = (carrier.x > nearestDef.x) ? 1 : -1;
            nearestDef.x += nearestDef.slideDir * 1.8;

            const tackleSuccessChance = 0.52 + (defTackle - carrierDribble) * 0.007;
            if(Math.random() < tackleSuccessChance){
              // CARRINHO LIMPO NA BOLA!
              carrier.hasBall = false;
              ball.mode = 'loose';
              ball.carrier = null;
              ball.vx = nearestDef.slideDir * 1.1;
              ball.vy = (Math.random() - 0.5) * 0.6;
              nearestDef.tackleCooldown = 40;
              if(notifyFn) notifyFn(nearestDef.x, nearestDef.y, `👟 CARRINHO CERTEIRO NO BOTE!`, '#38bdf8');
            } else {
              // CARRINHO DURO / FALTA!
              carrier.fouledTimer = 1.8;
              carrier.hasBall = false;
              ball.mode = 'loose';
              ball.carrier = null;
              ball.vx = 0; ball.vy = 0;

              const inPenaltyBox = (carrier.team === 'home' && carrier.x >= 83.5 && carrier.y >= 22 && carrier.y <= 78) ||
                                   (carrier.team === 'away' && carrier.x <= 16.5 && carrier.y >= 22 && carrier.y <= 78);

              if(inPenaltyBox){
                // PÊNALTI COM CHECAGEM DE VAR!
                if(notifyFn) notifyFn(carrier.x, carrier.y, `🚨 PÊNALTI! DERRUBADO NA ÁREA!`, '#ef4444');
                s.varCheck = {
                  type: 'penalty',
                  text: '🖥️ VAR: CHECANDO POSSÍVEL PÊNALTI...',
                  timer: 2.8,
                  callback: () => {
                    if(notifyFn) notifyFn(carrier.x, carrier.y, `✅ PÊNALTI CONFIRMADO PELO VAR!`, '#10b981');
                    if(Array.isArray(s.events)){
                      s.events.unshift({ min: Number(s.minute) || 0, type: 'penalti', text: `🖥️ VAR confirma pênalti após carrinho imprudente na área!` });
                    }
                  }
                };
              } else {
                if(notifyFn) notifyFn(carrier.x, carrier.y, `💥 FALTA! CARRINHO DURO!`, '#f97316');
              }
            }
            return;
          }
        }

        // 5. Troca de Passes Fluida e Triangulações
        // Se o portador avançou e tem companheiro melhor posicionado, toca a bola!
        if((ball.liveDecisionCooldown || 0) <= 0 && passFn){
          const isHome = carrier.team === 'home';
          const distToGoal = isHome ? (100 - carrier.x) : carrier.x;
          const shotTendency = Number(carrier.shotTendency) || 0;
          const shootingRangeChance = distToGoal <= 13 ? 0.30 : distToGoal <= 22 ? 0.15 : distToGoal <= 30 ? 0.04 : 0;
          const anglePenalty = Math.max(0, Math.abs((Number(carrier.y) || 50) - 50) - 22) * 0.006;
          const shotChance = Math.max(0, shootingRangeChance + shotTendency * 0.001 - anglePenalty);

          // O ciclo de animação precisa finalizar ataques por conta própria:
          // antes, o callback de chute nunca era chamado e a jogada só circulava.
          if(shotFn && carrier.canShoot !== false && Math.random() < shotChance){
            shotFn(s, carrier);
            return;
          }

          // Busca passe progressivo (triangulação / infiltração)
          const teammates = (isHome ? s.homePlayers : s.awayPlayers);
          const receiver = teammates.find(tm => {
            if(!tm || tm === carrier || tm.isGK || tm.redCard) return false;
            const forward = isHome ? (tm.x - carrier.x) : (carrier.x - tm.x);
            const dist = Math.hypot(tm.x - carrier.x, tm.y - carrier.y);
            return forward > 3 && forward < 26 && dist < 32;
          });

          if(receiver && Math.random() < 0.68){
            // VERIFICA SE RECEBEDOR ESTÁ EM IMPEDIMENTO!
            const offsideLine = isHome ? offsideX_top : offsideX_bottom;
            const isOffside = isHome ? (receiver.x > offsideLine && receiver.x > 50) : (receiver.x < offsideLine && receiver.x < 50);

            if(isOffside){
              // BANDEIRINHA ERGUE A BANDEIRA DE IMPEDIMENTO!
              const lm = isHome ? lmTop : lmBottom;
              lm.flagRaised = true;
              lm.flagRaisedTimer = 2.4;
              s.offsideLine = { x: offsideLine, timer: 2.2 };
              if(notifyFn) notifyFn(receiver.x, receiver.y, `🚩 IMPEDIMENTO MARCADO PELO BANDEIRINHA!`, '#facc15');
              ball.mode = 'loose';
              ball.carrier = null;
              ball.vx = 0; ball.vy = 0;
              ball.liveDecisionCooldown = 50;
              return;
            }

            passFn(s, carrier, receiver, { cooldownFrames: 24 });
            ball.liveDecisionCooldown = 24;
            return;
          }
        }
      }
    }
  };

  // =========================================================================
  // 3. RENDERIZAÇÃO 3D / 2.5D COM TEXTURAS E UNIFORMES REAIS
  // =========================================================================
  const RealPitchRenderer3D = {
    // Desenha jogador com camisa do clube real (listras, faixa, shorts e número)
    drawRealistic3DPlayer(ctx, p, hasBall, projFn, scale) {
      if(p.redCard) return;
      const pt = projFn(p.x, p.y);
      const isGK = Boolean(p.isGK);
      const isHome = p.team === 'home';
      const kit = p.kitColors || p.kit || (isHome ? p.homeKit : p.awayKit) || getClubKit(p.clubName || (typeof liveMatchState !== 'undefined' && liveMatchState ? (isHome ? liveMatchState.home : liveMatchState.away) : (isHome ? 'criciuma' : 'cuiaba')), !isHome);

      ctx.save();
      ctx.translate(pt.x, pt.y);

      // Animações Físicas Avançadas: Carrinho (Slide tackle), Falta, Drible e Goleiro
      const isSliding = Boolean(p.sliding || (p.slideTimer || 0) > 0);
      if(isSliding){
        const slideAngle = (isHome ? 1 : -1) * 0.92;
        ctx.rotate(slideAngle);
        // Rastro de grama arrancada pelo carrinho
        ctx.strokeStyle = 'rgba(21, 128, 61, 0.75)';
        ctx.lineWidth = 4.2 * scale;
        ctx.beginPath();
        ctx.moveTo(isHome ? -18 * scale : 18 * scale, 3.5 * scale);
        ctx.lineTo(0, 3.5 * scale);
        ctx.stroke();
      } else if((p.fouledTimer || 0) > 0){
        // Sofreu falta dura e está caindo/rolando no gramado
        ctx.rotate(1.15);
      } else if((p.stunTimer || 0) > 0){
        // Zagueiro desconcertado pelo drible (desequilibrado)
        ctx.rotate(-0.35);
      } else if(p.diving){
        // Goleiro mergulhando para defesa
        const angle = (p.diveDir || 1) * Math.PI * 0.28;
        ctx.rotate(angle);
      }

      // Efeito e Aura Visual de Drible Habilidoso (Ginga / Finta)
      if(p.dribbling || (p.dribbleTimer || 0) > 0){
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 14;
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2.2 * scale;
        ctx.beginPath();
        ctx.arc(0, -12 * scale, 15 * scale, 0, Math.PI * 2);
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      // 1. Sombra 3D suave com oclusão de contato
      const shadowLength = isSliding ? (14 * scale) : (8 * scale);
      const shadowGrad = ctx.createRadialGradient(0, 0, 1, 0, 0, shadowLength);
      shadowGrad.addColorStop(0, 'rgba(0, 0, 0, 0.45)');
      shadowGrad.addColorStop(0.7, 'rgba(0, 0, 0, 0.2)');
      shadowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = shadowGrad;
      ctx.beginPath();
      ctx.ellipse(0, 0, shadowLength, 3.8 * scale, 0, 0, Math.PI * 2);
      ctx.fill();

      // 2. Halo de Posse de Bola com Efeito Ouro 3D
      if(hasBall){
        ctx.strokeStyle = '#facc15';
        ctx.lineWidth = 2.8;
        ctx.shadowColor = '#eab308';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.ellipse(0, 0, 15 * scale, 6.5 * scale, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      // 3. Pés e Chuteiras com Animação de Passada / Carrinho
      const isKicking = (p.kickTimer || 0) > 0;
      const legOffset = isSliding ? (14 * scale) : (isKicking ? (9 * scale) : Math.sin(p.animFrame || 0) * (4.5 * scale));

      // Meião com a cor do clube
      ctx.fillStyle = isGK ? '#111111' : (kit.socks || kit.primary);
      ctx.fillRect(-4.5 * scale, -5 * scale + legOffset, 3.2 * scale, 5 * scale);
      ctx.fillRect(1.3 * scale, -5 * scale - legOffset, 3.2 * scale, 5 * scale);

      // Chuteira preta/neon
      ctx.fillStyle = '#111111';
      ctx.fillRect(-5 * scale, 0 + legOffset, 4 * scale, 2.5 * scale);
      ctx.fillRect(1 * scale, 0 - legOffset, 4 * scale, 2.5 * scale);

      // 4. Shorts do Clube
      const shortsColor = isGK ? (kit.gk?.shorts || '#111111') : (kit.shorts || '#ffffff');
      ctx.fillStyle = shortsColor;
      ctx.fillRect(-5.5 * scale, -12 * scale, 11 * scale, 7.5 * scale);

      // Linha de costura/sombra do calção
      ctx.fillStyle = 'rgba(0,0,0,0.18)';
      ctx.fillRect(-0.5 * scale, -12 * scale, 1 * scale, 7.5 * scale);

      // 5. Camisa do Clube com Padrão Autêntico
      const shirtW = 13 * scale;
      const shirtH = 11.5 * scale;
      const shirtX = -6.5 * scale;
      const shirtY = -23.5 * scale;

      const primaryColor = isGK ? (kit.gk?.primary || '#22c55e') : kit.primary;
      const secondaryColor = isGK ? (kit.gk?.secondary || '#ffffff') : kit.secondary;

      // Base da camisa com gradiente 3D
      const shirtGrad = ctx.createLinearGradient(shirtX, shirtY, shirtX + shirtW, shirtY + shirtH);
      shirtGrad.addColorStop(0, primaryColor);
      shirtGrad.addColorStop(0.5, primaryColor);
      shirtGrad.addColorStop(1, 'rgba(0,0,0,0.15)'); // Sombra na lateral do torso
      ctx.fillStyle = shirtGrad;
      ctx.fillRect(shirtX, shirtY, shirtW, shirtH);

      // Padrões do uniforme: Listras, Faixa Diagonal ou Faixa no Peito
      if(!isGK && kit.pattern === 'stripes_v'){
        ctx.fillStyle = secondaryColor;
        ctx.fillRect(shirtX + shirtW * 0.25, shirtY, shirtW * 0.2, shirtH);
        ctx.fillRect(shirtX + shirtW * 0.65, shirtY, shirtW * 0.2, shirtH);
      } else if(!isGK && kit.pattern === 'stripes_h'){
        ctx.fillStyle = secondaryColor;
        ctx.fillRect(shirtX, shirtY + shirtH * 0.25, shirtW, shirtH * 0.22);
        ctx.fillRect(shirtX, shirtY + shirtH * 0.65, shirtW, shirtH * 0.22);
      } else if(!isGK && kit.pattern === 'stripes_h_tricolor'){
        // Padrão Tricolor Horizontal (ex: Criciúma: amarelo, faixa branca fina, preto embaixo)
        ctx.fillStyle = kit.tertiary || '#ffffff';
        ctx.fillRect(shirtX, shirtY + shirtH * 0.44, shirtW, shirtH * 0.12);
        ctx.fillStyle = secondaryColor;
        ctx.fillRect(shirtX, shirtY + shirtH * 0.56, shirtW, shirtH * 0.44);
      } else if(!isGK && kit.pattern === 'chest_tricolor'){
        // Faixa no Peito Tricolor (ex: São Paulo, Botafogo-SP)
        ctx.fillStyle = secondaryColor;
        ctx.fillRect(shirtX, shirtY + shirtH * 0.32, shirtW, shirtH * 0.16);
        ctx.fillStyle = kit.tertiary || '#111111';
        ctx.fillRect(shirtX, shirtY + shirtH * 0.48, shirtW, shirtH * 0.16);
      } else if(!isGK && kit.pattern === 'sash_diagonal'){
        ctx.strokeStyle = secondaryColor;
        ctx.lineWidth = 2.8 * scale;
        ctx.beginPath();
        ctx.moveTo(shirtX + shirtW, shirtY);
        ctx.lineTo(shirtX, shirtY + shirtH);
        ctx.stroke();
      } else if(!isGK && kit.pattern === 'chest_band'){
        ctx.fillStyle = secondaryColor;
        ctx.fillRect(shirtX, shirtY + shirtH * 0.35, shirtW, shirtH * 0.3);
      } else if(!isGK && kit.pattern === 'sleeves_white'){
        // Estilo Arsenal (mangas brancas)
        ctx.fillStyle = secondaryColor;
        ctx.fillRect(shirtX - 2.5 * scale, shirtY, 2.5 * scale, 6 * scale);
        ctx.fillRect(shirtX + shirtW, shirtY, 2.5 * scale, 6 * scale);
      }

      // Gola da camisa
      ctx.fillStyle = secondaryColor;
      ctx.beginPath();
      ctx.moveTo(-2 * scale, shirtY);
      ctx.lineTo(0, shirtY + 2.5 * scale);
      ctx.lineTo(2 * scale, shirtY);
      ctx.closePath();
      ctx.fill();

      // Número nas costas do jogador
      const jerseyNumber = p.jerseyNumber || (p.index ? p.index + 1 : (isGK ? 1 : Math.floor(Math.abs(hashStr(p.name)) % 30 + 2)));
      ctx.fillStyle = isGK ? '#111111' : (kit.number || '#ffffff');
      ctx.font = `900 ${Math.round(6.5 * scale)}px Inter, sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText(String(jerseyNumber), 0, shirtY + 8 * scale);

      // Braçadeira de Capitão Dourada
      if(p.isCaptain){
        ctx.fillStyle = '#facc15';
        ctx.fillRect(shirtX - 1.5 * scale, shirtY + 3 * scale, 3 * scale, 4.5 * scale);
        ctx.fillStyle = '#000000';
        ctx.font = `bold ${Math.round(3.5 * scale)}px sans-serif`;
        ctx.fillText('C', shirtX, shirtY + 6.5 * scale);
      }

      // 6. Braços e Mãos / Luvas
      ctx.fillStyle = isGK ? '#facc15' : '#fed7aa';
      if(p.celebrating){
        // Comemoração \o/
        ctx.fillRect(shirtX - 2 * scale, shirtY - 9 * scale, 3 * scale, 12 * scale);
        ctx.fillRect(shirtX + shirtW - 1 * scale, shirtY - 9 * scale, 3 * scale, 12 * scale);
      } else if(p.diving){
        ctx.fillRect(shirtX - 5 * scale, shirtY + 2 * scale, 5 * scale, 3.5 * scale);
        ctx.fillRect(shirtX + shirtW, shirtY + 2 * scale, 5 * scale, 3.5 * scale);
      } else {
        ctx.fillRect(shirtX - 2 * scale, shirtY + 2 * scale - legOffset * 0.4, 2.8 * scale, 7.5 * scale);
        ctx.fillRect(shirtX + shirtW - 0.8 * scale, shirtY + 2 * scale + legOffset * 0.4, 2.8 * scale, 7.5 * scale);
      }

      // 7. Cabeça, Rosto e Cabelo 3D
      ctx.fillStyle = '#fed7aa'; // Tom de pele
      ctx.beginPath();
      ctx.arc(0, -28 * scale, 5.5 * scale, 0, Math.PI * 2);
      ctx.fill();

      // Cabelo variado
      const hairSeed = Math.abs(hashStr(p.name));
      const hairColor = (hairSeed % 3 === 0) ? '#172554' : (hairSeed % 2 === 0 ? '#451a03' : '#713f12');
      ctx.fillStyle = hairColor;
      ctx.beginPath();
      ctx.arc(0, -29.8 * scale, 5.5 * scale, Math.PI * 0.9, Math.PI * 2.1);
      ctx.fill();

      // 8. Nome do Jogador Legível com Sombra
      ctx.fillStyle = '#ffffff';
      ctx.font = `bold ${Math.round(8.5 * scale)}px Inter, sans-serif`;
      ctx.textAlign = 'center';
      ctx.shadowColor = '#000000';
      ctx.shadowBlur = 5;
      ctx.fillText(p.name, 0, 13 * scale);
      ctx.shadowBlur = 0;

      ctx.restore();
    },

    // Traves e Redes em 3D Realistas com profundidade e malha hexagonal
    drawRealistic3DGoals(ctx, projFn) {
      // Gol Esquerdo (Home)
      const gL_top = projFn(0, 42), gL_bot = projFn(0, 58);
      const netDepth = 26;

      ctx.save();
      // 1. Malha da Rede Esquerda (Fundo e Laterais com transparência)
      ctx.fillStyle = 'rgba(255, 255, 255, 0.16)';
      ctx.beginPath();
      ctx.moveTo(gL_top.x, gL_top.y);
      ctx.lineTo(gL_top.x - netDepth, gL_top.y - 14);
      ctx.lineTo(gL_bot.x - netDepth, gL_bot.y - 14);
      ctx.lineTo(gL_bot.x, gL_bot.y);
      ctx.closePath();
      ctx.fill();

      // Padrão de malha de rede trançada (horizontal e vertical)
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.32)';
      ctx.lineWidth = 1;
      for(let y = gL_top.y - 14; y <= gL_bot.y; y += 5){
        ctx.beginPath();
        ctx.moveTo(gL_top.x, y);
        ctx.lineTo(gL_top.x - netDepth, y);
        ctx.stroke();
      }
      for(let dx = 0; dx <= netDepth; dx += 6){
        ctx.beginPath();
        ctx.moveTo(gL_top.x - dx, gL_top.y - (dx / netDepth) * 14);
        ctx.lineTo(gL_bot.x - dx, gL_bot.y - (dx / netDepth) * 14);
        ctx.stroke();
      }

      // Suportes traseiros da rede (hastes metálicas)
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(gL_top.x, gL_top.y);
      ctx.lineTo(gL_top.x - netDepth, gL_top.y - 14);
      ctx.lineTo(gL_bot.x - netDepth, gL_bot.y - 14);
      ctx.lineTo(gL_bot.x, gL_bot.y);
      ctx.stroke();

      // Traves e Travessão Esquerdo Metálico Branco com Relevo
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 4;
      ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
      ctx.shadowBlur = 4;
      ctx.beginPath();
      ctx.moveTo(gL_top.x, gL_top.y);
      ctx.lineTo(gL_bot.x, gL_bot.y);
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Gol Direito (Away)
      const gR_top = projFn(100, 42), gR_bot = projFn(100, 58);

      // Malha da Rede Direita
      ctx.fillStyle = 'rgba(255, 255, 255, 0.16)';
      ctx.beginPath();
      ctx.moveTo(gR_top.x, gR_top.y);
      ctx.lineTo(gR_top.x + netDepth, gR_top.y - 14);
      ctx.lineTo(gR_bot.x + netDepth, gR_bot.y - 14);
      ctx.lineTo(gR_bot.x, gR_bot.y);
      ctx.closePath();
      ctx.fill();

      // Padrão de rede trançada direita
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.32)';
      ctx.lineWidth = 1;
      for(let y = gR_top.y - 14; y <= gR_bot.y; y += 5){
        ctx.beginPath();
        ctx.moveTo(gR_top.x, y);
        ctx.lineTo(gR_top.x + netDepth, y);
        ctx.stroke();
      }
      for(let dx = 0; dx <= netDepth; dx += 6){
        ctx.beginPath();
        ctx.moveTo(gR_top.x + dx, gR_top.y - (dx / netDepth) * 14);
        ctx.lineTo(gR_bot.x + dx, gR_bot.y - (dx / netDepth) * 14);
        ctx.stroke();
      }

      // Suportes traseiros direito
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(gR_top.x, gR_top.y);
      ctx.lineTo(gR_top.x + netDepth, gR_top.y - 14);
      ctx.lineTo(gR_bot.x + netDepth, gR_bot.y - 14);
      ctx.lineTo(gR_bot.x, gR_bot.y);
      ctx.stroke();

      // Traves e Travessão Direito Metálico Branco
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 4;
      ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
      ctx.shadowBlur = 4;
      ctx.beginPath();
      ctx.moveTo(gR_top.x, gR_top.y);
      ctx.lineTo(gR_bot.x, gR_bot.y);
      ctx.stroke();
      ctx.shadowBlur = 0;

      ctx.restore();
    },

    // Bola 3D com texturas clássicas (Telstar pentágonos), arco de elevação Z e sombra descolada
    drawRealistic3DBall(ctx, b, projFn) {
      if(!b) return;
      const pt = projFn(b.x, b.y);
      const ballAlt = Number(b.z) || 0;
      const ballY = pt.y - ballAlt * 2.5;

      // Sombra no gramado que se afasta da bola conforme o Z sobe
      const shadowScale = Math.max(0.3, 1.0 - ballAlt / 25);
      const shadowAlpha = Math.max(0.12, 0.45 - ballAlt / 35);
      ctx.fillStyle = `rgba(0, 0, 0, ${shadowAlpha})`;
      ctx.beginPath();
      ctx.ellipse(pt.x, pt.y, 5 * shadowScale, 2.6 * shadowScale, 0, 0, Math.PI * 2);
      ctx.fill();

      // Rastro de velocidade do chute
      if(Array.isArray(b.trail) && b.trail.length){
        b.trail.forEach(t => {
          const tPt = projFn(t.x, t.y);
          const tY = tPt.y - (Number(t.z) || 0) * 2.5;
          ctx.fillStyle = `rgba(250, 204, 21, ${(t.alpha || 1) * 0.45})`;
          ctx.beginPath();
          ctx.arc(tPt.x, tY - 4, 3 * (t.alpha || 1), 0, Math.PI * 2);
          ctx.fill();
          t.alpha = (t.alpha || 1) - 0.08;
        });
        b.trail = b.trail.filter(t => t.alpha > 0);
      }

      ctx.save();
      ctx.translate(pt.x, ballY - 4);
      ctx.rotate(b.spin || 0);

      // Corpo da bola branca com gradiente 3D esférico
      const ballGrad = ctx.createRadialGradient(-1.2, -1.2, 0.8, 0, 0, 4.6);
      ballGrad.addColorStop(0, '#ffffff');
      ballGrad.addColorStop(0.7, '#f1f5f9');
      ballGrad.addColorStop(1, '#94a3b8');
      ctx.fillStyle = ballGrad;
      ctx.beginPath();
      ctx.arc(0, 0, 4.6, 0, Math.PI * 2);
      ctx.fill();

      // Pentágono central clássico
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      for(let i = 0; i < 5; i++){
        const a = (i * 2 * Math.PI / 5) - Math.PI / 2;
        const px = Math.cos(a) * 1.8;
        const py = Math.sin(a) * 1.8;
        if(i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();

      // Contorno fino
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 0.6;
      ctx.stroke();

      ctx.restore();
    },

    // 4. Bandeirinhas Oficiais (Linesmen / Assistentes de Arbitragem)
    drawRealisticLinesman(ctx, lm, projFn) {
      if(!lm) return;
      const pt = projFn(lm.x, lm.y);
      const scale = 0.75 + (lm.y / 100) * 0.45;
      ctx.save();
      ctx.translate(pt.x, pt.y);

      // Sombra 3D sob o bandeirinha
      ctx.fillStyle = 'rgba(0, 0, 0, 0.38)';
      ctx.beginPath();
      ctx.ellipse(0, 0, 6.5 * scale, 2.6 * scale, 0, 0, Math.PI * 2);
      ctx.fill();

      // Pernas correndo ao longo da linha lateral
      const legOffset = Math.sin(lm.animFrame || 0) * (3.5 * scale);
      ctx.fillStyle = '#111111'; // Meião preto
      ctx.fillRect(-3 * scale, -4 * scale + legOffset, 2.2 * scale, 4 * scale);
      ctx.fillRect(0.8 * scale, -4 * scale - legOffset, 2.2 * scale, 4 * scale);

      // Calção preto de árbitro
      ctx.fillRect(-4.5 * scale, -9 * scale, 9 * scale, 5 * scale);

      // Camisa oficial de árbitro FIFA verde-limão fluorescente
      ctx.fillStyle = '#a3e635';
      ctx.fillRect(-5 * scale, -19 * scale, 10 * scale, 10 * scale);

      // Gola e detalhes pretos
      ctx.fillStyle = '#111111';
      ctx.fillRect(-1.5 * scale, -19 * scale, 3 * scale, 2.2 * scale);

      // Cabeça / Rosto
      ctx.fillStyle = '#fed7aa';
      ctx.beginPath();
      ctx.arc(0, -23 * scale, 4.5 * scale, 0, Math.PI * 2);
      ctx.fill();

      // Cabelo / Boné do bandeirinha
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(0, -24.5 * scale, 4.5 * scale, Math.PI * 0.9, Math.PI * 2.1);
      ctx.fill();

      // Braço e Bandeira (Empunhada para frente ou erguida no alto!)
      ctx.fillStyle = '#fed7aa';
      if(lm.flagRaised){
        // BANDEIRA ERGUIDA NO ALTO: IMPEDIMENTO CONFIRMADO!
        ctx.fillRect(1.5 * scale, -32 * scale, 2.2 * scale, 13 * scale); // Braço esticado para o alto
        // Haste da bandeira
        ctx.fillStyle = '#f1f5f9';
        ctx.fillRect(2 * scale, -42 * scale, 1.8 * scale, 22 * scale);
        // Pano da bandeira xadrez (Amarelo e Vermelho fluorescente FIFA)
        ctx.fillStyle = '#facc15';
        ctx.fillRect(3.8 * scale, -42 * scale, 11 * scale, 8 * scale);
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(3.8 * scale, -42 * scale, 5.5 * scale, 4 * scale);
        ctx.fillRect(9.3 * scale, -38 * scale, 5.5 * scale, 4 * scale);
      } else {
        // Bandeira correndo apontada para baixo
        ctx.fillRect(2 * scale, -16 * scale, 2.2 * scale, 8 * scale);
        ctx.fillStyle = '#f1f5f9';
        ctx.fillRect(2.5 * scale, -14 * scale, 1.5 * scale, 10 * scale);
        ctx.fillStyle = '#facc15';
        ctx.fillRect(4 * scale, -12 * scale, 7 * scale, 5 * scale);
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(4 * scale, -12 * scale, 3.5 * scale, 2.5 * scale);
      }

      ctx.restore();
    },

    // 5. Linha Virtual de Impedimento 3D Calibrada no Gramado
    draw3DOffsideLine(ctx, s, projFn) {
      if(!s || !s.offsideLine || (s.offsideLine.timer || 0) <= 0) return;
      const x = s.offsideLine.x;
      const pTop = projFn(x, 0);
      const pBot = projFn(x, 100);

      ctx.save();
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 3;
      ctx.setLineDash([8, 6]);
      ctx.shadowColor = '#dc2626';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.moveTo(pTop.x, pTop.y);
      ctx.lineTo(pBot.x, pBot.y);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.shadowBlur = 0;

      // Etiqueta indicadora
      const midX = (pTop.x + pBot.x) / 2;
      const midY = (pTop.y + pBot.y) / 2;
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(midX - 70, midY - 12, 140, 24);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 10px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('🚩 LINHA DE IMPEDIMENTO', midX, midY + 4);
      ctx.restore();

      s.offsideLine.timer -= 0.03;
    },

    // 6. Cabine do VAR Física na Beira do Gramado (Entre os Bancos de Reserva)
    drawPitchsideVarBooth(ctx, projFn, s) {
      const bx = 640;
      const by = 555;
      const isReviewing = Boolean(s && s.varCheck);

      ctx.save();
      // Plataforma de base do monitor do VAR
      ctx.fillStyle = '#0f172a';
      ctx.strokeStyle = isReviewing ? '#ef4444' : '#38bdf8';
      ctx.lineWidth = 2;
      ctx.fillRect(bx - 36, by - 6, 72, 48);
      ctx.strokeRect(bx - 36, by - 6, 72, 48);

      // Suporte e Kiosk do Monitor Oficial do VAR
      ctx.fillStyle = '#020617';
      ctx.fillRect(bx - 22, by + 2, 44, 26);
      ctx.strokeStyle = isReviewing ? '#f87171' : '#0ea5e9';
      ctx.lineWidth = 1.6;
      ctx.strokeRect(bx - 22, by + 2, 44, 26);

      // Tela acesa do monitor com sinal
      ctx.fillStyle = isReviewing ? 'rgba(239, 68, 68, 0.9)' : 'rgba(56, 189, 248, 0.85)';
      ctx.font = 'bold 10px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(isReviewing ? 'VAR • LIVE' : 'VAR', bx, by + 19);

      // Cobertura/Capota de proteção contra reflexo solar
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.moveTo(bx - 30, by - 5);
      ctx.lineTo(bx + 30, by - 5);
      ctx.lineTo(bx + 20, by - 14);
      ctx.lineTo(bx - 20, by - 14);
      ctx.closePath();
      ctx.fill();

      // Placa de identificação "CABINE DO VAR"
      ctx.fillStyle = '#94a3b8';
      ctx.font = 'bold 7px Inter, sans-serif';
      ctx.fillText('CABINE DO VAR', bx, by + 37);

      // Se o árbitro estiver em análise na cabine:
      if(isReviewing){
        // Árbitro em pé na cabine olhando para a tela
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(bx - 6, by + 12, 12, 22);
        ctx.fillStyle = '#facc15'; // Camisa amarela
        ctx.fillRect(bx - 6, by + 4, 12, 10);
        ctx.fillStyle = '#fed7aa'; // Cabeça
        ctx.beginPath(); ctx.arc(bx, by + 1, 4.5, 0, Math.PI * 2); ctx.fill();
      }

      ctx.restore();
    },

    // 7. Overlay de Transmissão da TV: Análise do VAR em Tempo Real
    drawBroadcastVarOverlay(ctx, s) {
      if(!s || !s.varCheck) return;
      const v = s.varCheck;

      ctx.save();
      // Tarja superior estilo transmissão de TV internacional
      ctx.fillStyle = 'rgba(5, 8, 22, 0.95)';
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2.5;
      ctx.shadowColor = '#dc2626';
      ctx.shadowBlur = 20;
      ctx.fillRect(380, 24, 520, 64);
      ctx.strokeRect(380, 24, 520, 64);
      ctx.shadowBlur = 0;

      // Ícone do VAR piscante
      const flash = Math.sin(Date.now() / 180) > 0;
      ctx.fillStyle = flash ? '#ef4444' : '#ffffff';
      ctx.font = '900 13px Inter, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('🖥️ VAR • REVISÃO NO MONITOR', 400, 48);

      // Detalhe da checagem
      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 11px Inter, sans-serif';
      ctx.fillText(v.text || 'Analisando possível irregularidade no lance...', 400, 68);

      // Barra de progresso da decisão
      const progress = Math.max(0, Math.min(1, 1 - ((v.timer || 0) / 2.8)));
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(400, 76, 480, 5);
      ctx.fillStyle = '#10b981';
      ctx.fillRect(400, 76, 480 * progress, 5);

      ctx.restore();
    },

    // 8. Novo Estádio 3D Imersivo Cinema (Estrutura Real, Mosaicos Vivos, Holofotes Volumétricos e Sem Bloqueios)
    getStadiumProfile(clubName, gameState = null) {
      const n = String(clubName || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
      const careerClub = String(gameState?.club || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
      if(gameState && n === careerClub){
        const custom = gameState.stadiumCustomization || {};
        return { id:'career-stadium', style:'career', name:custom.name || gameState.stadiumName || gameState.stadium?.name || `Estádio do ${clubName}`, primary:custom.standColor || '#334155', secondary:custom.seatColor || gameState.homeKit?.shirtColor || '#2563eb', accent:custom.accentColor || '#facc15', grassColor:custom.grassColor || '#15803d', capacity:Number(gameState.infrastructure?.stadium?.capacity || gameState.stadium?.capacity) || 18000, roof:Number(gameState.infrastructure?.stadium?.level || 1) >= 3 ? 'full' : 'partial', upgrades:gameState.stadiumUpgrades || {}, customization:custom };
      }
      const profiles = [
        { match:['flamengo','clube de regatas do flamengo','fluminense','fluminense football club'], id:'maracana',name:'Maracanã',style:'maracana',primary:'#c7cbd1',secondary:'#64748b',accent:'#facc15',capacity:78838,roof:'ring' },
        { match:['corinthians','sport club corinthians paulista'], id:'neo-quimica',name:'Neo Química Arena',style:'neo-quimica',primary:'#20242a',secondary:'#f8fafc',accent:'#e11d48',capacity:49200,roof:'partial' },
        { match:['palmeiras','sociedade esportiva palmeiras'], id:'allianz-parque',name:'Allianz Parque',style:'allianz-parque',primary:'#d1d5db',secondary:'#15803d',accent:'#22c55e',capacity:43713,roof:'full' },
        { match:['sao paulo','sao paulo futebol clube'], id:'morumbis',name:'MorumBIS',style:'morumbi',primary:'#d1d5db',secondary:'#dc2626',accent:'#111827',capacity:66700,roof:'partial' },
        { match:['gremio','gremio foot ball porto alegrense'], id:'arena-gremio',name:'Arena do Grêmio',style:'arena-gremio',primary:'#64748b',secondary:'#0284c7',accent:'#f8fafc',capacity:55600,roof:'full' },
        { match:['internacional','sport club internacional'], id:'beira-rio',name:'Beira-Rio',style:'beira-rio',primary:'#dc2626',secondary:'#64748b',accent:'#f8fafc',capacity:50800,roof:'full' },
        { match:['atletico mineiro','atletico mg','clube atletico mineiro'], id:'arena-mrv',name:'Arena MRV',style:'arena-mrv',primary:'#111827',secondary:'#f8fafc',accent:'#dc2626',capacity:47400,roof:'full' },
        { match:['cruzeiro'], id:'mineirao',name:'Mineirão',style:'mineirao',primary:'#0284c7',secondary:'#e2e8f0',accent:'#2563eb',capacity:62000,roof:'ring' },
        { match:['botafogo'], id:'nilton-santos',name:'Nilton Santos',style:'nilton-santos',primary:'#111827',secondary:'#f8fafc',accent:'#6b7280',capacity:45200,roof:'partial' },
        { match:['bahia'], id:'fonte-nova',name:'Arena Fonte Nova',style:'fonte-nova',primary:'#0284c7',secondary:'#dc2626',accent:'#f8fafc',capacity:56500,roof:'ring' },
        { match:['real madrid'], id:'bernabeu',name:'Santiago Bernabéu',style:'bernabeu',primary:'#d1d5db',secondary:'#f8fafc',accent:'#2563eb',capacity:82000,roof:'retractable' },
        { match:['barcelona','fc barcelona'], id:'camp-nou',name:'Spotify Camp Nou',style:'camp-nou',primary:'#1e3a8a',secondary:'#991b1b',accent:'#facc15',capacity:99000,roof:'partial' },
        { match:['bayern munich','bayern de munique','bayern munchen','fc bayern munchen'], id:'allianz-arena',name:'Allianz Arena',style:'allianz',primary:'#e2e8f0',secondary:'#dc2626',accent:'#2563eb',capacity:71137,roof:'full' },
        { match:['manchester city'], id:'etihad',name:'Etihad Stadium',style:'etihad',primary:'#38bdf8',secondary:'#e2e8f0',accent:'#0284c7',capacity:53400,roof:'partial' },
        { match:['manchester united'], id:'old-trafford',name:'Old Trafford',style:'old-trafford',primary:'#dc2626',secondary:'#475569',accent:'#f8fafc',capacity:74300,roof:'partial' },
        { match:['paris saint germain','psg'], id:'parc-des-princes',name:'Parc des Princes',style:'parc-des-princes',primary:'#1e3a8a',secondary:'#dc2626',accent:'#f8fafc',capacity:47900,roof:'full' },
        { match:['juventus'], id:'allianz-stadium-torino',name:'Allianz Stadium',style:'allianz-torino',primary:'#111827',secondary:'#f8fafc',accent:'#facc15',capacity:41500,roof:'full' },
        { match:['urawa reds','urawa red diamonds','urawa'], id:'saitama-stadium',name:'Saitama Stadium 2002',style:'saitama',primary:'#dc2626',secondary:'#f8fafc',accent:'#991b1b',capacity:62040,roof:'partial' },
        { match:['yokohama f marinos','yokohama f marinos fc'], id:'nissan-stadium',name:'Nissan Stadium',style:'nissan-stadium',primary:'#0284c7',secondary:'#f8fafc',accent:'#dc2626',capacity:72327,roof:'partial' },
        { match:['tokyo','fc tokyo'], id:'ajinomoto-stadium',name:'Ajinomoto Stadium',style:'ajinomoto',primary:'#1d4ed8',secondary:'#f8fafc',accent:'#dc2626',capacity:48955,roof:'partial' },
        { match:['al hilal','al hilal saudi club'], id:'kingdom-arena',name:'Kingdom Arena',style:'asian-elite',primary:'#1e3a8a',secondary:'#f8fafc',accent:'#60a5fa',capacity:26000,roof:'full' },
        { match:['al nassr','al nassr fc'], id:'al-awwal-park',name:'Al-Awwal Park',style:'al-awwal-park',primary:'#facc15',secondary:'#1e3a8a',accent:'#f8fafc',capacity:25000,roof:'partial' },
        { match:['al ittihad','al ittihad club'], id:'king-abdullah-sports-city',name:'King Abdullah Sports City',style:'king-abdullah',primary:'#facc15',secondary:'#111827',accent:'#f8fafc',capacity:62000,roof:'partial' }
      ];
      const found = profiles.find(profile => profile.match.includes(n));
      return found ? { ...found } : { id:'generic', name:`Estádio Municipal de ${clubName || 'Visitante'}`, style:'generic', primary:'#475569', secondary:'#64748b', accent:'#94a3b8', capacity:22000, roof:'partial' };
    },

    draw4SectorsStadium(ctx, s, projFn) {
      const capacity = s.stadium?.capacity || 20000;
      const stadiumProfile = s.stadium?.profile || this.getStadiumProfile(s.home, null);
      // O estádio da carreira herda o save; visitante de elite recebe silhueta/cores próprias, os demais usam genérico.
      let stModel = null;
      if (stadiumProfile?.id === 'career-stadium' && typeof window !== 'undefined' && window.AFMStadium3D?.resolveStadiumModel) {
        stModel = window.AFMStadium3D.resolveStadiumModel(s.home, window.state);
      }
      const profileLevel = Number(stadiumProfile.level || stadiumProfile.infrastructureLevel || 0);
      const stLevel = stModel ? stModel.stLevel : (profileLevel || (capacity >= 60000 ? 3 : (capacity >= 30000 ? 2 : 1)));
      const upgrades = s.stadium?.upgrades || {};
      const homeColor = stadiumProfile?.secondary || s.homeKit?.primary || '#f59e0b';
      const homeSecColor = stadiumProfile?.primary || s.homeKit?.secondary || '#111111';
      const stadiumAccent = stadiumProfile?.accent || '#facc15';
      const grassBase = stadiumProfile?.grassColor || s.stadium?.customization?.grassColor || '#14532d';
      const grassStripeA = s.stadium?.customization?.grassStripeA || '#15803d';
      const grassStripeB = s.stadium?.customization?.grassStripeB || '#16a34a';
      const style = stadiumProfile.style || 'generic';
      const userCareerStadium = stadiumProfile.id === 'career-stadium';
      // O gramado do broadcast compartilha a paleta salva usada pela maquete 3D.
      const pitchBaseColor = userCareerStadium ? grassBase : '#14532d';
      const pitchStripeColors = userCareerStadium ? [grassStripeA, grassStripeB] : ['#166534', '#15803d'];
      s.stadium.profile = stadiumProfile;
      s.stadium.renderStyle = style;
      s.stadium.colors = { primary: stadiumProfile.primary, seats: stadiumProfile.secondary, accent: stadiumAccent, grass: grassBase };
      const ticks = s.renderTicks || 0;

      // 1. Céu Noturno / Crepúsculo Atmosférico com Neblina de Estádio
      const skyGrad = ctx.createLinearGradient(0, 0, 0, 210);
      skyGrad.addColorStop(0, '#040711');
      skyGrad.addColorStop(0.45, stadiumProfile.style === 'allianz' ? '#10295a' : '#0b1329');
      skyGrad.addColorStop(0.85, '#162035');
      skyGrad.addColorStop(1, '#1e293b');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, 1280, 210);

      // 2. Cobertura Monumental Cantilever (Nível 2 e 3+)
      const standTop = ['allianz','bernabeu','camp-nou','old-trafford','asian-elite'].includes(style) ? 30 : ['maracana','mineirao','fonte-nova','japan-national'].includes(style) ? 58 : (stLevel >= 3 ? 42 : (stLevel === 2 ? 80 : 120));
      const standBottom = 190;

      if(stadiumProfile.roof !== 'none' && stLevel >= 2){
        ctx.fillStyle = style === 'allianz' ? '#dbeafe' : style === 'bernabeu' ? '#9ca3af' : '#070b14';
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(1280, 0);
        ctx.lineTo(1280, standTop - 10);
        if(style === 'bernabeu'){
          ctx.lineTo(1120, standTop - 25); ctx.lineTo(960, standTop - 18); ctx.lineTo(800, standTop - 8);
          ctx.lineTo(640, standTop - 3); ctx.lineTo(480, standTop - 8); ctx.lineTo(320, standTop - 18); ctx.lineTo(160, standTop - 25);
        } else if(['maracana','mineirao','fonte-nova','japan-national'].includes(style)){
          ctx.lineTo(1280, standTop + 5); ctx.lineTo(1120, standTop - 5); ctx.lineTo(960, standTop + 2);
          ctx.lineTo(800, standTop - 3); ctx.lineTo(640, standTop + 4); ctx.lineTo(480, standTop - 3); ctx.lineTo(320, standTop + 2); ctx.lineTo(160, standTop - 5);
        } else {
          ctx.quadraticCurveTo(640, standTop + 14, 0, standTop - 10);
        }
        ctx.closePath();
        ctx.fill();

        // Treliças metálicas de aço iluminadas
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 2;
        for(let tx = 80; tx < 1220; tx += 110){
          ctx.beginPath();
          ctx.moveTo(tx, 0);
          ctx.lineTo(tx + 20, standTop);
          ctx.stroke();
        }
      }

      // Silhuetas de fachadas específicas em low-poly: Allianz (painéis), Bernabéu (lâminas metálicas),
      // e Saitama (duas coberturas elevadas sobre a entrada central).
      if(style === 'allianz-parque'){
        ctx.save();
        ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 2;
        for(let x = 110; x <= 1170; x += 32){
          ctx.beginPath(); ctx.moveTo(x, standTop + 14); ctx.lineTo(x + 12, standTop + 2); ctx.stroke();
        }
        ctx.restore();
      } else if(style === 'saitama'){
        ctx.save();
        ctx.fillStyle = '#cbd5e1'; ctx.strokeStyle = '#64748b'; ctx.lineWidth = 2;
        [[80,standTop+2,250,-22],[950,standTop+2,250,-22]].forEach(([x,y,w,h])=>{
          ctx.beginPath(); ctx.moveTo(x,y); ctx.lineTo(x+35,y+h); ctx.lineTo(x+w-35,y+h); ctx.lineTo(x+w,y); ctx.closePath(); ctx.fill(); ctx.stroke();
        });
        ctx.fillStyle = '#64748b'; ctx.fillRect(510, standTop + 4, 260, 20);
        ctx.restore();
      } else if(style === 'nissan-stadium' || style === 'ajinomoto'){
        ctx.save(); ctx.strokeStyle = '#cbd5e1'; ctx.lineWidth = 3;
        for(let x=120;x<1180;x+=70){ctx.beginPath();ctx.moveTo(x,standTop-3);ctx.lineTo(x+20,standTop+18);ctx.stroke();}
        ctx.restore();
      } else if(style === 'al-awwal-park' || style === 'king-abdullah'){
        ctx.save(); ctx.strokeStyle = '#e2e8f0'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(160,standTop+1); ctx.lineTo(270,standTop-16); ctx.lineTo(1010,standTop-16); ctx.lineTo(1120,standTop+1); ctx.stroke();
        ctx.restore();
      }

      // 3. SETOR LESTE (Arquibancada Superior de Fundo)
      const tiersCount = stLevel >= 3 ? 12 : (stLevel === 2 ? 8 : 5);
      ctx.fillStyle = style === 'allianz' ? '#e2e8f0' : style === 'bernabeu' ? '#6b7280' : (stadiumProfile.primary || '#111827');
      ctx.beginPath();
      ctx.moveTo(0, standTop);
      ctx.lineTo(1280, standTop);
      ctx.lineTo(1040, standBottom);
      ctx.lineTo(240, standBottom);
      ctx.closePath();
      ctx.fill();

      // Degraus individuais de concreto com cadeiras amarelas e cinzas em perspectiva
      for(let i = 0; i < tiersCount; i++){
        const ty = standTop + (i / tiersCount) * (standBottom - standTop);
        const lx = (i / tiersCount) * 240;
        const rx = 1280 - (i / tiersCount) * 240;
        
        // Linha do degrau de concreto
        ctx.strokeStyle = style === 'allianz' ? '#94a3b8' : style === 'bernabeu' ? '#4b5563' : '#1f293d';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(lx, ty);
        ctx.lineTo(rx, ty);
        ctx.stroke();

        // Fileiras de Torcedores e Cadeiras (Padrão BRFC27: Amarelo e Cinza Concreto com Clube)
        const seats = stLevel >= 3 ? 56 : (stLevel === 2 ? 42 : 28);
        for(let c = 0; c < seats; c++){
          const cx = lx + (c / seats) * (rx - lx);
          // Alternância estética de assentos: Amarelo ouro (#facc15), Cinza ardósia (#475569) e cor do clube
          const seatColor = style === 'generic'
            ? ['#64748b', '#475569', '#334155', '#1e293b'][c % 4]
            : [stadiumAccent, homeSecColor, homeColor, stadiumProfile.primary || '#334155'][c % 4];
          ctx.fillStyle = seatColor;
          ctx.fillRect(cx, ty - 3.5, 4.5, 2.5);

          // Torcedores vibrando (hash estável sem cintilação aleatória)
          const seatHash = (c * 17 + i * 31) % 100;
          const crowdPct = stLevel >= 3 ? 90 : (stLevel === 2 ? 72 : 40);
          if(seatHash < crowdPct){
            ctx.fillStyle = style === 'generic'
              ? ['#64748b', '#9ca3af', '#475569'][seatHash % 3]
              : [homeColor, '#ffffff', stadiumAccent, homeSecColor][seatHash % 4];
            ctx.beginPath();
            ctx.arc(cx + 2.2, ty - 5, 2.3, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      // 4. BANDEIRÕES OFICIAIS DA TORCIDA NO SETOR SUPERIOR
      if(stLevel >= 2){
      const flagColors = style === 'generic' ? ['#64748b','#cbd5e1','#475569','#e2e8f0'] : [homeColor, '#ffffff', homeSecColor, stadiumAccent];
        for(let f = 0; f < 5; f++){
          const fx = 260 + f * 180;
          const wave = Math.sin(ticks * 0.08 + f) * 5;
          ctx.fillStyle = flagColors[f % flagColors.length];
          ctx.beginPath();
          ctx.moveTo(fx, standTop + 5);
          ctx.lineTo(fx + 26, standTop + 5 + wave);
          ctx.lineTo(fx + 26, standTop + 22 + wave);
          ctx.lineTo(fx, standTop + 22);
          ctx.closePath();
          ctx.fill();
        }
      }

      // 5. SINALIZADORES E FUMAÇA DOURADA DA TORCIDA (CROWD FLARES & SMOKE BRFC27)
      // Núcleos incandescentes de sinalizadores na curva da torcida
      const flarePositions = upgrades.flares ? [380, 440, 500, 800, 860] : [];
      flarePositions.forEach((fx, idx) => {
        const fy = standBottom - 10;
        const sparkPulse = 3.5 + Math.sin(ticks * 0.25 + idx * 1.7) * 1.5;
        
        // Brilho quente do sinalizador aceso
        const flareGlow = ctx.createRadialGradient(fx, fy, 1, fx, fy, sparkPulse * 4.5);
        flareGlow.addColorStop(0, '#ffffff');
        flareGlow.addColorStop(0.25, '#fef08a');
        flareGlow.addColorStop(0.6, '#ffd54a');
        flareGlow.addColorStop(1, 'rgba(234, 88, 12, 0)');
        ctx.fillStyle = flareGlow;
        ctx.beginPath();
        ctx.arc(fx, fy, sparkPulse * 4.5, 0, Math.PI * 2);
        ctx.fill();
      });

      // Partículas de fumaça dourada/amarela subindo da arquibancada
      const smokeCount = 16;
      for(let sIdx = 0; sIdx < smokeCount; sIdx++){
        const baseFx = flarePositions[sIdx % flarePositions.length];
        const life = ((ticks * 0.03 + sIdx * 0.16) % 1.0);
        const sx = baseFx + Math.sin(ticks * 0.04 + sIdx * 1.3) * (8 + life * 14);
        const sy = (standBottom - 12) - life * (standBottom - standTop + 50);
        const radius = 9 + life * 26;
        const alpha = Math.sin(life * Math.PI) * 0.32;

        if(alpha > 0.01){
          const smokeGrad = ctx.createRadialGradient(sx, sy, 2, sx, sy, radius);
          smokeGrad.addColorStop(0, `rgba(254, 240, 138, ${alpha * 0.9})`);
          smokeGrad.addColorStop(0.45, `rgba(250, 204, 21, ${alpha * 0.6})`);
          smokeGrad.addColorStop(0.8, `rgba(245, 158, 11, ${alpha * 0.3})`);
          smokeGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
          ctx.fillStyle = smokeGrad;
          ctx.beginPath();
          ctx.arc(sx, sy, radius, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // 6. SETOR NORTE & SETOR SUL (Laterais Curvas com Degraus e Assentos em Perspectiva)
      // Lateral Esquerda (Norte)
      ctx.fillStyle = style === 'generic' ? '#334155' : (stadiumProfile.primary || '#0f172a');
      ctx.beginPath();
      ctx.moveTo(0, standTop);
      ctx.lineTo(240, standBottom);
      ctx.lineTo(40, 530);
      ctx.lineTo(0, 530);
      ctx.closePath();
      ctx.fill();

      // Degraus e torcida na lateral esquerda
      for(let li = 1; li <= 5; li++){
        const lt = li / 6;
        const yLine = standTop + lt * (530 - standTop);
        const xStart = 130 - lt * 130;
        const xEnd = 240 - lt * 200;
        ctx.strokeStyle = style === 'generic' ? '#475569' : (stadiumProfile.secondary || '#1e293b');
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(xStart, yLine);
        ctx.lineTo(xEnd, yLine);
        ctx.stroke();

        // Assentos na lateral norte
        for(let sc = 0; sc < 6; sc++){
          const ax = xStart + (sc / 6) * (xEnd - xStart);
          ctx.fillStyle = style === 'generic' ? (sc % 2 === 0 ? '#64748b' : '#475569') : [homeColor, homeSecColor, stadiumAccent][sc % 3];
          ctx.fillRect(ax, yLine - 2.5, 3.5, 2);
        }
      }

      // Lateral Direita (Sul)
      ctx.fillStyle = style === 'generic' ? '#334155' : (stadiumProfile.primary || '#0f172a');
      ctx.beginPath();
      ctx.moveTo(1040, standBottom);
      ctx.lineTo(1280, standTop);
      ctx.lineTo(1280, 530);
      ctx.lineTo(1240, 530);
      ctx.closePath();
      ctx.fill();

      // Degraus e torcida na lateral direita
      for(let ri = 1; ri <= 5; ri++){
        const rt = ri / 6;
        const yLine = standTop + rt * (530 - standTop);
        const xStart = 1040 + rt * 200;
        const xEnd = 1150 + rt * 130;
        ctx.strokeStyle = style === 'generic' ? '#475569' : (stadiumProfile.secondary || '#1e293b');
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(xStart, yLine);
        ctx.lineTo(xEnd, yLine);
        ctx.stroke();

        // Assentos na lateral sul
        for(let sc = 0; sc < 6; sc++){
          const ax = xStart + (sc / 6) * (xEnd - xStart);
          ctx.fillStyle = style === 'generic' ? (sc % 2 === 0 ? '#64748b' : '#475569') : [homeColor, homeSecColor, stadiumAccent][sc % 3];
          ctx.fillRect(ax, yLine - 2.5, 3.5, 2);
        }
      }

      // 7. PLACAS DE PUBLICIDADE CONTÍNUAS OFICIAIS (BRFC27, BETANO, CENTRAL DAS PROMOS, IFOOD, BYD)
      // Mureta da arquibancada de fundo
      const adBoards = [
        { name: 'BRFC27', bg: '#6d28d9', fg: '#ffffff' },
        { name: 'BETANO', bg: '#f97316', fg: '#ffffff' },
        { name: 'CENTRAL DAS PROMOS', bg: '#0a3ec2', fg: '#ffffff' },
        { name: 'IFOOD', bg: '#dc2626', fg: '#ffffff' },
        { name: 'BYD', bg: '#0b0716', fg: '#06b6d4' },
        { name: 'SUPERMERCADO DO BAIRRO', bg: '#16a34a', fg: '#ffffff' },
        { name: 'AÇAÍ DA VILA', bg: '#4c1d95', fg: '#facc15' },
        { name: 'FUTEBOL PARA TODOS', bg: '#facc15', fg: '#111111' }
      ].map(board => style === 'generic' ? { ...board, bg:'#334155', fg:'#e2e8f0' } : board);
      if(style === 'generic'){
        adBoards.splice(0, adBoards.length,
          {name:'ESTÁDIO MUNICIPAL',bg:'#334155',fg:'#e2e8f0'},
          {name:'FUTEBOL LOCAL',bg:'#475569',fg:'#f8fafc'},
          {name:'ESPORTE PARA TODOS',bg:'#1e293b',fg:'#cbd5e1'},
          {name:'ARENA MUNICIPAL',bg:'#334155',fg:'#f8fafc'},
          {name:'TORCIDA PRESENTE',bg:'#475569',fg:'#e2e8f0'},
          {name:'DIA DE JOGO',bg:'#1e293b',fg:'#f8fafc'},
          {name:'SEJA BEM-VINDO',bg:'#334155',fg:'#cbd5e1'},
          {name:'FUTEBOL',bg:'#475569',fg:'#f8fafc'}
        );
      }

      const boardY = 172;
      const boardH = 17;
      const wallLeft = 236;
      const wallWidth = 808;
      const singleBoardW = wallWidth / adBoards.length;

      // Moldura e fundo das placas
      ctx.fillStyle = style === 'generic' ? '#1e293b' : (stadiumProfile.primary || '#0b0f19');
      ctx.fillRect(wallLeft, boardY, wallWidth, boardH);

      adBoards.forEach((board, bIdx) => {
        const bx = wallLeft + bIdx * singleBoardW;
        // Fundo da placa de publicidade
        ctx.fillStyle = board.bg;
        ctx.fillRect(bx + 1, boardY + 1, singleBoardW - 2, boardH - 2);

        // Borda LED iluminada superior
        ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
        ctx.fillRect(bx + 1, boardY + 1, singleBoardW - 2, 1.5);

        // Texto do patrocinador
        ctx.fillStyle = board.fg;
        ctx.font = 'bold 8px "Barlow Condensed", Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(board.name, bx + singleBoardW / 2, boardY + boardH / 2 + 0.5);
      });

      // Silhuetas arquitetônicas reconhecíveis (interpretação low-poly, não cópia fotogramétrica).
      if(style === 'allianz'){
        ctx.save();
        for(let i=0;i<32;i++){
          const x=24+i*39;
          ctx.fillStyle=(i%3===0)?'#2563eb':(i%3===1?'#dc2626':'#f8fafc'); ctx.globalAlpha=0.8;
          ctx.beginPath(); ctx.moveTo(x,standTop-10); ctx.lineTo(x+20,standTop-15); ctx.lineTo(x+30,standTop+8); ctx.lineTo(x+10,standTop+10); ctx.closePath(); ctx.fill();
        }
        ctx.globalAlpha=1; ctx.restore();
      } else if(style === 'bernabeu'){
        ctx.save(); ctx.fillStyle='#9ca3af'; ctx.strokeStyle='#e5e7eb'; ctx.lineWidth=2;
        ctx.beginPath(); ctx.moveTo(115,standTop-8); ctx.lineTo(210,standTop-31); ctx.lineTo(1070,standTop-31); ctx.lineTo(1165,standTop-8); ctx.lineTo(1080,standTop+1); ctx.lineTo(200,standTop+1); ctx.closePath(); ctx.fill(); ctx.stroke();
        for(let x=230;x<1080;x+=34){ctx.strokeStyle=(x%2)?'#6b7280':'#d1d5db';ctx.beginPath();ctx.moveTo(x,standTop-27);ctx.lineTo(x+15,standTop-3);ctx.stroke();}
        ctx.restore();
      } else if(['maracana','mineirao','fonte-nova'].includes(style)){
        ctx.save(); ctx.strokeStyle=stadiumAccent; ctx.lineWidth=8; ctx.beginPath(); ctx.ellipse(640,standBottom-12,440,54,0,Math.PI,Math.PI*2); ctx.stroke();
        ctx.strokeStyle='#e2e8f0'; ctx.lineWidth=2; ctx.beginPath(); ctx.ellipse(640,standBottom-12,440,54,0,Math.PI,Math.PI*2); ctx.stroke(); ctx.restore();
      } else if(['neo-quimica','camp-nou','old-trafford'].includes(style)){
        ctx.save(); for(let i=0;i<8;i++){const x=255+i*110;ctx.fillStyle=stadiumAccent;ctx.fillRect(x,standBottom-17,96,6);} ctx.restore();
      }

      if(stadiumProfile.id === 'career-stadium'){
        const custom=stadiumProfile.customization||{};
        if(custom.accentColor){ctx.save();ctx.fillStyle=custom.accentColor;ctx.fillRect(236,boardY-3,wallWidth,2);ctx.restore();}
        if(custom.name){ctx.save();ctx.fillStyle='rgba(2,6,23,.9)';ctx.fillRect(450,standBottom+6,380,20);ctx.strokeStyle=custom.accentColor||'#facc15';ctx.strokeRect(450,standBottom+6,380,20);ctx.fillStyle='#fff';ctx.font='bold 11px Inter, sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(String(custom.name).slice(0,40),640,standBottom+16);ctx.restore();}
      }

      // Acabamentos do campo no broadcast acompanham a paleta personalizada do estádio da carreira.
      if(userCareerStadium){
        ctx.save();
        ctx.strokeStyle = grassBase; ctx.lineWidth = 2;
        ctx.strokeRect(238, boardY + boardH + 3, wallWidth - 4, 4);
        ctx.fillStyle = pitchStripeColors[0]; ctx.fillRect(240, boardY + boardH + 4, 80, 2);
        ctx.fillStyle = pitchStripeColors[1]; ctx.fillRect(320, boardY + boardH + 4, 80, 2);
        ctx.restore();
      }

      // Mureta de borda com contorno fino dourado
      ctx.strokeStyle = style === 'generic' ? '#64748b' : stadiumAccent;
      ctx.lineWidth = 1;
      ctx.strokeRect(wallLeft, boardY, wallWidth, boardH);

      // Placas laterais em perspectiva ao longo das linhas de fundo
      // Lateral esquerda (perspectiva de 190 até 520)
      ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
      ctx.beginPath();
      ctx.moveTo(228, 190);
      ctx.lineTo(238, 190);
      ctx.lineTo(38, 520);
      ctx.lineTo(28, 520);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = style === 'generic' ? 'rgba(148,163,184,0.35)' : `${stadiumAccent}66`;
      ctx.stroke();

      // Lateral direita (perspectiva de 190 até 520)
      ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
      ctx.beginPath();
      ctx.moveTo(1042, 190);
      ctx.lineTo(1052, 190);
      ctx.lineTo(1252, 520);
      ctx.lineTo(1242, 520);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = style === 'generic' ? 'rgba(148,163,184,0.35)' : `${stadiumAccent}66`;
      ctx.stroke();

      // 9. 4 TORRES DE REFLETORES VOLUMÉTRICOS DE TRANSMISSÃO 3D (4 CANTORES DO ESTÁDIO)
      const towerPositions = stadiumProfile.id === 'career-stadium' && !upgrades.ledLights ? [] : [
        { x: 125, y: standTop - 24, lightX: 360, lightY: 340, side: 'TL' },
        { x: 1145, y: standTop - 24, lightX: 920, lightY: 340, side: 'TR' },
        { x: 26, y: 460, lightX: 320, lightY: 420, side: 'BL' },
        { x: 1244, y: 460, lightX: 960, lightY: 420, side: 'BR' }
      ];

      towerPositions.forEach((tower) => {
        // Feixe de luz volumétrico atmosférico em direção ao centro do campo
        const lightGrad = ctx.createRadialGradient(tower.x + 8, tower.y + 6, 4, tower.lightX, tower.lightY, 460);
        lightGrad.addColorStop(0, 'rgba(255, 255, 255, 0.16)');
        lightGrad.addColorStop(0.5, 'rgba(255, 255, 220, 0.04)');
        lightGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = lightGrad;
        ctx.beginPath();
        ctx.arc(tower.lightX, tower.lightY, 460, 0, Math.PI * 2);
        ctx.fill();

        // Estrutura metálica de aço da torre (pilar treliçado)
        ctx.fillStyle = stadiumProfile.id === 'career-stadium' ? (stadiumProfile.primary || '#334155') : '#334155';
        ctx.fillRect(tower.x + 5, tower.y + 12, 8, 90);
        // Treliças diagonais da torre
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 1;
        for(let ty = tower.y + 12; ty < tower.y + 90; ty += 12){
          ctx.beginPath();
          ctx.moveTo(tower.x + 5, ty);
          ctx.lineTo(tower.x + 13, ty + 8);
          ctx.stroke();
        }

        // Painel retangular de lâmpadas halógenas brancas
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(tower.x - 6, tower.y - 4, 30, 16);
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 1;
        ctx.strokeRect(tower.x - 6, tower.y - 4, 30, 16);

        // Matriz de lâmpadas emissivas ultra-brilhantes
        ctx.fillStyle = '#ffffff';
        for(let lx = 0; lx < 3; lx++){
          for(let ly = 0; ly < 2; ly++){
            ctx.beginPath();
            ctx.arc(tower.x + lx * 8 - 1, tower.y + ly * 6 + 1, 2.2, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      });
    },

    // 9. Câmera de Transmissão 3D Dinâmica (Suporta Lateral, Bola e Gol)
    applyTvBroadcastCamera(ctx, s, projFn) {
      if(!s) return;
      s.camera = s.camera || { x: 640, y: 360, targetX: 640, targetY: 360, zoom: 1.0, targetZoom: 1.0, mode: 'lateral' };
      const cam = s.camera;
      const cMode = s.cameraMode || cam.mode || 'lateral';
      cam.mode = cMode;

      if(cMode === 'lateral' || cMode === 'wide' || cMode === 'tv'){
        // Camera de transmissao mais aberta: campo e arquibancadas permanecem no quadro.
        cam.targetX = 640;
        cam.targetY = 350;
        cam.targetZoom = cMode === 'wide' ? 0.86 : 0.92;
      } else if(cMode === 'ball'){
        // MODO BOLA: Foco sutil na bola com limites seguros para nunca cortar o campo
        const ball = s.ball || { x: 50, y: 50 };
        const pt = projFn(ball.x, ball.y);
        cam.targetX = Math.max(520, Math.min(760, pt.x));
        cam.targetY = Math.max(320, Math.min(400, pt.y - 10));
        cam.targetZoom = 1.10;
      } else if(cMode === 'goal'){
        // MODO GOL: Foco na área de finalização com limites seguros
        const ball = s.ball || { x: 50, y: 50 };
        cam.targetX = ball.x >= 50 ? 780 : 500;
        cam.targetY = 360;
        cam.targetZoom = 1.08;
      }

      // Interpolação suave (lerp) sem solavancos
      cam.x += (cam.targetX - cam.x) * 0.08;
      cam.y += (cam.targetY - cam.y) * 0.08;
      cam.zoom += (cam.targetZoom - cam.zoom) * 0.07;

      ctx.save();
      ctx.translate(640, 360);
      ctx.scale(cam.zoom, cam.zoom);
      ctx.translate(-cam.x, -cam.y);
    },
    restoreTvBroadcastCamera(ctx, s) {
      if(s?.camera && ['tv', 'lateral', 'ball', 'goal'].includes(s.camera.mode)){
        ctx.restore();
      }
    }
  };

  function hashStr(s){
    let h = 2166136261;
    for(const ch of String(s || '')){
      h ^= ch.charCodeAt(0);
      h = Math.imul(h, 16777619);
    }
    return Math.abs(h >>> 0);
  }

  // Exportações Globais
  window.AFM_REAL_FOOTBALL = {
    getClubKit,
    rules: RealFootballRules,
    renderer: RealPitchRenderer3D
  };

})(typeof window !== 'undefined' ? window : globalThis);
