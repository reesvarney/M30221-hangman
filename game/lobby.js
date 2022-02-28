import { randomBytes } from "crypto";
import playerFuncs from './players.js';
import ruleFuncs from './rules.js';
import gameFuncs from './game.js';

export default (db)=>{
  const players = playerFuncs({db});
  const rules = ruleFuncs({db});
  const game = gameFuncs({db, rules, players});

  async function createId(){
    const newId = randomBytes(4).toString('hex');
    const exists = await db.query("SELECT id FROM lobbies WHERE id=$id", {
      $id: newId
    });
    if(exists.length > 0){
      return await createId();
    }
    return newId;
  }

  async function createLobby(){
    const lobbyId = await createId();
    await db.query("INSERT INTO lobbies (id, status) VALUES ($id, $status)", {
      $id: lobbyId,
      $status: "lobby"
    });
    await rules.init(lobbyId);
    return lobbyId;
  }
  
  async function deleteLobby(lobbyId){
    db.query("DELETE FROM lobbies WHERE id=$id", {
      $id: lobbyId
    })
  }

  async function joinLobby(lobbyId, playerData){
    await players.create(lobbyId, playerData);
    // check lobby status and make any necessary changes
  }

  async function removePlayer(lobbyId, playerId){
    await players.remove(playerId);
    // Check that host/ active player is not removed player
    await game.checkPlayers(lobbyId);
  }

  async function getLobbyById(lobbyId, player_id=null){
    const lobbyData = {};
    const status = (await db.query("SELECT status FROM lobbies WHERE id=$id", {
      $id: lobbyId
    }));
    if(status.length == 0){
      throw("lobby_not_exist")
    }
    lobbyData.status = status[0].status;
    if(lobbyData.status == "lobby"){
      lobbyData.rules = await rules.getByLobby(lobbyId);
    };
    lobbyData.players = await players.getByLobby(lobbyId);
    if(player_id != null){
      // get gamestate
    }
    return lobbyData
  }

  return {
    game: game,
    create: createLobby,
    delete: deleteLobby,
    join: joinLobby,
    leave: removePlayer,
    getData: getLobbyById,
    rules: rules,
    players: players
  }
}