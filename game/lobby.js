import { randomUUID} from "crypto";
import game from './game.js';
import players from './players.js';
import rules from './rules.js';

export default (db)=>{
  function createLobby(hostData){
    const lobbyId = randomUUID();
    players.create(hostData);
    return lobbyId;
  }
  
  function deleteLobby(lobbyId){

  }

  function joinLobby(lobbyId, playerData){
    players.create(playerData, lobbyId);
  }

  function leaveLobby(lobbyId, playerId){

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