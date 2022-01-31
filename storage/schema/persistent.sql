
CREATE TABLE IF NOT EXISTS results (
  id CHAR(32) PRIMARY KEY NOT NULL,
  max_lives INTEGER DEFAULT null,
  max_time INTEGER DEFAULT null,
  hints BOOLEAN DEFAULT false NOT NULL
);

CREATE TABLE IF NOT EXISTS result_players (
  result_id CHAR(32),
  name VARCHAR(100) NOT NULL,
  word VARCHAR(50),
  known_letters VARCHAR(50),
  score INTEGER NOT NULL DEFAULT 0,
  won BOOLEAN NOT NULL DEFAULT false,
  time_used INTEGER DEFAULT null,
  lives_used INTEGER DEFAULT null,
  finished BOOLEAN NOT NULL DEFAULT false,
  FOREIGN KEY(result_id) REFERENCES results(id)
);