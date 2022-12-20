'use strict';

import fs from 'fs';

const words = new Proxy({}, {
  get: function (target, prop) {
    if (target[prop] !== undefined) {
      return target[prop];
    }
    const file = fs.readFileSync(`./game/wordlists/${prop}_chars.json`);
    const data = JSON.parse(file);
    return data;
  },
});


function getDaily() {
  const today = new Date(Date.now()).setHours(0, 0, 0, 0);
  const sublist = words[Math.floor(Math.abs(Math.sin(today)) * 6) + 4];
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  return sublist[Math.floor(Math.abs(Math.sin(tomorrow)) * sublist.length)];
}

export { words, getDaily };
