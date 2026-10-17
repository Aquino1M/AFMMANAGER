const fs = require('fs');
const content = fs.readFileSync('js/game.js', 'utf8');

// Parse characters tracking line and col
let state = 'code';
let stack = [];

for (let i = 0; i < content.length; i++) {
  const ch = content[i];
  const next = content[i+1];
  
  if (state === 'code') {
    if (ch === '/' && next === '/') { state = 'comment_single'; i++; }
    else if (ch === '/' && next === '*') { state = 'comment_multi'; i++; }
    else if (ch === "'") { state = 'single_quote'; }
    else if (ch === '"') { state = 'double_quote'; }
    else if (ch === '`') { state = 'template'; }
    else if (ch === '{') {
      const line = content.slice(0, i).split('\n').length;
      stack.push({ char: '{', index: i, line });
    } else if (ch === '}') {
      if (stack.length > 0 && stack[stack.length - 1].char === '{') {
        stack.pop();
      } else {
        const line = content.slice(0, i).split('\n').length;
        console.log('Extra } at line', line);
      }
    }
  } else if (state === 'comment_single') {
    if (ch === '\n') state = 'code';
  } else if (state === 'comment_multi') {
    if (ch === '*' && next === '/') { state = 'code'; i++; }
  } else if (state === 'single_quote') {
    if (ch === '\\') i++;
    else if (ch === "'") state = 'code';
  } else if (state === 'double_quote') {
    if (ch === '\\') i++;
    else if (ch === '"') state = 'code';
  } else if (state === 'template') {
    if (ch === '\\') i++;
    else if (ch === '`') state = 'code';
    else if (ch === '$' && next === '{') {
      const line = content.slice(0, i).split('\n').length;
      stack.push({ char: '{', index: i, line, isTemplate: true });
      state = 'code';
      i++;
    }
  }
}

console.log('Unclosed stack count:', stack.length);
if (stack.length > 0) {
  stack.slice(-5).forEach(s => console.log('Unclosed', s.char, 'from line', s.line));
}
