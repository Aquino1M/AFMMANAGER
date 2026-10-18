const https = require('https');
const fs = require('fs');

https.get('https://www.transfermarkt.pt/estevao/profil/spieler/1056993', {
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  }
}, res => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    const match = body.match(/https:\/\/img\.a\.transfermarkt\.technology\/portrait\/[^\s"'>]+1056993[^\s"'>]+/);
    if (match) {
      const imgUrl = match[0].replace(/&amp;/g, '&');
      console.log('Downloading Estêvão photo from:', imgUrl);
      const file = fs.createWriteStream('img/players/tm_1056993.jpg');
      https.get(imgUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } }, imgRes => {
        imgRes.pipe(file);
        file.on('finish', () => {
          file.close();
          console.log('Successfully saved Estêvão to img/players/tm_1056993.jpg');
        });
      });
    } else {
      console.log('No direct portrait match found in HTML');
    }
  });
});
