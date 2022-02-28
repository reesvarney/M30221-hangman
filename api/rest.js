// Implement a RESTful API for users to interact with the game
// Technically, a client could use this game

export default ({express, lobbies})=>{
  const router = express.Router();
  const playerIds = {};

  router.get('/:id', async(req,res)=>{
    // Have authentication status for spectating or name needs submission
    try{
      const data = await lobbies.getData(req.params.id);
      data.authenticated = (Array.isArray(playerIds[req.session.id]) && playerIds[req.session.id].includes(req.params.id));
      res.json(data);
    } catch(err){
      res.json({error: err})
    }

  });

  router.post('/:id/join', async(req,res)=>{
    //joins the game, authorising the user to send inputs
    try{
      const playerId = await lobbies.players.create(req.params.id, {type: "rest", name: req.body.name})
      if(playerIds[req.session.id] === undefined){
        playerIds[req.session.id] = [];
      }
      playerIds[req.session.id].push(req.params.id);
      res.status(200).json(playerId);
    } catch(err){
      res.status(400).json({error: err})
    }

  }); 

  router.get('/:id/poll', async(req, res)=>{

  })

  router.post('/:id/acceptTurn', async(req,res)=>{
    // Accepts turn, as we are no longer using websockets to watch disconnects this will make sure that the player is still there
    // Alternatively a client could just send their turn if it is not a human player and it should end the same timeout
  });

  router.post('/:id/turn', async(req,res)=>{
    //sends an input
  });

  router.post('/:id/rule', async(req,res)=>{
    //sets a rule
  });

  return {
    router
  };
}