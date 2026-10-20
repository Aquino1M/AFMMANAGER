with open("js/game.js", "rb") as f:
    raw = f.read()

content = raw.decode("utf-8")

old_code = """function playWhistleSound(){
  const ctx = getLiveAudioCtx();
  if(!ctx || !liveMatchState || liveMatchState.soundMuted) return;
  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(2400, ctx.currentTime);
    osc.frequency.setValueAtTime(2700, ctx.currentTime + 0.08);
    osc.frequency.setValueAtTime(2350, ctx.currentTime + 0.16);
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.32);
    osc.connect(gain); gain.connect(ctx.destination);
    osc.start(); osc.stop(ctx.currentTime + 0.32);
  } catch(e){ window.AFMErrorLog?.recordHandled(e, 'liveMatch.playWhistle'); }
}
function playKickSound(){
  const ctx = getLiveAudioCtx();
  if(!ctx || !liveMatchState || liveMatchState.soundMuted) return;
  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(160, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.08);
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.09);
    osc.connect(gain); gain.connect(ctx.destination);
    osc.start(); osc.stop(ctx.currentTime + 0.09);
  } catch(e){ window.AFMErrorLog?.recordHandled(e, 'liveMatch.playKick'); }
}
function playCheerSound(){
  const ctx = getLiveAudioCtx();
  if(!ctx || !liveMatchState || liveMatchState.soundMuted) return;
  try {
    const bufSize = Math.floor(ctx.sampleRate * 1.6);
    const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for(let i=0; i<bufSize; i++) d[i] = (Math.random()*2 - 1) * Math.exp(-i / (bufSize * 0.7));
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 550;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.5);
    src.connect(filter); filter.connect(gain); gain.connect(ctx.destination);
    src.start();
  } catch(e){ window.AFMErrorLog?.recordHandled(e, 'liveMatch.playCheer'); }
}"""

new_code = """function playWhistleSound(sfxKey = 'whistle_start'){
  if(liveMatchState && liveMatchState.soundMuted) return;
  if(window.afmAudio && typeof window.afmAudio.playSFX === 'function'){
    window.afmAudio.playSFX(sfxKey);
    return;
  }
  const ctx = getLiveAudioCtx();
  if(!ctx) return;
  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(2400, ctx.currentTime);
    osc.frequency.setValueAtTime(2700, ctx.currentTime + 0.08);
    osc.frequency.setValueAtTime(2350, ctx.currentTime + 0.16);
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.32);
    osc.connect(gain); gain.connect(ctx.destination);
    osc.start(); osc.stop(ctx.currentTime + 0.32);
  } catch(e){ window.AFMErrorLog?.recordHandled(e, 'liveMatch.playWhistle'); }
}
function playKickSound(){
  if(liveMatchState && liveMatchState.soundMuted) return;
  const ctx = getLiveAudioCtx();
  if(!ctx) return;
  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(160, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.08);
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.09);
    osc.connect(gain); gain.connect(ctx.destination);
    osc.start(); osc.stop(ctx.currentTime + 0.09);
  } catch(e){ window.AFMErrorLog?.recordHandled(e, 'liveMatch.playKick'); }
}
function playCheerSound(){
  if(liveMatchState && liveMatchState.soundMuted) return;
  if(window.afmAudio && typeof window.afmAudio.playSFX === 'function'){
    window.afmAudio.playSFX('goal_celebration');
    if(typeof window.afmAudio.boostCrowdCheer === 'function'){
      window.afmAudio.boostCrowdCheer(4.5);
    }
    return;
  }
  const ctx = getLiveAudioCtx();
  if(!ctx) return;
  try {
    const bufSize = Math.floor(ctx.sampleRate * 1.6);
    const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for(let i=0; i<bufSize; i++) d[i] = (Math.random()*2 - 1) * Math.exp(-i / (bufSize * 0.7));
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 550;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.5);
    src.connect(filter); filter.connect(gain); gain.connect(ctx.destination);
    src.start();
  } catch(e){ window.AFMErrorLog?.recordHandled(e, 'liveMatch.playCheer'); }
}"""

if old_code in content:
    content = content.replace(old_code, new_code, 1)
    with open("js/game.js", "wb") as f:
        f.write(content.encode("utf-8"))
    print("Replaced successfully (LF)!")
elif old_code.replace("\n", "\r\n") in content:
    content = content.replace(old_code.replace("\n", "\r\n"), new_code.replace("\n", "\r\n"), 1)
    with open("js/game.js", "wb") as f:
        f.write(content.encode("utf-8"))
    print("Replaced successfully (CRLF)!")
else:
    print("Old code not found! Checking partial match...")
    if "function playWhistleSound()" in content:
        print("Found function playWhistleSound()")
    else:
        print("NOT found function playWhistleSound()")
