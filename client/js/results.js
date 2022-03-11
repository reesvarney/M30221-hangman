import request from './request.js';
import render from './templates.js';

function displayResults() {
  if (window.currentPage !== 'results') {
    document.getElementById('page_content').innerHTML = render('results');
    window.currentPage = 'results';
    if (window.isHost) {
      // host stuff
      document.getElementById('lobby_return').addEventListener('click', () => {
        // send request
      });
    }
  }
  constructPlayerTable();
}

function constructPlayerTable() {
  const playerTable = document.querySelector('#results_table>table>tbody');
  for (const [position, player] of window.gameData.players.entries()) {
    let awardString = '';

    if (position == 0) awardString += '<span title="Winner! Finished with the most points">🏆</span>';
    if (window.gameData.rules.max_lives != null && player.lives_used == 0) awardString += '<span title="Flawless game">🔥</span>';
    if (player.known_letters.trim().length == 0) awardString += '<span title="0 Letters, were you asleep?!">💤</span>';
    if (player.won) awardString += '<span title="Completed the word!">🏁</span>';
    if (player.known_letters.includes(' ') && (player.known_letters.match(/ /g)).length === 1) awardString += '<span title="So close! One letter off">😭</span>';
    if (window.gameData.rules.max_lives - player.lives_used == 1) awardString += '<span title="Close call! Finished with one life remaining">😅</span>';
    if (!player.finished) awardString += '<span title="Time\'s up! Didn\'t manage to finish the game">⏰</span>';

    let wordString = '';
    for (const letter of player.word) {
      const known = player.known_letters.includes(letter.toUpperCase()) ? 'known' : 'not-known';
      wordString += compileTemplate('word_letter', {
        letter: letter.toUpperCase().trim(),
        known,
      });
    }

    playerTable.innerHTML += compileTemplate('player_row', {
      misc: awardString,
      pos: position + 1,
      name: player.name,
      word: wordString,
      time: player.time_used,
      lives: this.data.max_lives - player.lives_used,
      score: player.score,
    });
  }
}

export default {
  display: displayResults,
}