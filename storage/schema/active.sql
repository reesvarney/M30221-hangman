 CREATE TABLE IF NOT EXISTS lobbies (
  id CHAR(32) UNIQUE PRIMARY KEY NOT NULL,
  status VARCHAR(16) NOT NULL CHECK (status IN ("lobby", "game", "results"))
);

CREATE TABLE IF NOT EXISTS rules (
  lobby_id CHAR(32) REFERENCES lobbies(id),
  rule_id VARCHAR(16),
  -- Use 1 and 0 for true/ false, can't see any scenario where a standard rule would need to be a string or anything else (except null)
  -- Define constraints in code
  value INTEGER,
  PRIMARY KEY (lobby_id, rule_id)
);

/**
 * Each player has:
 * id
 * type: ws/ rest
 * name
 * gameState
 */

 CREATE TABLE IF NOT EXISTS active_players (
  id CHAR(32) PRIMARY KEY NOT NULL,
  type VARCHAR(10) NOT NULL CHECK (type IN ("ws", "rest")),
  name VARCHAR(32) NOT NULL,
  lobby_id CHAR(32) REFERENCES lobbies(id),
  is_host BOOLEAN NOT NULL,
  is_active BOOLEAN NOT NULL
 );

/**
 * Each gamestate has:
 * score
 * word
 * livesUsed
 * timeUsed
 */

CREATE TABLE IF NOT EXISTS player_gamestates (
  player_id CHAR(32) PRIMARY KEY NOT NULL,
  score INTEGER NOT NULL,
  word VARCHAR(24),
  known_letters VARCHAR(24),
  used_letters VARCHAR(26),
  lives_used INTEGER,
  time_used INTEGER
);