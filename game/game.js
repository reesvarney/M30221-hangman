import words from './words.js';
import resultsLogic from './results.js';
export default ({ db, rules }) => {
  const results = resultsLogic({ db, rules });

  async function startGame(lobbyId) {
    // Create gamestates
    const status = (await db.query('SELECT status FROM lobbies WHERE id=$id', {
      $id: lobbyId,
    }))[0].status;
    if (status !== 'game') {
      await db.query("UPDATE lobbies SET status='game' WHERE id=$id", {
        $id: lobbyId,
      });

      await addGamestates(lobbyId);

      await db.query('UPDATE active_players SET is_active=true WHERE id=(SELECT id FROM active_players WHERE lobby_id=$lobby_id LIMIT 1)', {
        $lobby_id: lobbyId,
      });
    }
  }

  async function addGamestates(lobbyId) {
    const players = await db.query('SELECT id FROM active_players LEFT JOIN player_gamestates ON active_players.id=player_gamestates.player_id WHERE lobby_id=$lobby_id AND player_id IS NULL', {
      $lobby_id: lobbyId,
    });

    const lobbyRules = await rules.getByLobby(lobbyId);
    let word = null;
    if (lobbyRules.sameWord) {
      word = getWord(lobbyRules.wordLength);
    }

    await db.query('INSERT INTO player_gamestates (player_id, score, word, lives_used, time_used, known_letters, used_letters) VALUES ($player_id, $score, $word, $lives_used, $time_used, $known_letters, $used_letters)',
      players.map((a) => {
        const playerWord = (word != null) ? word : getWord(lobbyRules.wordLength);
        console.log(playerWord);
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
    if (lobbyRules.asyncTurns === 1) {
      await db.query('UPDATE active_players SET is_active=true WHERE id IN (SELECT player_id FROM player_gamestates WHERE finished=false) AND lobby_id=$lobby_id', {
        $lobby_id: lobbyId,
      });
    }
  }

  function getWord(length) {
    return words[length][Math.floor(Math.random() * words[length].length)];
  }

  // check in the request whether the user is authenticated to do this
  async function takeTurn(lobbyId, playerId, turn) {
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
      } else {
        await db.query('UPDATE player_gamestates SET lives_used=$lives_used, used_letters=$used_letters WHERE player_id=$player_id', {
          $lives_used: playerGamestate.lives_used + 1,
          $used_letters: playerGamestate.used_letters + turn.data,
          $player_id: playerGamestate.player_id,
        });
      }
    } else if (turn.type === 'full_guess') {
      // check that full guesses are allowed
      if ((await rules.getByLobby(lobbyId)).fullGuesses !== 1) {
        throw (new Error('guess_not_allowed'));
      }
      if (turn.data.length !== playerGamestate.word.length) {
        throw (new Error('bad_guess_length'));
      }
      if (turn.data.toLowerCase() === playerGamestate.word) {
        await db.query('UPDATE player_gamestates SET known_letters=$known_letters WHERE player_id=$player_id', {
          $known_letters: playerGamestate.word,
          $player_id: playerGamestate.player_id,
        });
      } else {
        await db.query('UPDATE player_gamestates SET lives_used=$lives_used WHERE player_id=$player_id', {
          $lives_used: playerGamestate.lives_used + 1,
          $player_id: playerGamestate.player_id,
        });
      }
    }
    await checkEnd(playerId);
    nextTurn(playerId);
  }

  async function checkEnd(playerId) {
    const gameStates = await db.query('SELECT word, known_letters, lobby_id, lives_used FROM active_players LEFT JOIN lobbies ON lobbies.id=active_players.lobby_id LEFT JOIN player_gamestates ON active_players.id=player_gamestates.player_id WHERE lobbies.id IN (SELECT lobby_id FROM active_players WHERE id=$id)', {
      $id: playerId,
    });
    const maxLives = (await db.query('SELECT value FROM rules WHERE rule_id=$rule_id AND lobby_id=$lobby_id', {
      $rule_id: 'maxLives',
      $lobby_id: gameStates[0].lobby_id,
    }))[0].value;
    for (const gameState of gameStates) {
      if (gameState.word !== gameState.known_letters && gameState.lives_used !== maxLives) {
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
      const lobbyRules = await rules.getByLobby(activePlayer[0].lobby_id);
      if (lobbyRules.asyncTurns === 0) {
        const maxLives = await db.query('SELECT * FROM rules WHERE rule_id=$rule_id AND lobby_id=$lobby_id', {
          $rule_id: 'maxLives',
          $lobby_id: activePlayer[0].lobby_id,
        });
        await db.query('UPDATE active_players SET is_active=false WHERE id=$id', {
          $id: playerId,
        });
        const maxId = (await db.query('SELECT MAX(id) as max FROM active_players WHERE lobby_id=$lobby_id', {
          $lobby_id: activePlayer[0].lobby_id,
        }))[0].max;
        if (maxId === playerId) {
          await db.query('UPDATE active_players SET is_active=true WHERE id IN (SELECT id FROM active_players LEFT JOIN player_gamestates ON id=player_id WHERE lobby_id=$lobby_id AND known_letters<>word AND lives_used<>$max_lives ORDER BY id ASC LIMIT 1)', {
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
    addPlayers: addGamestates,
  };
};
