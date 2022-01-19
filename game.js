export default ({express})=>{
  const router = express.Router();

  router.get('/', (req,res)=>{
    res.sendFile('./client/game.html');
  });
}