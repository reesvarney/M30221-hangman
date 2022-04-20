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
    await db.query('INSERT INTO results (id, max_lives, max_time) VALUES ($id, $max_lives, $max_time)', {
      $id: resultId,
      $max_lives: rules.maxLives,
      $max_time: rules.maxTime,
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
          $score: calcScore(a, rules),
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

    await db.query('DELETE FROM player_gamestates WHERE player_id IN (SELECT id FROM active_players WHERE lobby_id=$lobby_id)', {
      $lobby_id: lobbyId,
    });
    return resultId;
  }

  function calcScore(gamestate, rules) {
    let score = 0;
    score += (gamestate.known_letters.replace(/\s/g, '')).length * 2;
    if (gamestate.known_letters === gamestate.word) {
      if (rules.maxTime !== null) {
        score += (rules.maxTime - gamestate.time_used);
      }
      if (rules.maxLives !== null) {
        score += (rules.maxLives - gamestate.lives_used) * 4;
      }
    }
    return score;
  }

  async function getResultById(resultId) {
    const data = (await db.query('SELECT * FROM results WHERE results.id=$id', {
      $id: resultId,
    }))[0];
    data.players = await db.query('SELECT * FROM result_players WHERE result_id=$id ORDER BY score DESC ', {
      $id: resultId,
    });
    return data;
  }

  async function leaveResults(lobbyId) {
    await db.query("UPDATE lobbies SET status='lobby' WHERE id=$id", {
      $id: lobbyId,
    });
  }

  return {
    getResult: getResultById,
    create: createResults,
    leave: leaveResults,
  };
};
