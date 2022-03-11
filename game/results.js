import { randomUUID } from 'crypto';

export default ({ db }) => {
  async function createResults(lobbyId) {
    const ruleData = await db.query('SELECT * FROM rules WHERE lobby_id=$id', {
      $id: lobbyId,
    });
    const rules = Object.fromEntries(ruleData.map(a => {
      return [a.rule_id, a.value];
    }));
    const resultId = randomUUID();
    await db.query('INSERT INTO results (id, max_lives, max_time, hints) VALUES ($id, $max_lives, $max_time, $hints)', {
      $id: resultId,
      $max_lives: rules.max_lives,
      $max_time: rules.max_time,
      $hints: rules.hints,
    });
    const gameStates = await db.query('SELECT * FROM active_players LEFT JOIN player_gamestates on active_players.id=player_gamestates.player_id WHERE active_players.lobby_id=$lobby_id', {
      $lobby_id: lobbyId,
    });
    await db.query('INSERT INTO result_players (result_id, name, word, known_letters, score, position, time_used, lives_used, finished) VALUES ($result_id, $name, $word, $known_letters, $score, $position, $time_used, $lives_used, $finished)', [
      gameStates.map((a) => {
        return {
          $result_id: resultId,
          $name: a.name,
          $word: a.word,
          $known_letters: a.known_letters,
          $score: a.score,
          $position: a.position,
          $time_used: a.time_used,
          $finished: a.finished,
        };
      }),
    ]);

    return resultId;
  }

  async function getLobbyResults(lobbyId) {

  }

  async function getPlayerResults(playerId) {

  }

  return {
    create: createResults,
  };
};
