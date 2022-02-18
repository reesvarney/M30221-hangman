import { randomUUID} from "crypto";
import playerFuncs from './players.js';
import ruleFuncs from './rules.js';
import gameFuncs from './game.js';

export default (db)=>{
  const players = playerFuncs({db});
  const rules = ruleFuncs({db});
  const game = gameFuncs({db, rules, players});

  async function createLobby(hostData){
    const lobbyId = randomUUID();;
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