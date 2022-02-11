import sqlite3 from 'sqlite3';
let db = null;

// TODO: Support multiple database types such as postgres to improve performance
function init(){
  db = new sqlite3.Database("memory", (err)=>{
    if(err) console.log(err);

    for(const queryString of (await fs.readFile(`./schema/active.sql`, "utf8")).split(";").filter(a=> a.length > 1)){
      await query(queryString + ';');
    }
    for(const queryString of (await fs.readFile(`./schema/persistent.sql`, "utf8")).split(";").filter(a=> a.length > 1)){
      await query(queryString + ';');
    }
  });
  return db
}

async function query(string, values={}){
  if(Array.isArray(values)){
    const newVals = {};
    const paramValues = /VALUES *(?<values>\(.*?\))/mg.exec(string).groups.values;
    const params = paramValues.substring(1, paramValues.length-1).split(',').map(a => a.trim());
    let paramString = "("
    for(let i = 0; i < values.length; i++){
      for(const [name, value] of Object.entries(values[i])){
        newVals[name + i] = value;
      }
      paramString += `(${params.map(a=> `${a}${i}`).join(", ")}),`
    }
    string = string.replace( /VALUES *\(.*?\)/mg, `VALUES (${paramString.slice(0, -1)})`);
    values = newVals;
  }
  return new Promise((resolve, reject)=>{
    if(db === null){
      reject("DB not initialised");
    }
    db[string.includes("SELECT") ? "all" : "run"](string, values, (err, data)=>{
      if (err){
        reject(err);
      }else{
        resolve(data);
      }
    });
  });
}

export default {
  init: init,
  query: query
}