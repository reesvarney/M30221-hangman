import request from './request.js';
import render from './templates.js';
import auth from './auth.js';
import lobby from './lobby.js';
import game from './game.js';
import results from './results.js';
import ws from './ws.js';

const query = new URLSearchParams(window.location.search);
const gameId = window.gameId = query.get('id');

async function main() {
  window.ruleData = JSON.parse(await request.GET('/api/rules'));
  if (gameId != null) {
    const wsc = new ws();
    wsc.on('do_update', () => {
      getLobbyData();
    });
    getLobbyData();
  }
  document.querySelector('nav .brand').addEventListener('click', () => {
    // Kind of hacky but tidies up the URL query
    window.history.replaceState(null, null, window.location.pathname);
    window.location.pathname = '/';
  });
  document.addEventListener('keydown', (event) => {
    if (window.currentPage === 'game' && window.alphabet.includes(event.key.toUpperCase()) && document.querySelector('#guess_form input') !== document.activeElement) {
      game.takeTurn('letter', event.key);
    }
  });
}

async function getLobbyData() {
  const data = JSON.parse(await request.GET(`/api/${gameId}`));
  if ('error' in data) {
    console.log('ERROR', data.error);
    window.error = data.error;
    switch (data.error) {
      case 'lobby_not_exist':
        window.location.href = `${window.location.protocol}//${window.location.host}`;
        break;
    }
  } else {
    for (const [id, value] of Object.entries(data.rules)) {
      window.ruleData[id].value = value;
    }
    data.rules = window.ruleData;
    window.gameData = data;
    if (data.playerId == null) {
      auth();
    } else {
      if (Object.fromEntries(data.players.map(a => [a.id, a.is_host]))[data.playerId] == 1) {
        window.isHost = true;
        document.querySelector('body').dataset.host = 'true';
      }
      if (Object.fromEntries(data.players.map(a => [a.id, a.is_active]))[data.playerId] == 1) {
        window.isActive = true;
        document.querySelector('body').dataset.active = 'true';
      } else {
        document.querySelector('body').dataset.active = 'false';
      }
      switch (data.status) {
        case 'lobby':
          lobby.display();
          break;
        case 'game':
          game.display();
          break;
        case 'results':
          results.display();
          break;
      }
      constructPlayerList();
    }
  }
}

function constructPlayerList() {
  document.querySelectorAll('.player-list').forEach((playerGrid) => {
    playerGrid.innerHTML = '';
    for (const player of window.gameData.players) {
      playerGrid.innerHTML += render('player', {
        isClient: player.id == window.gameData.playerId,
        classes: ((player.is_host === 1) ? 'host' : '') + ((player.is_active === 1) ? ' active' : ''),
        name: ((player.is_host) ? "<span class='host-icon'>👑</span>" : '') + player.name,
        id: player.id,
      });
    }
  });
}

window.kickPlayer = async (playerId) => {
  await request.POST(`/api/${window.gameId}/kick_player`, { playerId });
};

main();
