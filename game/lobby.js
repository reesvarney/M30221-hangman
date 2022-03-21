import { randomBytes } from 'crypto';
import playerFuncs from './players.js';
import ruleFuncs from './rules.js';
import gameFuncs from './game.js';

export default (db) => {
  const players = playerFuncs({ db });
  const rules = ruleFuncs({ db });
  const game = gameFuncs({ db, rules, players });

  async function createId() {
    const newId = randomBytes(4).toString('hex');
    const exists = await db.query('SELECT id FROM lobbies WHERE id=$id', {
      $id: newId,
    });
    if (exists.length > 0) {
      return await createId();
    }
    return newId;
  }

  async function createLobby() {
    const lobbyId = await createId();
    await db.query('INSERT INTO lobbies (id, status) VALUES ($id, $status)', {
      $id: lobbyId,
      $status: 'lobby',
    });
    await rules.init(lobbyId);
    return lobbyId;
  }

  async function deleteLobby(lobbyId) {
    await db.query('DELETE FROM lobbies WHERE id=$id', {
      $id: lobbyId,
    });
  }

  async function joinLobby(lobbyId, playerData) {
    const lobbyRules = await rules.getByLobby(lobbyId);
    if (lobbyRules.multiplayer !== 1) {
      throw (new Error('lobby_not_multiplayer'));
    }
    if ((await players.getByLobby(lobbyId)).length === lobbyRules.maxPlayers) {
      throw (new Error('lobby_max_players'));
    }
    await players.create(lobbyId, playerData);
    // check lobby status and make any necessary changes
    const status = (await db.query('SELECT status FROM lobbies WHERE id=$id', {
      $id: lobbyId,
    }))[0].status;
    if (status === 'game') {
      await game.addPlayers(lobbyId);
    }
  }

  async function removePlayer(lobbyId, playerId) {
    await players.delete(lobbyId, playerId);
    if ((await players.getByLobby(lobbyId)).length === 0) {
      await deleteLobby(lobbyId);
    } else {
      // todo: change active player if removed player was mid turn
      // await game.checkPlayers(lobbyId);
    }
  }

  async function getLobbyById(lobbyId, sessionId = null) {
    const lobbyData = {};
    const lobbyRecord = (await db.query('SELECT status, last_result FROM lobbies WHERE id=$id', {
      $id: lobbyId,
    }));
    if (lobbyRecord.length === 0) {
      throw (new Error('lobby_not_exist'));
    }
    lobbyData.status = lobbyRecord[0].status;
    lobbyData.lastResult = lobbyRecord[0].last_result;
    lobbyData.rules = await rules.getByLobby(lobbyId);
    lobbyData.players = await players.getByLobby(lobbyId);
    lobbyData.playerId = await players.getId(lobbyId, sessionId);
    if (lobbyData.playerId != null && lobbyData.status === 'game') {
      // get gamestate
      lobbyData.gameStatus = (await game.getPlayerData(lobbyData.playerId))[0];
    }
    return lobbyData;
  }

  async function getLastResult(lobbyId) {
    return (await db.query('SELECT last_result FROM lobbies WHERE id=$id', {
      $id: lobbyId,
    }))[0].last_result;
  }

  return {
    game,
    rules,
    players,
    create: createLobby,
    delete: deleteLobby,
    join: joinLobby,
    leave: removePlayer,
    getData: getLobbyById,
    lastResult: getLastResult,
  };
};
