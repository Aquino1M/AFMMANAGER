const fs = require('fs');
let code = fs.readFileSync('js/game.js', 'utf8');

const targetLines = [
  "if(typeof window !== 'undefined'){",
  "  window.generateSponsorOffers = generateSponsorOffers;",
  "  window.ensureClubSponsors = ensureClubSponsors;",
  "}",
  " }",
  "if(typeof window !== 'undefined') window.ensureClubSponsors = ensureClubSponsors;"
];

const replacementLines = [
  "if(typeof window !== 'undefined'){",
  "  window.generateSponsorOffers = generateSponsorOffers;",
  "  window.ensureClubSponsors = ensureClubSponsors;",
  "}"
];

const targetCRLF = targetLines.join('\r\n');
const targetLF = targetLines.join('\n');
const replCRLF = replacementLines.join('\r\n');
const replLF = replacementLines.join('\n');

if (code.includes(targetCRLF)) {
  code = code.replace(targetCRLF, replCRLF);
  fs.writeFileSync('js/game.js', code, 'utf8');
  console.log('Fixed CRLF extra bracket in js/game.js');
} else if (code.includes(targetLF)) {
  code = code.replace(targetLF, replLF);
  fs.writeFileSync('js/game.js', code, 'utf8');
  console.log('Fixed LF extra bracket in js/game.js');
} else {
  console.log('Pattern not matched directly, checking normalized line replace');
  const lines = code.split(/\r?\n/);
  for (let i = 9580; i < 9620; i++) {
    if (lines[i] && lines[i].trim() === '}' && lines[i+1] && lines[i+1].includes('window.ensureClubSponsors') && lines[i+2] && lines[i+2].trim() === '}') {
      console.log('Found line at:', i);
    }
  }
}
