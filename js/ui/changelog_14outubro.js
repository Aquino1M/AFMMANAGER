// ==============================================================================
// AFM MANAGER 2027 — ABA NOVIDADES E CORREÇÕES SEPARADA POR DIAS ATÉ 14/OUTUBRO
// Arquivo: js/ui/changelog_14outubro.js
// BLOCO 05 — Histórico cronológico completo
// ==============================================================================

(function (window) {
  'use strict';

  const CHANGELOG_DAYS = [
    {
      date: '14 de Outubro de 2026',
      version: 'v2.8.0 — Hotfix Geral de Abas, Simulador de Vida, Cotas Realistas & Fotos',
      badge: 'HOJE · 14 DE OUTUBRO',
      badgeColor: '#10b981',
      items: [
        '🛠️ [CORREÇÃO CRÍTICA] Resolvido o erro `(state.bankLoans || []).reduce is not a function` que bloqueava a abertura da aba 🏢 Escritório.',
        '🛠️ [CORREÇÃO CRÍTICA] Resolvido o erro `(state.bankLoans || []).some is not a function` que bloqueava a abertura da aba 🏗️ Estrutura & Estádio.',
        '🛠️ [CORREÇÃO VISUAL] Removido o vazamento de código `WES\';}" />`, `BRA\';}" />`, `SAM\';}" />` e `COR\';}" />` ao lado dos escudos na Central, Calendário, Topo, Barra Lateral e Mercado.',
        '🛠️ [CORREÇÃO VISUAL] Removido o texto `BRA />` e `COR />` que vazava no canto superior direito dos mini-cards na aba 📋 Meu time & Tática.',
        '🏰 [SIMULADOR DE VIDA DO TREINADOR] Compra de Imóveis (Studio, Casa em Condomínio, Cobertura, Mansão com Heliponto, Ilha Particular), Empresas (Academia Fitness, Clínica de Fisioterapia, Barbearia VIP, Escolinha, Loja Esportiva, Restaurante, Rede de Hotéis) e Garagem de Luxo (SUV Blindado, Superesportivo e Jato Particular).',
        '🏛️ [COTAS REALISTAS & DIVIDENDOS NAS DESPESAS] Preço das cotas ajustado pelo Valuation real do clube (R$ 220 mil a R$ 32 milhões por 1%), compra fracionada (0,25% e 1%) e pagamento obrigatório de Dividendos aos Acionistas lançado nas despesas mensais do clube.',
        '📸 [FOTOS REAIS DOS JOGADORES] Integração automática de fotos recortadas para todo o elenco do Corinthians e demais clubes (titulares e reservas).'
      ]
    },
    {
      date: '13 de Outubro de 2026',
      version: 'v2.7.0 — Organização Mundial de Ligas, Pirâmide Real & Save Isolado',
      badge: 'LIGAS & SAVE INDIVIDUAL',
      badgeColor: '#8b5cf6',
      items: [
        '⚽ [CAMPEONATOS 100% FIÉIS] Divisões exatas no Brasil (Séries A, B, C, D e Estaduais), América do Sul, Europa e Ásia.',
        '🔄 [PROMOÇÃO E REBAIXAMENTO] Subidas, descidas, playoffs e vagas continentais operando 100% isolados no save individual de cada utilizador.',
        '🛡️ [RESTAURO DE ESCUDOS] Algoritmo Flood-Fill que preserva o branco interno dos escudos oficiais.'
      ]
    },
    {
      date: '12 de Outubro de 2026',
      version: 'v2.6.0 — Auxiliar Técnico, Estrelas em 3 Camadas & Tríplice Confiança',
      badge: 'ELENCO & GESTÃO',
      badgeColor: '#3b82f6',
      items: [
        '⭐ [ESTRELAS EM 3 CAMADAS] Nível Atual (Dourado), Potencial Garantido (Violeta) e Teto Máximo (Lilás Transparente).',
        '🧠 [AUXILIAR TÉCNICO] Botão "Trocas Sugeridas" para rodar atletas fatigados, suspensos ou lesionados.',
        '📊 [TRÍPLICE CONFIANÇA] Barras independentes de Diretoria, Torcida e Elenco.'
      ]
    },
    {
      date: '10 de Outubro de 2026',
      version: 'v2.5.0 — Motor Ao Vivo 2.5D/3D, Área Técnica & Disputa de Pênaltis',
      badge: 'PARTIDA AO VIVO',
      badgeColor: '#f59e0b',
      items: [
        '🏟️ [ÁREA TÉCNICA] Bancos de reservas no gramado com o boneco `TÉC. AQUINO` na beira do campo.',
        '⏩ [CONTROLO DE VELOCIDADE] Velocidades 1x, 20x e 40x + saltos rápidos (+1 MIN, INTERVALO e IR AO FIM).',
        '🥅 [PÊNALTIS INTERATIVOS] Disputa de pênaltis manual ou simulada nas decisões de mata-mata.'
      ]
    },
    {
      date: '08 de Outubro de 2026',
      version: 'v2.4.0 — Economia Pessoal do Treinador & Primeiros Negócios',
      badge: 'CARREIRA',
      badgeColor: '#ec4899',
      items: [
        '💼 [PATRIMÓNIO SEPARADO] Conta bancária pessoal do treinador independente do caixa do clube.',
        '🏪 [NEGÓCIOS PRÓPRIOS] Sistema inicial de investimentos extracampo com balanço todo dia 1º.'
      ]
    },
    {
      date: '05 de Outubro de 2026',
      version: 'v2.3.0 — Empréstimos Bancários, Cláusula de Revenda & Filtros do Mercado',
      badge: 'FINANÇAS & MERCADO',
      badgeColor: '#14b8a6',
      items: [
        '🏦 [SISTEMA BANCÁRIO] Empréstimos com parcelas mensais e antecipação com abatimento de juros.',
        '🤝 [CLÁUSULA DE REVENDA %] Percentagem de venda futura e expiração automática de propostas pendentes.'
      ]
    },
    {
      date: '02 de Outubro de 2026',
      version: 'v2.2.0 — Motor Tático de 4 Fases & Áudio de Estádio',
      badge: 'FUNDAÇÃO',
      badgeColor: '#6366f1',
      items: [
        '📋 [4 FASES TÁTICAS] Construção, progressão, transição defensiva e finalização com IA de goleiros aprimorada.',
        '🔊 [SOM AMBIENTE] Efeitos de jogo (`sounds/sfx`) e torcida (`sounds/crowd`).'
      ]
    }
  ];

  function renderChangelogMarkup() {
    return `
      <div class="hero">
        <div>
          <h1>📢 Novidades & Correções Oficiais</h1>
          <div class="muted">Histórico cronológico detalhado dia a dia — AFM MANAGER 2027</div>
        </div>
        <span class="pill good">Atualizado em 14 de Outubro de 2026</span>
      </div>

      <div style="display:flex;flex-direction:column;gap:18px;margin-top:16px;">
        ${CHANGELOG_DAYS.map((day) => `
          <div class="card" style="padding:18px;border-radius:14px;background:#111827;border:1px solid rgba(255,255,255,0.08);">
            <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;margin-bottom:12px;border-bottom:1px solid rgba(255,255,255,0.08);padding-bottom:10px;">
              <div>
                <span class="pill" style="background:${day.badgeColor};color:#fff;font-weight:900;font-size:10px;text-transform:uppercase;">${day.badge}</span>
                <h3 style="margin:6px 0 2px 0;font-size:16px;font-weight:900;color:#fff;">${day.date}</h3>
                <div style="font-size:11px;color:#94a3b8;font-weight:700;">${day.version}</div>
              </div>
            </div>
            <ul style="margin:0;padding-left:18px;display:flex;flex-direction:column;gap:8px;">
              ${day.items.map((it) => `
                <li style="font-size:13px;color:rgba(255,255,255,0.85);line-height:1.5;">${it}</li>
              `).join('')}
            </ul>
          </div>
        `).join('')}
      </div>
    `;
  }

  window.AFM_Changelog14Out = {
    days: CHANGELOG_DAYS,
    renderChangelogMarkup: renderChangelogMarkup
  };
})(typeof window !== 'undefined' ? window : global);
