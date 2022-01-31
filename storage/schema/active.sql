
/**
 * Each lobby has:
 * id
 * ruleset
 * turnId
 * hostId
 */
 CREATE TABLE IF NOT EXISTS lobbies (
  id CHAR(32) PRIMARY KEY NOT NULL,

);

/**
 * Each player has:
 * id
 * type: ws/ rest
 * name
 * gameState
 */

 CREATE TABLE IF NOT EXISTS active_players (
 
 )

/**
 * Each gamestate has:
 * score
 * word
 * livesUsed
 * timeUsed
 */

CREATE TABLE IF NOT EXISTS player_gameStates (
  player_id CHAR(32) PRIMARY KEY NOT NULL,
  FOREIGN KEY(player_id) REFERENCES active_players(id)

)

/**
 * Each ruleset has:
 * maxLives
 */

CREATE TABLE IF NOT EXISTS rulesets (
  lobby_id CHAR(32) PRIMARY KEY NOT NULL,
  FOREIGN KEY(lobby_id) REFERENCES lobbies(id)
)

-- RESULTS
