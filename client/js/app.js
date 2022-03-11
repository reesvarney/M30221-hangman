import request from "./request.js";
const query = new URLSearchParams(window.location.search)
const gameId = window.gameId = query.get('id');
import auth from "./auth.js";
import lobby from "./lobby.js";
import game from "./game.js";
import results from "./results.js";
import ws from "./ws.js";
const ruleData = JSON.parse(await request.GET('/api/rules'));

async function main(){
  if(gameId != null){
    const wsc = new ws();
    wsc.on("do_update", ()=>{
      getLobbyData();
    })
    getLobbyData();
  }
  document.querySelector("nav .brand").addEventListener("click", ()=>{
    // Kind of hacky but tidies up the URL query
    window.history.replaceState(null, null, window.location.pathname);
    window.location.pathname = "/";
  })
}

async function getLobbyData(){
  console.log("getting data");
  const data = JSON.parse(await request.GET(`/api/${gameId}`));
  if("error" in data){
    console.log("ERROR", data.error);
    switch(data.error){
      case "lobby_not_exist":
        window.location.href = `${window.location.protocol}//${window.location.host}`;
        break;
    }
  } else {
    console.log(data);
    for(const [id, value] of Object.entries(data.rules)){
      ruleData[id].value = value;
    }
    data.rules = ruleData;
    window.gameData = data;
    if(data.playerId == null){
      auth();
    } else {
      if(Object.fromEntries(data.players.map(a=>[a.id, a.is_host]))[data.playerId] == 1){
        window.isHost = true;
        document.querySelector("body").dataset.host = "true";
      }
      switch(data.status){
        case "lobby":
          lobby.display();
          break;
        case "game":
          game.display();
          break;
        case "results":
          results.display();
          break;
      }
      constructPlayerList();
    }
  }
}

function constructPlayerList(){
  document.querySelectorAll(".player-list").forEach((playerGrid)=>{
    playerGrid.innerHTML = "";
    for(const player of window.gameData.players){
      const playerEl = document.createElement("div");
      playerEl.classList.add("player");
      if(player.is_host){
        const hostIcon = document.createElement("span");
        hostIcon.innerText = "👑";
        playerEl.appendChild(hostIcon);
        playerEl.classList.add("host");
      }
      console.log(player.id, window.gameData.playerId)
      if(player.id == window.gameData.playerId){
        playerEl.setAttribute("is-client", true);
      }
      const playerName = document.createElement("span");
      playerName.innerText = player.name;
      playerEl.appendChild(playerName);
      playerGrid.appendChild(playerEl);
    }
  });
}
main()