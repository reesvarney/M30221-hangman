export default (db)=>{
  function createPlayer(data, lobbyId=null){
    db.query("INSERT INTO TABLE active_players (id, type, name, lobby_id) VALUES ($id, $type, $name, $lobby_id);", {
      $id: data.id,
      $type: data.type,
      $name: data.name,
      $lobby_id: lobbyId
    })
  }

  return {
    create: createPlayer
  }
}