import words from './words.js';
import resultsLogic from './results.js';
export default ({ db, rules }) => {
  const results = resultsLogic({ db, rules });

  async function startGame(lobbyId) {
    // Create gamestates
    const status = (await db.query('SELECT status FROM lobbies WHERE id=$id', {
      $id: lobbyId,
    }))[0];
    if (status.status !== 'game') {
      await db.query("UPDATE lobbies SET status='game' WHERE id=$id", {
        $id: lobbyId,
      });

      const players = await db.query('SELECT id FROM active_players WHERE lobby_id=$lobby_id', {
        $lobby_id: lobbyId,
      });

      const ruleData = await rules.getByLobby(lobbyId);
      let word = null;
      if (ruleData.sameWord) {
        word = getWord(ruleData.wordLength);
      }
      await db.query('INSERT INTO player_gamestates (player_id, score, word, lives_used, time_used, known_letters, used_letters) VALUES ($player_id, $score, $word, $lives_used, $time_used, $known_letters, $used_letters)',
        players.map((a) => {
          const playerWord = (word != null) ? word : getWord(ruleData.wordLength);
          console.log('test');
          console.log('creating player gamestate', a.id);
          return {
            $player_id: a.id,
            $score: 0,
            $word: playerWord,
            // TODO: set these values appropriately in relation to the chosen rules
            $lives_used: 0,
            $time_used: 0,
            $known_letters: ' '.repeat(playerWord.length),
            $used_letters: '',
          };
        }),
      );
      await db.query('UPDATE active_players SET is_active=true WHERE id=(SELECT id FROM active_players WHERE lobby_id=$lobby_id LIMIT 1)', {
        $lobby_id: lobbyId,
      });
    }
  }

  function getWord(length) {
    return words[length][Math.floor(Math.random() * words[length].length)];
  }

  // check in the request whether the user is authenticated to do this
  async function takeTurn(playerId, turn) {
    turn.data = turn.data.toLowerCase();
    const playerGamestate = (await db.query('SELECT * FROM player_gamestates WHERE player_id=$player_id', {
      $player_id: playerId,
    }))[0];
    // validate turn, ability to make a turn should be confirmed from the request handler
    if (turn.type === 'letter') {
      const newKnownLetters = playerGamestate.known_letters.split('');
      if (playerGamestate.used_letters.includes(turn.data)) {
        throw (new Error('letter already used'));
      }
      if (playerGamestate.word.includes(turn.data)) {
        for (let i = 0; i < playerGamestate.word.length; i++) {
          if (playerGamestate.word[i] === turn.data) {
            newKnownLetters[i] = turn.data;
          }
        }
        await db.query('UPDATE player_gamestates SET known_letters=$known_letters, used_letters=$used_letters WHERE player_id=$player_id', {
          $used_letters: playerGamestate.used_letters + turn.data,
          $known_letters: newKnownLetters.join(''),
          $player_id: playerGamestate.player_id,
        });
        if (newKnownLetters.join('') === playerGamestate.word) {
          checkEnd(playerId);
        }
      } else {
        await db.query('UPDATE player_gamestates SET lives_used=$lives_used, used_letters=$used_letters WHERE player_id=$player_id', {
          $lives_used: playerGamestate.lives_used + 1,
          $used_letters: playerGamestate.used_letters + turn.data,
          $player_id: playerGamestate.player_id,
        });
      }
    } else if (turn.type === 'full_guess') {
      // check that full guesses are allowed
      if (turn.data.toLowerCase() === playerGamestate.word) {
        await db.query('UPDATE player_gamestates SET known_letters=$known_letters WHERE player_id=$player_id', {
          $known_letters: playerGamestate.word,
          $player_id: playerGamestate.player_id,
        });
        checkEnd(playerId);
      } else {
        await db.query('UPDATE player_gamestates SET lives_used=$lives_used WHERE player_id=$player_id', {
          $lives_used: playerGamestate.lives_used + 1,
          $player_id: playerGamestate.player_id,
        });
      }
    }
    // replace with actual rule value
    const turns = true;
    if (turns) {
      nextTurn(playerId);
    }
  }

  async function checkEnd(playerId) {
    const gameStates = await db.query('SELECT word, known_letters, lobby_id FROM lobbies LEFT JOIN active_players ON lobbies.id=active_players.lobby_id LEFT JOIN player_gamestates ON active_players.id=player_gamestates.player_id WHERE lobbies.id IN (SELECT lobby_id FROM active_players WHERE id=$id)', {
      $id: playerId,
    });
    const maxLives = await db.query('SELECT value FROM rules WHERE rule_id=$rule_id AND lobby_id=$lobby_id', {
      $rule_id: 'max_lives',
      $lobby_id: gameStates[0].lobby_id,
    });
    for (const gameState of gameStates) {
      if (gameState.word !== gameState.known_letters && gameState.lives_used !== maxLives[0].value) {
        return;
      }
    }
    await results.create(gameStates[0].lobby_id);
    await db.query("UPDATE lobbies SET status='results' WHERE id=$id", {
      $id: gameStates[0].lobby_id,
    });
  }

  async function nextTurn(playerId) {
    const activePlayer = await db.query('SELECT id, lobby_id FROM active_players WHERE id=$id AND is_active=true', {
      $id: playerId,
    });
    if (activePlayer.length === 1) {
      const maxLives = await db.query('SELECT * FROM rules WHERE rule_id=$rule_id AND lobby_id=$lobby_id', {
        $rule_id: 'maxLives',
        $lobby_id: activePlayer[0].lobby_id,
      });
      await db.query('UPDATE active_players SET is_active=false WHERE id=$id', {
        $id: playerId,
      });
      if ((await db.query('SELECT MAX(id) FROM active_players WHERE lobby_id=$lobby_id'))[0].id !== activePlayer[0].id) {
        await db.query('UPDATE active_players SET is_active=true WHERE id IN (SELECT id FROM active_players WHERE lobby_id=$lobby_id AND known_letters<>word AND lives_used<>$max_lives ORDER BY id ASC LIMIT 1)', {
          $lobby_id: activePlayer[0].lobby_id,
          $max_lives: maxLives[0].value,
        });
      } else {
        await db.query('UPDATE active_players SET is_active=true WHERE id IN (SELECT id FROM active_players LEFT JOIN player_gamestates ON id=player_id WHERE lobby_id=$lobby_id AND id>$id AND known_letters<>word AND lives_used<>$max_lives ORDER BY id ASC LIMIT 1)', {
          $lobby_id: activePlayer[0].lobby_id,
          $id: playerId,
          $max_lives: maxLives[0].value,
        });
      }
    } else {
      // player does not exist, has probably disconnected
    }
  }

  async function getAllowedData(playerId) {
    // TODO: allow players to get limited data of other players
    const playerData = await db.query('SELECT known_letters, lives_used, score, time_used, used_letters FROM player_gamestates WHERE player_id=$player_id', {
      $player_id: playerId,
    });
    return playerData;
  }

  return {
    start: startGame,
    takeTurn,
    results,
    getPlayerData: getAllowedData,
  };
};
