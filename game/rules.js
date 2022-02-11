import fs from "fs/promises";
const rules = JSON.parse(await fs.readFile("./rules.json"));
const ruleQuery = {
  string: "INSERT INTO TABLE rules (lobby_id, rule_id, value) VALUES ($lobby_id, $rule_id, $value);",
  data: Object.entries(rules).map((a)=> {
    return {
      $lobby_id: null, 
      $rule_id: a[0],
      $value: a[1].defaultValue
    }
  })
};

const ruleCache = {};

export default (db)=>{
  function createRules(lobbyId){
    return await db.query(ruleQuery.string, ruleQuery.data.map(a=>a.$lobby_id = lobbyId));
  }

  function deleteRules(lobbyId){
    return await db.query(`DELETE FROM rules WHERE lobby_id=$lobby_id`, {$lobby_id: lobbyId});
  }

  function getRules(lobbyId){
    const data = await db.query(`SELECT rule_id, value FROM rules WHERE lobby_id=$lobby_id`, {$lobby_id: lobbyId});
    return Object.fromEntries(Object.entries(rules).map(a=> a[1].value = data.find(b => b.rule_id === a[0])))
  }

  function setRule(lobbyId, id, value){
    if(id in rules && (rules[id].type === typeof value || (value === null && rules[id].allowNull === true))){
      throw("Submitted value is not correct type");
    }
    if(rules[id].minVal !== undefined && value < rules[id].minVal){
      throw("Submitted value is too small");
    }
    if(rules[id].maxVal !== undefined && value > rules[id].maxVal){
      throw("Submitted value is too large");
    }
    return await db.query("UPDATE rules SET value=$value WHERE lobby_id=$lobby_id, rule_id=$rule_id;", {
      $lobby_id: lobbyId,
      $rule_id: id,
      $value: new Number(value)
    });
  }

  return {
    all: rules,
    set: setRule,
    get: getRules,
    delete: deleteRules,
    init: createRules
  }
}