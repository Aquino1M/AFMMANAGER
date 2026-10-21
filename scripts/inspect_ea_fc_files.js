const fs = require('fs');

const files = [
  'c:\\Users\\Aquino\\Downloads\\EA SPORTS FC™ 27 - Site oficial - Electronic Arts.mhtml',
  'c:\\Users\\Aquino\\Downloads\\Recursos de EA SPORTS FC™ 27.mhtml',
  'c:\\Users\\Aquino\\Downloads\\Receba as últimas notícias, atualizações e notas de patch para EA SPORTS FC™ 27 - Electronic Arts.mhtml'
];

files.forEach(file => {
  console.log('\n=============================================');
  console.log('FILE:', file);
  try {
    const raw = fs.readFileSync(file, 'utf8');
    console.log('Size:', (raw.length / 1024 / 1024).toFixed(2), 'MB');
    
    // Extract titles and headings
    const titleMatch = raw.match(/<title>([\s\S]*?)<\/title>/i);
    if (titleMatch) console.log('TITLE:', titleMatch[1].trim());

    const h1s = (raw.match(/<h1[^>]*>([\s\S]*?)<\/h1>/gi) || []).map(h => h.replace(/<[^>]+>/g, '').trim().replace(/=[\r\n]+/g, ''));
    console.log('H1s:', h1s.slice(0, 5));

    const h2s = (raw.match(/<h2[^>]*>([\s\S]*?)<\/h2>/gi) || []).map(h => h.replace(/<[^>]+>/g, '').trim().replace(/=[\r\n]+/g, ''));
    console.log('H2s (first 8):', h2s.slice(0, 8));

    const h3s = (raw.match(/<h3[^>]*>([\s\S]*?)<\/h3>/gi) || []).map(h => h.replace(/<[^>]+>/g, '').trim().replace(/=[\r\n]+/g, ''));
    console.log('H3s (first 8):', h3s.slice(0, 8));

    // Nav elements / links
    const navText = (raw.match(/<nav[^>]*>([\s\S]*?)<\/nav>/gi) || []).map(n => n.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim());
    if (navText.length > 0) console.log('NAV TEXT SAMPLE:', navText[0].slice(0, 200));

  } catch(e) {
    console.error('Error reading:', e.message);
  }
});
