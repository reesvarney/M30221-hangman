import request from "./request.js";
const query = new URLSearchParams(window.location.search)
const gameId = window.gameId = query.get('id');
import auth from "./auth.js";
import lobby from "./lobby.js";
async function main(){
  if(gameId != null){
    getLobbyData();
  }
  document.querySelector("nav .brand").addEventListener("click", ()=>{
    // Kind of hacky but tidies up the URL query
    window.history.replaceState(null, null, window.location.pathname);
    window.location.pathname = "/";
  })
}

async function getLobbyData(){
  const data = JSON.parse(await request.GET(`/api/${gameId}`));
  if("error" in data){
    console.log("ERROR", data.error);
    switch(data.error){
      case "lobby_not_exist":
        window.location.href = `${window.location.protocol}//${window.location.host}`;
        break;
    }
  } else {
    console.log(data)
    window.gameData = data;
    if(!data.authenticated){
      auth(getLobbyData);
    } else {
      switch(data.status){
        case "lobby":
          lobby.display();
          break;
      }
    }
  }
}
main()