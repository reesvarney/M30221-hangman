import fs from 'fs/promises';

const file = await fs.readFile('./google.csv');
const data = file.toString().split('\n').map(e => e.trim()).map(e => e.split(',').map(e => e.trim()));
console.log(data);
const bad_file = await fs.readFile('./bad-words.txt');
const bad_data = bad_file.toString().split('\n');
const split = {};
for(const wordLength of [...Array(17).keys()].map(a => a + 4)){
  split[wordLength] = [];
}

const exp = new RegExp(bad_data.join("|"));
for(const [pos, word] of data){
  if(
    word.length > 3 && word.length < 21 &&
    /^[a-zA-Z]+$/.test(word)
    && !(exp.test(word))
  ){
    if(split[word.length].length < 1000){
      split[word.length].push(word.toLowerCase());
    }
  }
}

console.log(Object.values(split).map(a=> a.length))


for(const [length, words] of Object.entries(split)){
  const top = words.splice(0, 300);
  fs.writeFile(`./${length}_chars.json`, JSON.stringify(top, null, 2));
}