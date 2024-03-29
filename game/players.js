import { randomUUID } from 'crypto';

export default ({ db }) => {
  async function createPlayer(lobbyId, { name, sid }) {
    if (name.trim().length === 0) {
      throw (new Error('name_short'));
    }
    const isHost = await db.query('SELECT is_host FROM active_players WHERE is_host=true AND lobby_id=$lobby_id', {
      $lobby_id: lobbyId,
    });
    const id = randomUUID();
    try {
      await db.query('INSERT INTO active_players (id, session_id, name, lobby_id, is_host, is_active) VALUES ($id, $session_id, $name, $lobby_id, $is_host, $is_active);', {
        $id: id,
        $session_id: sid,
        $name: name.trim(),
        $lobby_id: lobbyId,
        $is_host: (isHost.length === 0),
        $is_active: false,
      });
    } catch (err) {
      throw (new Error('player_creation'));
    }
    return id;
  }

  async function getLobbyPlayers(lobbyId) {
    const players = await db.query('SELECT name, is_host, is_active, id FROM active_players WHERE lobby_id=$lobby_id', {
      $lobby_id: lobbyId,
    });
    return players;
  }

  async function getPlayerBySession(lobbyId, sid) {
    const results = await db.query('SELECT id FROM active_players WHERE lobby_id=$lobby_id AND session_id=$session_id', {
      $lobby_id: lobbyId,
      $session_id: sid,
    });
    return (results.length === 0) ? null : results[0].id;
  }

  async function getSessionByPlayer(lobbyId, playerId) {
    const results = await db.query('SELECT session_id FROM active_players WHERE lobby_id=$lobby_id AND id=$id', {
      $lobby_id: lobbyId,
      $id: playerId,
    });
    return (results.length === 0) ? null : results[0].session_id;
  }

  async function checkHost(lobbyId, sid) {
    const results = await db.query('SELECT id, lobby_id FROM active_players WHERE lobby_id=$lobby_id AND session_id=$session_id AND is_host=true', {
      $lobby_id: lobbyId,
      $session_id: sid,
    });
    return (results.length === 1);
  }

  async function deletePlayer(lobbyId, sid) {
    await db.query('DELETE FROM active_players WHERE session_id=$session_id AND lobby_id=$lobby_id', {
      $session_id: sid,
      $lobby_id: lobbyId,
    });
  }

  async function checkActive(lobbyId, sid) {
    const results = await db.query('SELECT id, lobby_id FROM active_players WHERE lobby_id=$lobby_id AND session_id=$session_id AND is_active=true', {
      $lobby_id: lobbyId,
      $session_id: sid,
    });
    return (results.length === 0) ? null : results[0].id;
  }

  return {
    create: createPlayer,
    getByLobby: getLobbyPlayers,
    delete: deletePlayer,
    getId: getPlayerBySession,
    getSid: getSessionByPlayer,
    isHost: checkHost,
    isActive: checkActive,
  };
};
