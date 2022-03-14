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
    document.addEventListener('keydown', (event) => {
      console.log(alphabet, event.key);
      if (alphabet.includes(event.key.toUpperCase())) {
        request.POST(`/api/${window.gameId}/turn`, { type: 'letter', data: event.key });
      }
    });
  }
  gui.setLivesUsed(window.gameData.gameStatus.lives_used);
  createInputArea();
  createStatusArea();
}

function createInputArea() {
  const letterInput = document.getElementById('letter_input');
  letterInput.innerHTML = '';
  if (window.gameData.gameStatus.known_letters.includes(' ')) {
    for (const letter of alphabet) {
      const letterEl = document.createElement('button');
      letterEl.classList.add('letter');
      letterEl.innerText = letter;
      if (window.gameData.gameStatus.used_letters.includes(letter.toLowerCase())) {
        if (window.gameData.gameStatus.known_letters.includes(letter.toLowerCase())) {
          letterEl.classList.add('known');
        } else {
          letterEl.classList.add('not-known');
        }
      } else {
        letterEl.addEventListener('click', () => {
          request.POST(`/api/${window.gameId}/turn`, { type: 'letter', data: letter });
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

export default {
  display: displayGame,
};
