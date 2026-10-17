const fs = require('fs');
const code = fs.readFileSync('js/game.js', 'utf8');

// Find occurrences of state.balance +=
const balAddMatches = [...code.matchAll(/state\.balance\s*\+=\s*([^;]+);/g)];
console.log('state.balance additions count:', balAddMatches.length);
balAddMatches.forEach(m => {
  if (m[1].toLowerCase().includes('prize') || m[1].toLowerCase().includes('premio') || m[1].toLowerCase().includes('award') || m[1].toLowerCase().includes('copa') || m[1].toLowerCase().includes('champ') || m[1].includes('00000')) {
    console.log('Balance addition:', m[0]);
  }
});

// Search for endSeason or seasonTransition where prizes are distributed
const endSeasonIdx = code.indexOf('function endSeason(');
if (endSeasonIdx === -1) {
  const transIdx = code.indexOf('function transitionSeason(');
  console.log('transitionSeason at', transIdx);
  if (transIdx !== -1) console.log(code.substring(transIdx, transIdx + 1000));
} else {
  console.log('endSeason at', endSeasonIdx);
  console.log(code.substring(endSeasonIdx, endSeasonIdx + 1000));
}
