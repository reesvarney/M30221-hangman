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
  }

  function getWord(length){
    return words[length][Math.floor(Math.random()*words[length].length)]
  }

  // check in the request whether the user is authenticated to do this
  async function takeTurn(lobbyId, turn){
    const player_gamestate = (await db.query("SELECT * FROM player_gamestates WHERE lobby_id=$lobby_id AND is_active=true", {
      $lobby_id: lobbyId
    }))[0];
    // validate turn, ability to make a turn should be confirmed from the request handler
    if(turn.type == "letter"){
      if(player_gamestate.used_letters.includes(turn.data)){
        throw("letter already used");
      }
      if(player_gamestate.word.includes(turn.data)){
        for(let i = 0; i < player_gamestate.word.length; i++){
          if(player_gamestate.word[i] == turn.data){
            player_gamestate.known_letters[i] = turn.data;
          }
        }
        db.query("UPDATE player_gamestates SET known_letters=$known_letters, used_letters=$used_letters WHERE player_id=$player_id", {
          $used_letters: player_gamestate.used_letters + turn.data,
          $known_letters: player_gamestate.known_letters,
          $player_id: player_gamestate.player_id
        });
      } else {
        db.query("UPDATE player_gamestates SET lives_used=$lives_used, used_letters=$used_letters WHERE player_id=$player_id", {
          $lives_used: player_gamestate.lives_used + 1,
          $used_letters: player_gamestate.used_letters + turn.data,
          $player_id: player_gamestate.player_id
        })
      }
    } else if(turn.type == "full_guess"){
      if(turn.data.toLowerCase() == player_gamestate.word){
        db.query("UPDATE player_gamestates SET known_letters=$known_letters WHERE player_id=$player_id", {
          $known_letters: player_gamestate.word,
          $player_id: player_gamestate.player_id
        })
      } else {
        db.query("UPDATE player_gamestates SET lives_used=$lives_used WHERE player_id=$player_id", {
          $lives_used: player_gamestate.lives_used + 1,
          $player_id: player_gamestate.player_id
        })
      }
    };
    const turns = true;
    if(turns){
      nextTurn()
    }
  }

  function nextTurn(){

  }

  function getPublicData(lobbyId, playerId){

  }

  function getGameByLobby(lobbyId){

  }

  async function endGame(lobbyId){
    await db.query("UPDATE lobbies SET status='results' WHERE id=$id", {
      $id: lobbyId
    });
  }

  return {
    start: startGame,
    takeTurn: takeTurn,
    getData: getGameByLobby,
    end: endGame
  }
}