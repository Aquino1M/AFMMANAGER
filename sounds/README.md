# Áudio

`js/core/audio_engine.js` gerencia efeitos e ambiente de torcida. O motor tenta o arquivo específico do clube, depois `sounds/crowd/ambient_default.mp3` e, se ambos falharem e houver suporte à Web Audio API, usa um ambiente procedural.

O manifesto `sounds/sounds_manifest.json` registra efeitos e referências para obtenção de áudio. Confira a licença de cada arquivo antes de distribuí-lo; links de busca no manifesto não concedem direitos de uso.
