import render from './templates.js';
import request from './request.js';
// temp
function displayLobby() {
  if (window.currentPage !== 'lobby') {
    document.getElementById('page_content').innerHTML = render('lobby');
    window.currentPage = 'lobby';
    if (window.isHost) {
      document.getElementById('start_btn').addEventListener('click', () => {
        request.POST(`/api/${window.gameId}/start_game`);
      });
    }
  }
  constructRules();
  if (window.isHost) {
    const ruleForm = document.getElementById('game_rules');

    ruleForm.addEventListener('submit', (e) => {
      e.preventDefault();
    });
  }
}

function constructRules() {
  const ruleForm = document.getElementById('game_rules');
  ruleForm.innerHTML = '';
  for (const [id, rule] of Object.entries(window.gameData.rules)) {
    let input = document.createElement('input');
    input.name = id;
    const label = document.createElement('label');
    label.innerText = rule.name;
    let sendDataTimeout = null;

    if (window.isHost) {
      if (rule.requires !== undefined) {
        for (const [reqName, reqValue] of Object.entries(rule.requires)) {
          if (reqValue !== ((typeof reqValue === 'boolean') ? Boolean(window.gameData.rules[reqName].value) : window.gameData.rules[reqName].value)) {
            input.disabled = true;
            break;
          }
        }
      }
    } else {
      input.disabled = true;
    }

    switch (rule.type) {
      case 'number':
        input.type = 'number';
        input.value = rule.value;

        if (rule.minVal != null) input.min = rule.minVal;
        if (rule.maxVal != null) input.max = rule.maxVal;

        if (rule.allowNull === true) {
          const oldInput = input;
          const nullBox = input.cloneNode();

          input = document.createElement('div');
          input.classList.add('combined-input');

          nullBox.type = 'checkbox';
          nullBox.checked = !(['null', null].includes(rule.value));

          if (window.isHost) {
            if (!nullBox.checked) oldInput.disabled = true;
            nullBox.addEventListener('input', () => {
              if (!nullBox.checked) {
                if (sendDataTimeout != null) {
                  clearTimeout(sendDataTimeout);
                }
                // this.ws.emit("setRule", {rule: name, value: null});
                request.POST(`/api/${window.gameId}/rule`, {
                  rule: id,
                  value: null,
                });
              } else {
                // this.ws.emit("setRule", {rule: name, value: oldInput.value});
                request.POST(`/api/${window.gameId}/rule`, {
                  rule: id,
                  value: oldInput.value,
                });
              }
            });

            oldInput.addEventListener('input', () => {
              if (sendDataTimeout != null) {
                clearTimeout(sendDataTimeout);
              }
              sendDataTimeout = setTimeout(() => {
                // this.ws.emit("setRule", {rule: name, value: oldInput.value});
                request.POST(`/api/${window.gameId}/rule`, {
                  rule: id,
                  value: oldInput.value,
                });
              }, 500);
            });
          }

          oldInput.value = (rule.value == null) ? rule.minVal : rule.value;

          input.appendChild(nullBox);
          input.appendChild(oldInput);
        } else {
          if (rule.requires !== undefined) {
            for (const [reqName, reqValue] of Object.entries(rule.requires)) {
              if (reqValue !== (typeof reqValue === 'boolean') ? Boolean(window.gameData.rules[reqName].value) : window.gameData.rules[reqName].value) {
                input.disabled = true;
                break;
              }
            }
          }
          input.addEventListener('input', () => {
            if (sendDataTimeout != null) {
              clearTimeout(sendDataTimeout);
            }
            sendDataTimeout = setTimeout(() => {
              // this.ws.emit("setRule", {rule: name, value: oldInput.value});
              request.POST(`/api/${window.gameId}/rule`, {
                rule: id,
                value: input.value,
              });
            }, 500);
          });
        }
        break;
      case 'boolean':
        input.type = 'checkbox';
        input.value = true;
        input.checked = rule.value;
        if (window.isHost) {
          input.addEventListener('input', () => {
            // this.ws.emit("setRule", {rule: name, value: (input.checked)});
            request.POST(`/api/${window.gameId}/rule`, {
              rule: id,
              value: (input.checked),
            });
          });
        }
        break;
    }

    ruleForm.appendChild(label);
    ruleForm.appendChild(input);
  }
}

export default {
  display: displayLobby,
};
