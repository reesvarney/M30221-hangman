
export default ({ db }) => {
  function createResults(lobbyId) {
    const gameStates = await db.query('SELECT * FROM player_gamestates RIGHT JOIN active_players on active_players.id=player_gamestates.player_id WHERE active_players.lobby_id=$lobby_id', {
      $lobby_id: lobbyId,
    });

  }

  return {
    create: createResults,
  };
};
