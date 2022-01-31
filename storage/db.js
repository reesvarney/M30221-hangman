import sqlite3 from 'sqlite3';
let db = null;

function init(type, schema){
  new sqlite3.Database((type === "temp") ? "memory" : "./results.db", (err)=>{
    if(err) console.log(err);

    const data = (await fs.readFile(`./schema/${schema}.sql`, "utf8")).split(";").filter(a=> a.length > 1);
    for(const query of data){
      await db.query(query + ';');
    }
  });
}

async function query(string, values={}){
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