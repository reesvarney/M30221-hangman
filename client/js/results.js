import request from './request.js';
import render from './templates.js';

const page = location.pathname.split('/').filter(a => a.length > 0)[0];
if (page === 'results') {
  main();
}

async function main() {
  window.results = JSON.parse(await request.GET(`/api/results/${location.pathname.split('/').filter(a => a.length > 0)[1]}`));
  constructPlayerTable();
}

async function displayResults() {
  // Handle code a bit differently here so that it can be shared between ingame results and dedicated results

  if (window.currentPage !== 'results') {
    document.getElementById('page_content').innerHTML = render('results');
    window.currentPage = 'results';
    if (window.isHost) {
      // host stuff
      document.getElementById('lobby_return').addEventListener('click', () => {
        // send request
        request.POST(`/api/${window.gameId}/goto_lobby`);
      });
    }
    const resultList = JSON.parse(localStorage.getItem('results') || '[]');
    resultList.push({ id: window.gameData.lastResult, date: Date.now() });
    localStorage.setItem('results', JSON.stringify(resultList));
  }
  window.results = JSON.parse(await request.GET(`/api/results/${window.gameData.lastResult}`));
  constructPlayerTable();
}

function constructPlayerTable() {
  const playerTable = document.querySelector('#results_table>table>tbody');
  playerTable.innerHTML = '';
  for (const [position, player] of window.results.players.entries()) {
    let awardString = '';
    if (position === 0) awardString += '<span title="Winner! Finished with the most points">🏆</span>';
    if (window.results.max_lives != null && player.lives_used === 0) awardString += '<span title="Flawless game">🔥</span>';
    if (player.known_letters.trim().length === 0) awardString += '<span title="0 Letters, were you asleep?!">💤</span>';
    if (player.word === player.known_letters) awardString += '<span title="Completed the word!">🏁</span>';
    if (player.known_letters.includes(' ') && (player.known_letters.match(/ /g)).length === 1) awardString += '<span title="So close! One letter off">😭</span>';
    if (window.results.max_lives - player.lives_used === 1) awardString += '<span title="Close call! Finished with one life remaining">😅</span>';
    if (player.word !== player.known_letters) awardString += '<span title="Time\'s up! Didn\'t manage to finish the game">⏰</span>';

    let wordString = '';
    for (const letter of player.word) {
      const known = player.known_letters.includes(letter.toLowerCase()) ? 'success' : 'failure';
      wordString += render('word_letter', {
        letter: letter.toUpperCase().trim(),
        known,
      });
    }

    playerTable.innerHTML += render('player_row', {
      misc: awardString,
      pos: position + 1,
      name: player.name,
      word: wordString,
      time: player.time_used,
      lives: window.results.max_lives - player.lives_used,
      score: player.score,
    });
  }
}

export default {
  display: displayResults,
};
