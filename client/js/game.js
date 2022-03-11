import hangmanCanvas from './hangmanCanvas.js';
import render from './templates.js';
import request from './request.js';

let gui = null;
const alphabet = Array.from({ length: 26 }, (v, i) => String.fromCharCode(65 + i));

function displayGame() {
  if (window.currentPage !== 'game') {
    document.getElementById('page_content').innerHTML = render('game');
    window.currentPage = 'game';
    gui = hangmanCanvas.create(document.getElementById('hangman_canvas'), window.gameData.rules.maxLives.value);
  }
  gui.setLivesUsed(window.gameData.gameStatus.lives_used);
  createInputArea();
  createUsedLetters();
  createStatusArea();
}

function createInputArea() {
  const letterInput = document.getElementById('letter_input');
  letterInput.innerHTML = '';
  if (window.gameData.gameStatus.known_letters.includes(' ')) {
    for (const letter of alphabet) {
      if (!window.gameData.gameStatus.used_letters.includes(letter.toLowerCase())) {
        const letterEl = document.createElement('button');
        letterEl.innerText = letter;
        letterEl.addEventListener('click', () => {
          // takeTurn(letter);
          request.POST(`/api/${window.gameId}/turn`, { type: 'letter', data: letter });
        });
        letterInput.appendChild(letterEl);
      }
    }
    const guessInput = document.getElementById('guess_form');
    if (window.gameData.rules.fullGuesses.value) {
      guessInput.addEventListener('submit', (e) => {
        e.preventDefault();
        const guessText = document.querySelector('#guess_form input').value;
        // this.ws.emit("guess", guessText);
        request.POST(`/api/${window.gameId}/turn`, { type: 'guess', data: guessText });
      });
    } else {
      guessInput.classList.add('hidden');
    }
  } else {
    document.getElementById('guess_form').classList.add('hidden');
  }
}

function createStatusArea() {
  const statusArea = document.querySelector('#hangman_display .word-status');
  statusArea.innerHTML = '';
  for (let i = 0; i < window.gameData.rules.wordLength.value; i++) {
    const letterContainer = document.createElement('div');
    letterContainer.classList.add('letter');
    const letterBox = document.createElement('input');
    letterBox.type = 'text';
    letterBox.maxLength = 1;
    letterBox.disabled = true;
    if (window.gameData.gameStatus.known_letters[i] !== ' ') letterBox.value = window.gameData.gameStatus.known_letters[i].toUpperCase();
    letterContainer.appendChild(letterBox);
    statusArea.appendChild(letterContainer);
  }
}

function createUsedLetters() {
  const usedLetters = document.getElementById('used_letters');
  usedLetters.innerHTML = '';
  for (const letter of window.gameData.gameStatus.used_letters) {
    const letterEl = document.createElement('span');
    letterEl.innerText = letter.toUpperCase();
    usedLetters.appendChild(letterEl);
  }
}

export default {
  display: displayGame,
};
