// Implement a RESTful API for users to interact with the game
// Technically, a client could use this game

import fs from 'fs/promises';

export default ({ express, lobbies, wss }) => {
  const router = express.Router();

  router.get('/rules', async (req, res) => {
    const rules = await fs.readFile('./game/rules.json');
    res.json(JSON.parse(rules));
  });

  router.get('/:id', async (req, res) => {
    // Have authentication status for spectating or name needs submission
    try {
      const data = await lobbies.getData(req.params.id, req.sessionID);
      res.json(data);
    } catch (err) {
      res.json({ error: err.message });
    }
  });

  router.post('/:id/join', async (req, res) => {
    // joins the game, authorising the user to send inputs
    try {
      await lobbies.players.create(req.params.id, { name: req.body.name, sid: req.sessionID });
      res.sendStatus(200);
      wss.updateClient(req.params.id);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });

  async function checkPlayer(req, res, next) {
    const playerId = await lobbies.players.getId(req.params.id, req.sessionID);
    if (playerId != null) {
      req.playerId = playerId;
      next();
    } else {
      res.status(403);
    }
  }

  async function checkHost(req, res, next) {
    if (await lobbies.players.isHost(req.params.id, req.sessionID)) {
      next();
    } else {
      res.status(403);
    }
  }

  // Checks whether request is coming from the active player, puts the ID into the the req object
  async function checkActive(req, res, next) {
    const playerId = await lobbies.players.isActive(req.params.id, req.sessionID);
    if (playerId != null) {
      req.playerId = playerId;
      next();
    } else {
      res.status(403);
    }
  }

  // router.get('/:id/poll', checkPlayer, async (req, res) => {

  // });

  router.post('/:id/start_game', checkHost, async (req, res) => {
    await lobbies.game.start(req.params.id);
    res.sendStatus(200);
    wss.updateClient(req.params.id);
  });

  // router.post('/:id/accept_turn', checkPlayer, async (req, res) => {
  // Accepts turn, as we are no longer using websockets to watch disconnects this will make sure that the player is still there
  // Alternatively a client could just send their turn if it is not a human player and it should end the same timeout
  // });

  router.post('/:id/turn', checkActive, async (req, res) => {
    // sends an input, todo: need to validate turn
    try {
      await lobbies.game.takeTurn(req.playerId, req.body);
      res.sendStatus(200);
      wss.updateClient(req.params.id);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });

  router.post('/:id/rule', checkHost, async (req, res) => {
    // sets a rule
    try {
      await lobbies.rules.setValue(req.params.id, req.body.rule, req.body.value);
      res.status(200);
      wss.updateClient(req.params.id);
    } catch (err) {
      res.json({ error: err.message });
    }
  });

  router.get('/results/:id', async( req, res)=> {
    try {
      const resultData = await lobbies.game.results.getResult(req.params.id);
      res.json(resultData);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });

  return {
    router,
  };
};
