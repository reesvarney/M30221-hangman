import { randomUUID} from "crypto";
import game from './game.js';
import players from './players.js';
import rules from './rules.js';

export default (db)=>{
  async function createLobby(hostData){
    const lobbyId = randomUUID();;
    await db.query("INSERT INTO TABLE lobbies VALUES ()", {

    });
    players.create(hostData);
    return lobbyId;
  }
  
  function deleteLobby(lobbyId){
    db.query("DELETE FROM lobbies WHERE id=$id", )
  }

  function joinLobby(lobbyId, playerData){
    players.create(playerData, lobbyId);
  }

  return {
    game: game(db),
    create: createLobby,
    delete: deleteLobby,
    join: joinLobby,
    leave: leaveLobby,
    rules: rules(db),
    players: players(db)
  }
}