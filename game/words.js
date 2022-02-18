"use strict";

import fs from "fs";

export default new Proxy({}, {
  get: function(target, prop, receiver) {
    if(target[prop] !== undefined){
      return target[prop];
    }
    const file = fs.readFileSync(`./game/wordlists/${prop}_chars.json`);
    const data = JSON.parse(file);
    return data;
  }
});