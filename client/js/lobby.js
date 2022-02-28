import render from "./templates.js";

function displayLobby(){
  if(window.currentPage != "lobby"){
    document.getElementById("page_content").innerHTML = render("lobby");
    window.currentPage = "lobby";
  }

}

export default {
  display: displayLobby
}