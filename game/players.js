export default (db)=>{
  function createPlayer(data, lobbyId=null){
    db.query("INSERT INTO TABLE active_players (id, type, name, lobby_id, is_host) VALUES ($id, $type, $name, $lobby_id);", {
      $id: data.id,
      $type: data.type,
      $name: data.name,
      $lobby_id: lobbyId
    });
  };

  function sendPlayerUpdate(id){
    const player = db.query("SELECT type, id FROM active_players WHERE id=$id", {
      $id: id
    });
    if( player[0].type === "ws" ){
  
    }
  }

  function deletePlayer(id){
    db.query("DELETE FROM active_players WHERE id=$id", {
      $id: id
    });
  }

  return {
    create: createPlayer,
    sendUpdate: sendPlayerUpdate,
    delete: deletePlayer
  };
}