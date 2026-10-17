const fs = require('fs');

const files = [
  'data/club_badges.js',
  'data/club_badges_unverified.js',
  'data/club_badges_verified_world.js',
  'data/club_badges_verified_2026.js',
  'data/club_badges_verified_overrides.js'
];

files.forEach(f => {
  if (fs.existsSync(f)) {
    const text = fs.readFileSync(f, 'utf8');
    ['Inter Miami', 'Galaxy', 'LAFC', 'Columbus'].forEach(c => {
      if (text.includes(c)) console.log(`Found "${c}" in ${f}`);
    });
  }
});
