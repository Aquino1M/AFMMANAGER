const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

function getFiles(dir) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) results = results.concat(getFiles(fullPath));
    else results.push(fullPath);
  });
  return results;
}

const allFiles = getFiles('img/players');
console.log(`Total files in img/players: ${allFiles.length}`);

const hashMap = new Map();
allFiles.forEach(file => {
  const buf = fs.readFileSync(file);
  const hash = crypto.createHash('md5').update(buf).digest('hex');
  if (!hashMap.has(hash)) hashMap.set(hash, []);
  hashMap.get(hash).push(file);
});

console.log(`Total unique hashes: ${hashMap.size}`);

// Find hashes that appear in > 1 file
let filesToDelete = [];
let legitimateDuplicates = []; // e.g. 655.png and neymar.png

for (const [hash, files] of hashMap.entries()) {
  if (files.length > 1) {
    // Check if these files belong to the same player or different players
    const names = files.map(f => {
      const bn = path.basename(f, path.extname(f)).toLowerCase();
      return bn;
    });
    
    // If more than 2 files share this hash, it is definitely a mass-duplicate / fake placeholder
    if (files.length > 2) {
      filesToDelete.push(...files);
    } else {
      // Exactly 2 files: check if one is numeric ID and one is matching player name
      const isOneNumeric = /^\d+$/.test(names[0]) || /^\d+$/.test(names[1]);
      if (isOneNumeric) {
        // e.g. 393.png and memphis_depay.png -> legitimate alias
        legitimateDuplicates.push(files);
      } else {
        // e.g. wanderson.png and wesley.png -> fake cross-player copy!
        console.log(`Cross-player duplicate detected: ${files.join(' vs ')}`);
        filesToDelete.push(...files);
      }
    }
  }
}

console.log(`Files to delete (fake/mass-duplicated placeholders): ${filesToDelete.length}`);
console.log(`Legitimate alias pairs kept: ${legitimateDuplicates.length}`);

// Delete the fake duplicate files
let deletedCount = 0;
filesToDelete.forEach(file => {
  try {
    fs.unlinkSync(file);
    deletedCount++;
  } catch (err) {
    console.error(`Error deleting ${file}:`, err.message);
  }
});

console.log(`Successfully deleted ${deletedCount} fake duplicate image files!`);
