import render from "./templates.js";
import request from "./request.js";

const ruleData = JSON.parse(await request.GET('/api/rules'));
// temp
const isHost = true;
async function displayLobby(){
  if(window.currentPage != "lobby"){
    document.getElementById("page_content").innerHTML = render("lobby");
    window.currentPage = "lobby";
  }
  constructRules();
}

async function constructRules(){
  const ruleForm = document.getElementById("game_rules");
  ruleForm.innerHTML = "";
  for(const [id, rule] of Object.entries(ruleData)){
    let input = document.createElement("input");
    input.name = id;
    const label = document.createElement("label");
    label.innerText = rule.label;

    if(isHost){
      if((rule.requires != null && ruleData[rule.requires.rule].value != rule.requires.value)) input.disabled = true;
    } else {
      input.disabled = true
    }

    switch(rule.type){
      case "number":
        input.type = "number";
        input.value = rule.value;

        if(rule.minVal != null) input.min = rule.minVal;
        if(rule.maxVal != null) input.max = rule.maxVal;

        if(rule.allowNull == true){
          console.log(rule)
          const oldInput = input;
          const nullBox = input.cloneNode();

          input = document.createElement("div");
          input.classList.add("combined-input");

          nullBox.type = "checkbox";
          nullBox.checked = !(["null", null].includes(rule.value));

          if(isHost){
            let sendDataTimeout = null;
            if(!nullBox.checked) oldInput.disabled = true;
            nullBox.addEventListener("input", (e)=>{
              if(!nullBox.checked) {
                if(sendDataTimeout!= null){
                  clearTimeout(sendDataTimeout);
                }
                // this.ws.emit("setRule", {rule: name, value: null});
              } else {
                // this.ws.emit("setRule", {rule: name, value: oldInput.value});
              };
            });

            oldInput.addEventListener("input", (e)=>{
              if(sendDataTimeout!= null){
                clearTimeout(sendDataTimeout);
              }
              sendDataTimeout = setTimeout(()=>{
                // this.ws.emit("setRule", {rule: name, value: oldInput.value});
              }, 3000)
            });
          }

          oldInput.value = (rule.value == null)? rule.minVal: rule.value;

          input.appendChild(nullBox);
          input.appendChild(oldInput);
        }else {
          if((rule.requires != null && ruleData[rule.requires.rule].value != rule.requires.value)) input.disabled = true;
        }
        break;
      case "boolean":
        input.type = "checkbox";
        input.value = true;
        input.checked = rule.value;
        if(isHost){
          input.addEventListener("input", (e)=>{
            // this.ws.emit("setRule", {rule: name, value: (input.checked)});
          });
        }
        break;
    }

    ruleForm.appendChild(label);
    ruleForm.appendChild(input);
  }
}

export default {
  display: displayLobby
}