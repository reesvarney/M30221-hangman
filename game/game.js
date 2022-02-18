import words from "./words.js";

export default ({db, rules})=>{
  async function startGame(lobbyId){
    // Create gamestates
    const players = await db.query("SELECT id FROM active_players WHERE lobby_id=$lobby_id", {
      $lobby_id: lobbyId
    });

    const rules = rules.getValues(lobbyId);

    db.query("INSERT INTO player_gamestates (player_id, score, word, lives_used, time_used) VALUES ($player_id, $score, $word, $lives_used, $time_used)",
    players.map((a)=>{
      return {
        $player_id: id,
        $score: 0,
        $word: getWord(rules.wordLength.value),
        // TODO: set these values appropriately in relation to the chosen rules
        $lives_used: 0,
        $time_used: 0
      }
    })
    );

    db.query("UPDATE lobbies SET status='game' WHERE id=$id", {
      $id: lobbyId
    });

    // todo: Return false if there are any issues
    return true;
  }

  function getWord(length){
    return words[length][Math.floor(Math.random()*words[length].length)]
  }

  function takeTurn(lobbyId, turnData){
    // validate turn, ability to make a turn should be confirmed from the request handler
    if(turnData.type == "letter"){

    } else if(turnData.type == "full_guess"){

    }
  }

  function endGame(lobbyId){
    db.query("UPDATE lobbies SET status='results' WHERE id=$id", {
      $id: lobbyId
    });
  }

  export default {
    start: startGame,
    takeTurn: takeTurn,
    end: endGame
  }
}