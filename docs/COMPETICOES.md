# Competições: estado do projeto

Este documento descreve limites conhecidos da implementação; uma tela ou fixture exibida não comprova integração completa ao motor de partidas.

## Estado de integração

- A liga principal usa `state.schedule`, `state.teams` e `state.round` da competição selecionada ao criar a carreira.
- A Copa do Brasil ainda mantém listas e um simulador de calendário legado em `js/game.js`; não presuma que todas as fases formam uma chave totalmente integrada ao motor principal.
- Libertadores e Sul-Americana usam participantes e fixtures de grupos estáticos em `data/continental_2026.js`. Resultados de grupos são salvos na carreira e atualizam a classificação, mas mata-mata, vagas e participantes dinâmicos de temporadas seguintes ainda não estão integrados por completo.
- Não descreva Mundial de Clubes ou promoção/rebaixamento internacional como dinâmicos sem implementação e testes confirmatórios.

## Fontes de regulamento

Para a Copa do Brasil, use o regulamento oficial da [CBF](https://www.cbf.com.br/futebol-brasileiro/noticias/undefined/ponte-preta-x-ituano/cbf-divulga-tabela-basica-plano-geral-de-acoes-e-regulamento-especifico-da-copa-do-brasil-2026) e reconfirme os dados a cada temporada. Para Libertadores e Sul-Americana, consulte os manuais oficiais da CONMEBOL da temporada correspondente. Participantes, acesso e chaveamento mudam; fixtures estáticos não são prova de classificação oficial.

## Critério de integração

Considere uma competição integrada somente quando calendário, partida ao vivo/simulada, persistência do resultado, tabela ou chaveamento, avanço de fase, título e save usam estado consistente. Teste partidas do usuário e dos demais clubes, empates e pênaltis quando aplicáveis, recarga do save e transição de temporada.
