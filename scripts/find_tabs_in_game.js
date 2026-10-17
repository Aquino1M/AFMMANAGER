const fs = require('fs');

const code = fs.readFileSync('js/game.js', 'utf8');

// Look for tab definitions, nav items, renderTab, currentTab, switchTab, setTab
console.log('Matches for switchTab / currentTab / setTab:');
const tabMatches = code.match(/(?:currentTab|activeTab|switchTab|setTab|tab\s*===)[^;\n]{1,80}/g);
console.log(tabMatches?.slice(0, 20));

// Search for render functions
const renderFuncs = code.match(/function\s+render[A-Za-z0-9_]*\s*\(/g);
console.log('Render functions:', renderFuncs);

// Search for tab names or NAV list
const navListMatch = code.match(/(?:NAV|TABS|tabs|navItems)\s*=\s*\[[^\]]+\]/i);
if (navListMatch) {
  console.log('Nav list match:', navListMatch[0]);
}

// Search for tab render switch case
const tabSwitchIndex = code.indexOf('switch (state.tab)');
if (tabSwitchIndex !== -1) {
  console.log('Found "switch (state.tab)" at', tabSwitchIndex);
  console.log(code.substring(tabSwitchIndex, tabSwitchIndex + 1200));
} else {
  // Try finding any switch on tab
  const anyTabSwitch = code.match(/switch\s*\([a-zA-Z0-9_.]*tab[a-zA-Z0-9_.]*\)\s*\{[\s\S]{1,1200}\}/i);
  if (anyTabSwitch) {
    console.log('Any tab switch:', anyTabSwitch[0].slice(0, 500));
  }
}
