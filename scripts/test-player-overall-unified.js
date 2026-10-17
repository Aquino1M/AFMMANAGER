const assert = require('assert');

// Simulate playerOverall logic as implemented in game.js
function playerOverall(p){
  if (!p) return 60;
  let val = 60;
  const direct = Math.round(Number(p?.ovr ?? p?.overall ?? 0));
  const pes = +p?.pes || 0;
  const fc = +p?.fc || 0;
  if (pes > 0 && fc > 0) val = Math.round(pes * 0.7 + fc * 0.3);
  else if (pes > 0) val = pes;
  else if (fc > 0) val = fc;
  else if (direct > 0) val = direct;
  else val = 60;
  if (direct > val) val = direct;
  val = Math.max(40, Math.min(99, Math.round(val)));
  p.ovr = val;
  p.overall = val;
  if (!p.fc) p.fc = val;
  if (!p.pes) p.pes = val;
  return val;
}

function sanitizeWorldGeneratedPlayers(st){
  if(!st) return;
  const pools = [st.worldGenerated, st.worldRegens];
  pools.forEach(pool => {
    if(!Array.isArray(pool)) return;
    pool.forEach(p => {
      if(!p) return;
      const age = Number(p.age) || 22;
      const isGen = String(p.id || '').startsWith('gen-') || String(p.marketKey || '').startsWith('gen:') || pool === st.worldGenerated;
      const curOvr = playerOverall(p);
      if(isGen && curOvr > 78){
        const maxOvr = age <= 21 ? 72 : 78;
        p.fc = Math.min(p.fc || maxOvr, maxOvr);
        p.pes = Math.min(p.pes || maxOvr, maxOvr);
        p.ovr = maxOvr;
        p.overall = maxOvr;
        if(p.potential && p.potential > 84) p.potential = Math.min(84, maxOvr + (age <= 21 ? 8 : 2));
      }
    });
  });
}

console.log('Testing unified playerOverall...');

// 1. Direct ovr and overall are identical
const p1 = { name: 'Player A', ovr: 75 };
assert.strictEqual(playerOverall(p1), 75);
assert.strictEqual(p1.overall, 75);
assert.strictEqual(p1.ovr, 75);

// 2. PES and FC weighting (pes * 0.7 + fc * 0.3)
const p2 = { name: 'Player B', pes: 80, fc: 70 };
// 80 * 0.7 = 56, 70 * 0.3 = 21 -> 77
assert.strictEqual(playerOverall(p2), 77);
assert.strictEqual(p2.ovr, 77);
assert.strictEqual(p2.overall, 77);

// 3. Direct overrides if higher (progressed athlete)
const p3 = { name: 'Player C', pes: 70, fc: 70, ovr: 75 };
assert.strictEqual(playerOverall(p3), 75);
assert.strictEqual(p3.overall, 75);
assert.strictEqual(p3.ovr, 75);

// 4. Sanitize world generated filler players
const mockState = {
  worldGenerated: [
    { id: 'gen-club-1', name: 'Super Regen', age: 19, ovr: 91, fc: 91, pes: 91, potential: 95 },
    { id: 'gen-club-2', name: 'Old Regen', age: 26, ovr: 88, fc: 88, pes: 88, potential: 90 },
    { id: 'gen-club-3', name: 'Normal Regen', age: 24, ovr: 68, fc: 68, pes: 68, potential: 72 }
  ]
};
sanitizeWorldGeneratedPlayers(mockState);
assert.strictEqual(mockState.worldGenerated[0].ovr, 72, 'Young gen player should be capped at 72');
assert.strictEqual(mockState.worldGenerated[0].overall, 72);
assert.strictEqual(mockState.worldGenerated[0].potential <= 84, true);

assert.strictEqual(mockState.worldGenerated[1].ovr, 78, 'Prime gen player should be capped at 78');
assert.strictEqual(mockState.worldGenerated[1].overall, 78);

assert.strictEqual(mockState.worldGenerated[2].ovr, 68, 'Normal gen player should not be affected');

console.log('ALL TESTS PASSED SUCCESSFULLY! ✅');
