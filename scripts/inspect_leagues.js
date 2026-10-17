const fs = require('fs');
const vm = require('vm');

const compCode = fs.readFileSync('js/competitions.js', 'utf8');
const context = { window: {}, console: console };
vm.createContext(context);
try {
  vm.runInContext(compCode, context);
  const comps = context.window.COMPETITIONS || [];
  console.log(`Total competitions in window.COMPETITIONS: ${comps.length}`);
  const byContinent = {};
  comps.forEach(c => {
    byContinent[c.continent] = byContinent[c.continent] || [];
    byContinent[c.continent].push({ id: c.id, name: c.name, country: c.country, clubsCount: c.clubs ? c.clubs.length : 0 });
  });

  for (const [cont, list] of Object.entries(byContinent)) {
    console.log(`\n=== Continente: ${cont} (${list.length} competições) ===`);
    list.forEach(c => {
      console.log(`  - [${c.id}] ${c.name} (${c.country}) - ${c.clubsCount} times`);
    });
  }
} catch (e) {
  console.error('Error running competitions.js:', e);
}

