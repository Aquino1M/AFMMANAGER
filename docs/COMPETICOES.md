# Competições: estado do projeto

Este documento descreve limites conhecidos da implementação; uma tela ou fixture exibida não comprova integração completa ao motor de partidas.

## Estado de integração

- A liga principal usa `state.schedule`, `state.teams` e `state.round` da competição selecionada ao criar a carreira.
- A Copa do Brasil ainda mantém listas e um simulador de calendário legado em `js/game.js`; não presuma que todas as fases formam uma chave totalmente integrada ao motor principal.
- Libertadores e Sul-Americana usam participantes e fixtures de grupos estáticos em `data/continental_2026.js`. Resultados de grupos são salvos na carreira e atualizam a classificação, mas mata-mata, vagas e participantes dinâmicos de temporadas seguintes ainda não estão integrados por completo.
- Não descreva Mundial de Clubes ou promoção/rebaixamento internacional como dinâmicos sem implementação e testes confirmatórios.

## Fontes de regulamento

Para regras e participantes atuais, consulte as publicações oficiais da CBF e os manuais da CONMEBOL da temporada correspondente. Regulamentos mudam; fixtures estáticos não comprovam classificação oficial. Evite links profundos de temporada sem validar que continuam ativos.

## Critério de integração

Considere uma competição integrada somente quando calendário, partida ao vivo/simulada, persistência do resultado, tabela ou chaveamento, avanço de fase, título e save usam estado consistente. Teste partidas do usuário e dos demais clubes, empates e pênaltis quando aplicáveis, recarga do save e transição de temporada.
