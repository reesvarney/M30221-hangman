import {randomUUID} from "crypto";

export default ({db})=>{
  async function createPlayer(lobbyId, {type, name}){
    const isHost = await db.query("SELECT is_host FROM active_players WHERE is_host=true AND lobby_id=$lobby_id", {
      $lobby_id: lobbyId
    });
    const id = randomUUID();
    await db.query("INSERT INTO active_players (id, type, name, lobby_id, is_host, is_active) VALUES ($id, $type, $name, $lobby_id, $is_host, $is_active);", {
      $id: id,
      $type: type,
      $name: name,
      $lobby_id: lobbyId,
      $is_host: (isHost.length == 0),
      $is_active: false
    });
    return id;
  };

  async function getLobbyPlayers(lobbyId){
    const players = await db.query("SELECT name, is_host, is_active, id FROM active_players WHERE lobby_id=$lobby_id", {
      $lobby_id: lobbyId
    });
    return players;
  }

  function deletePlayer(id){
    db.query("DELETE FROM active_players WHERE id=$id", {
      $id: id
    });
  }

  return {
    create: createPlayer,
    getByLobby: getLobbyPlayers,
    delete: deletePlayer
  };
}