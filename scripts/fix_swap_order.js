const fs = require('fs');

let code = fs.readFileSync('js/game.js', 'utf8');

const targetStr = "player.number = num;";
const targetIdx = code.indexOf("function setPlayerShirtNumber");
if (targetIdx !== -1) {
  const occIdx = code.indexOf("const occupyingPlayer = targetState.squad.find", targetIdx);
  const closingBraceIdx = code.indexOf("player.number = num;", occIdx);
  
  if (occIdx !== -1 && closingBraceIdx !== -1) {
    // Vamos substituir a ordem para que player.number = num seja definido antes de validar occupyingPlayer
    const sliceBefore = code.slice(0, occIdx);
    const sliceOcc = "const occupyingPlayer = targetState.squad.find(p => p && p !== player && p.number === num);\r\n  player.number = num;\r\n  if(occupyingPlayer){\r\n    occupyingPlayer.number = oldNum || 99;\r\n    const occupiedSet = new Set(targetState.squad.filter(p => p && p !== occupyingPlayer).map(p => p.number));\r\n    if(occupiedSet.has(occupyingPlayer.number)){\r\n      for(let n = 1; n <= 99; n++){\r\n        if(!occupiedSet.has(n)){\r\n          occupyingPlayer.number = n;\r\n          break;\r\n        }\r\n      }\r\n    }\r\n  }";
    const afterIdx = closingBraceIdx + "player.number = num;".length;
    const sliceAfter = code.slice(afterIdx);

    code = sliceBefore + sliceOcc + sliceAfter;
    fs.writeFileSync('js/game.js', code, 'utf8');
    console.log('Successfully reordered shirt swap assignment!');
  }
}
