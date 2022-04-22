CREATE TABLE IF NOT EXISTS results (
  id CHAR(32) PRIMARY KEY NOT NULL,
  max_lives INTEGER DEFAULT null,
  max_time INTEGER DEFAULT null
);

CREATE TABLE IF NOT EXISTS result_players (
  result_id CHAR(32) REFERENCES results(id),
  name VARCHAR(100) NOT NULL,
  word VARCHAR(50),
  known_letters VARCHAR(50),
  score INTEGER NOT NULL DEFAULT 0,
  time_used INTEGER DEFAULT null,
  lives_used INTEGER DEFAULT null,
  finished BOOLEAN NOT NULL DEFAULT false
);

CREATE TABLE IF NOT EXISTS lobbies (
  id CHAR(8) UNIQUE PRIMARY KEY NOT NULL,
  status VARCHAR(16) NOT NULL CHECK (status IN ("lobby", "game", "results")),
  last_result CHAR(32) REFERENCES results(id),
  end_time INTEGER DEFAULT null
);

CREATE TABLE IF NOT EXISTS rules (
  lobby_id CHAR(8) REFERENCES lobbies(id),
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
  session_id VARCHAR(64) NOT NULL,
  name VARCHAR(32) NOT NULL,
  lobby_id CHAR(8) REFERENCES lobbies(id),
  is_host BOOLEAN NOT NULL,
  is_active BOOLEAN NOT NULL,
  CONSTRAINT unique_name UNIQUE (name, lobby_id)
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
  word VARCHAR(24),
  known_letters VARCHAR(24),
  used_letters VARCHAR(26),
  lives_used INTEGER,
  time_used INTEGER,
  finished BOOLEAN DEFAULT false
);