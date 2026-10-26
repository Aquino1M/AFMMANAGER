# AFM Manager — instruções do projeto

## Arquitetura e compatibilidade

- Aplicação local-first em HTML, CSS e JavaScript ES2022, sem framework ou bundler. Preserve a interface em português do Brasil e reutilize `js/core/`, os módulos e catálogos existentes.
- `js/game.js` coordena carreira e interface. Não crie uma segunda fonte de verdade para estado, elenco ou competições.
- Saves antigos devem continuar carregáveis. Migrações devem ser aditivas, idempotentes e compatíveis; preservar salários/contratos de carreiras existentes e aplicar novos modelos somente a carreiras elegíveis.
- Não reverta alterações locais nem execute `reset`, `clean`, checkout forçado, rebase ou sincronização destrutiva.

## Invariantes de jogo

- Processe partidas pendentes do clube em ordem cronológica, incluindo estaduais, copas, torneios continentais e liga nacional. Não pule compromisso pendente; partidas no mesmo dia precisam ser resolvidas antes de avançar a data.
- Use `resolveCalendarMatchResult(match, state)` para identificar resultados já registrados e impedir que uma partida concluída seja iniciada ou contabilizada novamente. A UI do calendário deve refletir o resultado persistido.
- Resultados de competições adicionais alteram apenas seu próprio estado, classificação e rodada; não devem avançar nem sobrescrever a liga principal (`state.teams`). Mantenha a inscrição estadual de clubes de todas as divisões nacionais.
- Promoção, rebaixamento, vagas, participantes e reparos de ligas devem alterar os dados da carreira (`state.competitionTeams`), nunca catálogos globais compartilhados. Carreiras e usuários diferentes devem permanecer isolados.
- Regra inviolável de promoção, rebaixamento e grupos: Qualquer clube que conquistar acesso a uma divisão ou competição (seja o clube do usuário ou IA, vindo de estadual para Série D, ou entre Séries D, C, B, A) DEVE obrigatoriamente constar no grupo/tabela da competição de destino e ser removido da divisão anterior. Clubes rebaixados DEVEM sair do seu grupo/divisão anterior e aparecer na divisão inferior. As tabelas, grupos e calendários de TODAS as competições (`seasonPage`, `getSeriesDGroupStandings`, `getNationalCompetitionStandings`, `getStateCompData`, continentais, etc.) devem consumir os elencos e times ativos do save (`state.teams`, `state.competitionTeams`), JAMAIS catálogos estáticos imutáveis.
- Regra inviolável de títulos e Museu: Todo título conquistado no save (campeonatos estaduais como o Candango, copas nacionais, divisões do Brasileirão, torneios continentais, mundiais ou copas de base) DEVE ser imediatamente adicionado a `state.titles` e exibido no Museu do Clube (tanto na vitrine/estante quanto na galeria de conquistas no comando do treinador). Nenhuma conquista pode ser omitida ou perdida na virada de temporada.
- Regra inviolável de histórico unificado (Hall da Fama, Campeões do Mundo e Museu): Todos os módulos de títulos e histórico devem consultar e ser sincronizados pelo serviço único centralizado `AFM_TitlesAndHistoryService`. Os registros do Hall da Fama (`state.seasonHistory`), Campeões do Mundo (`state.worldChampionHistory`) e Museu (`state.titles`) devem permanecer 100% alinhados, sem campeões conflitantes, sem exibir múltiplos times concatenados por vírgula em competições como a Série D, e classificando sempre acessos estaduais ou nacionais como 'Acesso' (nunca 'Rebaixamento').
- Preserve os invariantes das coleções: elenco/escalação válidos e sem duplicatas; histórico sem partidas duplicadas; classificação consistente (`J = V + E + D`, `SG = GP - GC`, `P = 3V + E`); finanças e confiança consistentes entre competições. Limite de persistência: `news` 50, `marketWorldFeed` 30 e `seasonHistory` 20 registros.
- Não inicie partidas com menos de 11 atletas válidos por lado. Partidas ao vivo devem manter placar, eventos e animação coerentes; valide comportamento visual no navegador ao alterar o motor de partida.
- Depois de mudanças críticas de estado, persista a carreira e re-renderize a interface sem engolir falhas silenciosamente. Botões de calendário, pré-temporada e janela de transferências precisam manter seus binds funcionais após renderização.

## Saves, login e segurança

- Regra inviolável de sincronia multiplataforma (PC, Mobile & Supabase): O save do jogo executado no PC, no celular (Mobile) e na nuvem Supabase (`afm_saves`) deve manter estrita paridade 1:1. A sincronização e resolução de conflitos deve ser governada obrigatoriamente pela regra do maior timestamp (`updated_at` / `timestamp`). Se o save da nuvem for mais recente que o save local (ex: jogador avançou a carreira no PC e depois abriu no celular), o save local DEVE ser atualizado automaticamente com os dados da nuvem. Se o save local for mais recente (ex: jogador continuou jogando no celular), os dados devem ser enviados via upsert para a nuvem. Toda operação de salvamento de slot (`saveSlotToAccount`, `#btnSaveCurrentSlotNow`, `save()`) deve persistir no cache local e propagar imediatamente para o Supabase, exibindo feedback visual de status (`☁️ Nuvem Sincronizada`) e disponibilizando sincronização manual instantânea (`🔄 Sincronizar Nuvem (PC ⇄ Celular)`). Nunca sobrescreva um save mais novo com um save mais antigo.
- A persistência local é essencial para uso offline; a sincronização Supabase é condicional à configuração/disponibilidade. Não prometa sincronização remota quando ela não foi confirmada.
- O login próprio baseado em `afm_users` não é Supabase Auth. Não trate um nome de usuário salvo no navegador como identidade remota confiável.
- `supabase/schema.sql` atualmente define políticas amplamente públicas para `afm_users` e `afm_saves`; não considere os dados de conta/saves protegidos por proprietário enquanto isso não for corrigido e verificado. Nunca exponha credenciais de serviço. Alterações de schema/RLS exigem migração compatível e validação separada.
- Trate saves, datas, resultados e entradas importadas como não confiáveis. Valide os dados e escape conteúdo dinâmico inserido em HTML com `esc()` ou mecanismo equivalente.
- Arredonde valores financeiros com `Math.round()` e preserve os limites de conta e slots de save existentes.

## Desenvolvimento e verificação

- Antes de alterar/remover código compartilhado, confirme referências e chamadores, investigue a causa raiz e adicione testes para a regressão quando apropriado.
- Rode testes e verificações relevantes, relatando comandos e resultados reais. `npm run build` apenas imprime `Static build ready`; não é compilação nem teste.
- Não declare funcionalidade concluída com base apenas em UI/dados representados. Informe o que foi e o que não foi verificado.
- Mantenha `CHANGELOG.md` como histórico; não reescreva releases anteriores para ocultar limitações.

## Criação de jogos, modelagem 3D, shaders e UI/UX

- Trate Three.js, WebGL e shaders como cidadãos de primeira classe na renderização visual do jogo (como maquetes 3D de estádios, campos e animações). Mantenha sempre o ciclo de vida limpo com descarte obrigatório de geometrias, materiais e texturas (`dispose()`) e cancelamento de loops de animação (`cancelAnimationFrame`).
- Regra crítica inviolável de renderização 3D e viewport dos estádios: O canvas do Three.js (`#afmStadiumLowPolyCanvas` e `#afmViewerModalLowPolyCanvas`) em `openStadiumModal()` e `openStadium3DViewerModal()` NUNCA pode ficar preto. Todas as variáveis de estado e prévia (`stadiumCustomizationPreview`, etc.) devem ser estritamente declaradas e protegidas contra `ReferenceError`. O descarte de instâncias (`dispose()`) deve preservar a integridade do contexto WebGL do navegador (`renderer.dispose()`), NUNCA chamando `forceContextLoss()` ou `loseContext()` em fluxos de alternância de abas/telas, garantindo que a maquete 3D com gramado, arquibancadas, iluminação e setores apareça de forma instantânea e contínua em qualquer aba ('Resumo', 'Melhorias', 'Ampliação / Setores & Obras', 'Arena', 'Gramado & Eventos').
- Modelagem 3D e assets gráficos devem priorizar arquivos `.glb`/`.gltf` binários otimizados, estética Low-Poly estilizada e consistente, além de ícones, mini-mapas e distintivos em SVG vetorial leve e escalável.
- Interfaces e HUDs de jogo devem seguir o padrão estético dos melhores simuladores (EA FC / FM): tipografia legível e moderna, paletas cromáticas coordenadas, efeitos neon sutis, glassmorphism com backdrop blur, e taxa de quadros estável (60+ FPS) sem adição de dependências pesadas desnecessárias.

