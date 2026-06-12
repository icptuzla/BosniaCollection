const fs = require('fs');

let content = fs.readFileSync('./src/data/players.ts', 'utf-8');

// The file has a STICKERS array. I will extract the objects, sort them by their id, then reassign ids 1 to 28.
// Since it's a TS file with specific formatting, I'll just do a simple string replacement for the ids.

let idRegex = /id:\s*([\d\.,]+)/g;
let match;
let matches = [];
while ((match = idRegex.exec(content)) !== null) {
    let valStr = match[1].replace(',', '.');
    matches.push({
        fullMatch: match[0],
        value: parseFloat(valStr),
        index: match.index,
        len: match[0].length
    });
}

console.log("Found ids:", matches.map(m => m.value));
