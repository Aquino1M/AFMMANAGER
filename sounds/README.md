# 🏟️ Sistema de Áudio & Cantos de Torcida — AFM Manager 2027

Este diretório contém a infraestrutura sonora oficial do AFM Manager, operando em **canais desacoplados**:
1. **Canal SFX (`sounds/sfx/`)**: Efeitos do motor de partida (apitos de arbitragem, bola na trave, explosão de gol e reações).
2. **Canal Ambient (`sounds/crowd/`)**: Áudios reais de estádio e cantos das torcidas por liga e clube.

---

## 📁 Estrutura de Diretórios

```
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
```

---

## 🛡️ Fallback Automático & Síntese Procedural (Zero Travamentos)

O motor de áudio (`js/core/audio_engine.js` - `window.AFMAudioManager`) opera com **resiliência tripla**:
1. Se o clube mandante possuir arquivo específico em `sounds/crowd/<liga>/<clube>.mp3`, o áudio tocará em loop com volume calibrado.
2. Se o arquivo do clube não existir, o sistema toca `sounds/crowd/ambient_default.mp3`.
3. Se o usuário estiver executando o jogo sem arquivos locais baixados, a **Web Audio API** sintetiza em tempo real apitos precisos (Fox 40), ruídos de estádio e impactos metálicos proceduralmente, sem gerar nenhum erro de console!

---

## 🔗 Onde Baixar Sons Livres de Royalties?

Consulte o arquivo `sounds_manifest.json` para a lista de termos e links recomendados:
- **Freesound.org**: Efeitos sonoros gratuitos com licença CC0 / Creative Commons.
- **Wikimedia Commons**: Gravações históricas de cantos de futebol de domínio público.
- **YouTube Audio Library**: Efeitos e multidões sob licença aberta.
