# Áudio

`js/core/audio_engine.js` gerencia efeitos sonoros e ambiente de torcida. O motor tenta o arquivo específico do clube, depois `sounds/crowd/ambient_default.mp3` e, se ambos falharem, usa áudio procedural quando a Web Audio API estiver disponível.

`sounds/sounds_manifest.json` lista efeitos e referências de obtenção. Verifique a licença de cada arquivo antes de distribuí-lo; links de busca não concedem direitos de uso.
