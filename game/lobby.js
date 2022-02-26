import { randomBytes } from "crypto";
import playerFuncs from './players.js';
import ruleFuncs from './rules.js';
import gameFuncs from './game.js';

export default (db)=>{
  const players = playerFuncs({db});
  const rules = ruleFuncs({db});
  const game = gameFuncs({db, rules, players});

  function createId(){
    const newId = randomBytes(4).toString('hex');
    const exists = db.query("SELECT TOP 1 FROM lobbies WHERE id=$id", {
      $id: newId
    });
    console.log(exists)
    if(exists != null){
      return createId();
    }
    return newId;
  }

  async function createLobby(hostData){
    const lobbyId = createId();
    await db.query("INSERT INTO TABLE lobbies (id, status) VALUES ($id, $status)", {
      $id: lobbyId,
      $status: "lobby"
    });
    rules.init(lobbyId);
    players.create(lobbyId, hostData);
    return lobbyId;
  }
  
  function deleteLobby(lobbyId){
    db.query("DELETE FROM lobbies WHERE id=$id", {
      $id: lobbyId
    })
  }

  function joinLobby(lobbyId, playerData){
    players.create(lobbyId, playerData);
  }

  function removePlayer(lobbyId, playerId){
    players.remove(playerId);
    // Check that host/ active player is not removed player
    game.checkPlayers(lobbyId);
  }

  return {
    game: game,
    create: createLobby,
    delete: deleteLobby,
    join: joinLobby,
    leave: removePlayer,
    rules: rules,
    players: players
  }
}