import fs from 'fs/promises';

const file = await fs.readFile('./words.csv');
const data = file.toString().split('\n').map(e => e.trim()).map(e => e.split(',').map(e => e.trim()));
const bad_file = await fs.readFile('./bad-words.txt');
const bad_data = bad_file.toString().split('\n');
const split = {};
for(const wordLength of [...Array(8).keys()].map(a => a + 4)){
  split[wordLength] = data.filter(([a,b,c])=> c.length === wordLength 
  && /^[a-zA-Z]+$/.test(c)
  && !bad_data.includes(c)
  ).map(([a,b,c])=> c);
}

console.log(Object.values(split).map(a=> a.length))


for(const [length, words] of Object.entries(split)){
  console.log(length, words.length)
  const top = words.splice(0, 300);
  fs.writeFile(`./${length}_chars.json`, JSON.stringify(top, null, 2));
}