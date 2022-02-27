import render from "./templates.js";
import request from "./request.js";
export default ()=>{
  document.getElementById("page_content").innerHTML = render("identity", {createOrJoin: (window.gameData.players.length === 0) ? "Create" : "Join"});
  document.getElementById("identity_form").addEventListener("submit", async(e)=>{
    e.preventDefault();
    const data = new FormData(e.target);
    const success = await request.POST(`/api/${window.gameId}/join`, {
      name: data.get("name")
    });
    console.log(success)
  })
}