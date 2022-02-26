// Implement a RESTful API for users to interact with the game
// Technically, a client could use this game

export default ({express, lobby})=>{
  const router = express.Router();

  router.get('/game/:id', (req,res)=>{
    // add filter to:
    // players, status, all, rules
  });

  router.get('/game/:id/join', (req,res)=>{
    //joins the game, authorising the user to send inputs
  });

  router.post('/acceptTurn', (req,res)=>{
    // Accepts turn, as we are no longer using websockets to watch disconnects this will make sure that the player is still there
    // Alternatively a client could just send their turn if it is not a human player and it should end the same timeout
  });

  router.post('/game/:id/turn', (req,res)=>{
    //sends an input
  });

  router.post('/game/:id/rule', (req,res)=>{
    //sets a rule
  });

  router.get('/game/new', (req,res)=>{
    const newLobby = lobby.create(req);
    res.redirect(`/game/${newLobby}`);
  });

  return {
    router
  };
}