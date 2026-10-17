const fs = require('fs');
let code = fs.readFileSync('js/competitions.js', 'utf8');
const target = "'ksa-1', 'jpn-1', 'kor-1', 'chn-1', 'qat-1', 'uae-1'";
const repl = "'usa-1', 'ksa-1', 'jpn-1', 'kor-1', 'chn-1', 'qat-1', 'uae-1'";
code = code.replace(target, repl);
fs.writeFileSync('js/competitions.js', code, 'utf8');
console.log('Replaced successfully. Count of usa-1 now:', (code.match(/usa-1/g) || []).length);
