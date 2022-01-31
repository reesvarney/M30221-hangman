import { randomUUID} from "crypto";
import game from './game.js';

export default (db)=>{
  function createLobby(hostId){
    const lobbyId = randomUUID();
    return lobbyId;
  }
  
  function deleteLobby(lobbyId){

  }

  function joinLobby(lobbyId, player){
    
  }

  function leaveLobby(lobbyId, playerId){

  }

  function setRules(lobbyId, rules){

  }

  return {
    game: game(db),
    create: createLobby,
    delete: deleteLobby,
    join: joinLobby,
    leave: leaveLobby,
    setRules: setRules
  }
}