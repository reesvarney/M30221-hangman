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
    await db.query('INSERT INTO result_players (result_id, name, word, known_letters, score, time_used, lives_used, finished) VALUES ($result_id, $name, $word, $known_letters, $score, $time_used, $lives_used, $finished)',
      gameStates.map((a) => {
        return {
          $result_id: resultId,
          $name: a.name,
          $word: a.word,
          $known_letters: a.known_letters,
          $score: a.score,
          $time_used: a.time_used,
          $lives_used: a.lives_used,
          $finished: a.finished,
        };
      }),
    );

    await db.query('UPDATE lobbies SET last_result=$last_result WHERE id=$id', {
      $id: lobbyId,
      $last_result: resultId,
    });
    return resultId;
  }

  async function getResultById(resultId) {
    const data = (await db.query('SELECT * FROM results WHERE results.id=$id', {
      $id: resultId,
    }))[0];
    data.players = await db.query('SELECT * FROM result_players WHERE result_id=$id', {
      $id: resultId,
    });
    return data;
  }

  return {
    getResult: getResultById,
    create: createResults,
  };
};
