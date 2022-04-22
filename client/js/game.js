import hangmanCanvas from './hangmanCanvas.js';
import render from './templates.js';
import request from './request.js';
import startTimer from './timer.js';

let wasActive = false;
let gui = null;
window.alphabet = Array.from({ length: 26 }, (v, i) => String.fromCharCode(65 + i));
let endTimeout = () => {};

function displayGame() {
  if (window.isActive === true && wasActive === false) {
    if (window.gameData.rules.turnTime.value !== null) {
      endTimeout = startTimer(window.gameData.rules.turnTime.value, 'turnTimer', () => {
        request.POST(`/api/${window.gameId}/turn`, { type: null, data: null });
        wasActive = false;
      });
    }
    wasActive = true;
  }
  if (window.currentPage !== 'game') {
    if (window.gameData.rules.maxTime.value !== null) {
      // do something
      endTimeout = startTimer(window.gameData.rules.maxTime.value, 'turnTimer', () => {
        request.POST(`/api/${window.gameId}/checkEnd`);
      });
    }
    document.getElementById('page_content').innerHTML = render('game');
    window.currentPage = 'game';
    gui = hangmanCanvas.create(document.getElementById('hangman_canvas'), window.gameData.rules.maxLives.value);
  }
  gui.setLivesUsed(window.gameData.gameStatus.lives_used);
  createInputArea();
  createStatusArea();
}

function takeTurn(turnType, turnData) {
  request.POST(`/api/${window.gameId}/turn`, { type: turnType, data: turnData });
  endTimeout();
}

function createInputArea() {
  const letterInput = document.getElementById('letter_input');
  letterInput.innerHTML = '';
  if (window.gameData.gameStatus.known_letters.includes(' ')) {
    for (const letter of window.alphabet) {
      const letterEl = document.createElement('button');
      letterEl.classList.add('letter');
      letterEl.innerText = letter;
      if (window.gameData.gameStatus.used_letters.includes(letter.toLowerCase())) {
        if (window.gameData.gameStatus.known_letters.includes(letter.toLowerCase())) {
          letterEl.classList.add('success');
        } else {
          letterEl.classList.add('failure');
        }
      } else {
        letterEl.addEventListener('click', () => {
          takeTurn('letter', letter);
        });
      }
      letterInput.appendChild(letterEl);
    }

    const guessInput = document.getElementById('guess_form');
    if (window.gameData.rules.fullGuesses.value) {
      guessInput.addEventListener('submit', (e) => {
        e.preventDefault();
        const guessText = document.querySelector('#guess_form input').value;
        // this.ws.emit("guess", guessText);
        takeTurn('full_guess', guessText);
      });
    } else {
      guessInput.classList.add('hidden');
    }
  } else {
    document.getElementById('guess_form').classList.add('hidden');
  }
}

function createStatusArea() {
  const statusArea = document.getElementById('word_status');
  statusArea.innerHTML = '';
  for (let i = 0; i < window.gameData.gameStatus.known_letters.length; i++) {
    const letterContainer = document.createElement('div');
    letterContainer.classList.add('letter');
    const letterBox = document.createElement('input');
    letterBox.type = 'text';
    letterBox.maxLength = 1;
    letterBox.disabled = true;
    if (window.gameData.gameStatus.known_letters.split('')[i] !== ' ') letterBox.value = window.gameData.gameStatus.known_letters.split('')[i].toUpperCase();
    letterContainer.appendChild(letterBox);
    statusArea.appendChild(letterContainer);
  }
}

export default {
  display: displayGame,
  takeTurn,
};
