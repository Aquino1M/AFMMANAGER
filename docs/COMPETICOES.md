# Competições: estado do projeto

Este arquivo registra o que o código atualmente modela. A presença de uma regra ou confronto na tela não significa que a competição esteja conectada ao motor de partidas.

## Ligação com o motor

- O motor principal usa `state.schedule`, `state.teams` e `state.round` para a competição escolhida ao criar a carreira.
- `Copa do Brasil` tem listas e simulador de calendário legado em `js/game.js`; seus resultados ainda não formam uma chave completa integrada ao motor principal.
- Libertadores e Sul-Americana ainda usam participantes e fixtures de grupos fixos de 2026 em `data/continental_2026.js`. Os placares dos jogos de grupo agora são salvos na carreira e atualizam uma tabela de classificação; partidas vencidas ao avançar o calendário são simuladas. Mata-mata, vagas da temporada seguinte e novos participantes por classificação ainda não estão integrados.
- Mundial de Clubes e acessos/rebaixamentos internacionais não devem ser descritos como sistemas dinâmicos até serem implementados e verificados.

## Referência das regras

- **Copa do Brasil 2026:** 126 clubes e nove fases. As fases 1–4 e a final são jogos únicos; as fases 5–8 são ida e volta. Os 20 clubes da Série A entram na 5ª fase; quatro campeões entram na 3ª. Consulte o regulamento oficial da [CBF](https://www.cbf.com.br/futebol-brasileiro/noticias/undefined/ponte-preta-x-ituano/cbf-divulga-tabela-basica-plano-geral-de-acoes-e-regulamento-especifico-da-copa-do-brasil-2026).
- **Libertadores e Sul-Americana:** use os manuais CONMEBOL da temporada correspondente. Participantes, acesso e chaveamento variam por temporada; não reutilize fixtures estáticos como se fossem classificação oficial.

## Critério para declarar uma competição funcional

Uma competição só está integrada quando calendário, início de partida ao vivo/simulada, persistência de resultados, classificação ou chaveamento, avanço de fase, campeão/título e save da carreira usam o mesmo estado. Teste jogos de usuário, simulação dos demais confrontos, empate e pênaltis quando aplicável, carregamento do save e virada de temporada.
