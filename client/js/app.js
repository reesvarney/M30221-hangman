import request from "./request.js";
const query = new URLSearchParams(window.location.search)
const gameId = query.get('id');
const name = query.get('name');

async function main(){
  if(gameId != null){
    const gameData = request(`/api/game/${gameId}?name=${name}`);
    console.log(gameData);
  }
}
main()