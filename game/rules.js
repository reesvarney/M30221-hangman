import fs from "fs/promises";
const rules = JSON.parse(await fs.readFile("./game/rules.json"));
const ruleQuery = {
  string: "INSERT INTO rules (lobby_id, rule_id, value) VALUES ($lobby_id, $rule_id, $value);",
  data: Object.entries(rules).map((a)=> {
    return {
      $lobby_id: null, 
      $rule_id: a[0],
      $value: a[1].defaultValue
    }
  })
};

export default ({db})=>{
  async function createRules(lobbyId){
    return await db.query(ruleQuery.string, ruleQuery.data.map(a=>{a.$lobby_id = lobbyId; return a}));
  }

  async function deleteRules(lobbyId){
    return await db.query(`DELETE FROM rules WHERE lobby_id=$lobby_id`, {$lobby_id: lobbyId});
  }

  async function getLobbyRules(lobbyId){
    const data = await db.query(`SELECT rule_id, value FROM rules WHERE lobby_id=$lobby_id`, {
      $lobby_id: lobbyId
    });
    return Object.fromEntries(data.map(a=>[a.rule_id, a.value]));
  }

  async function setRule(lobbyId, id, value){
    if(value == "null") value = null;
    if(rules[id].type == 'number' && value != null && Number(value) != NaN){
      value = Number(value);
    }
    if(!(rules[id] != undefined && (rules[id].type === typeof value || (value === null && rules[id].allowNull == true)))){
      throw("Submitted value is not correct type");
    }
    if(rules[id].minVal !== undefined && value < rules[id].minVal && value != null){
      throw("Submitted value is too small");
    }
    if(rules[id].maxVal !== undefined && value > rules[id].maxVal && value != null){
      throw("Submitted value is too large");
    }
    return await db.query("UPDATE rules SET value=$value WHERE lobby_id=$lobby_id AND rule_id=$rule_id;", {
      $lobby_id: lobbyId,
      $rule_id: id,
      $value: value
    });
  }

  return {
    all: rules,
    setValue: setRule,
    getByLobby: getLobbyRules,
    delete: deleteRules,
    init: createRules
  }
}