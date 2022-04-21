import render from './templates.js';

const errorData = {
  name_short: {
    name: 'Name is too short',
    desc: 'Please ensure name is longer than 1 character.',
  },
  player_creation: {
    name: 'Could not create the player',
    desc: 'Try changing your name or joining a different game.',
  },
  rule_type: {
    name: 'Submitted rule value is of wrong type',
    desc: 'The server was expecting a different type of data for this rule, please refresh the page and try again.',
  },
  rule_small: {
    name: 'Submitted rule value is too small',
    desc: 'The server was expecting a larger value, please refresh the page and try again.',
  },
  rule_large: {
    name: 'Submitted rule value is too large',
    desc: 'The server was expecting a larger value, please refresh the page and try again.',
  },
  lobby_singleplayer: {
    name: 'Game is singleplayer',
    desc: 'The game you are trying to join is set to be singleplayer only, tell the host to enable the multiplayer rule or join another lobby.',
  },
  lobby_max_players: {
    name: 'Max players reached',
    desc: 'The game you are trying to join has reached the max number of players, tell the host to increase the max players rule or join another lobby.',
  },
  lobby_not_exist: {
    name: 'Game does not exist',
    desc: 'The game you are trying to join does not exist, please check the game ID in the URL bar.',
  },
  no_lobbies: {
    name: 'No games available',
    desc: 'There are no games available for you to join at this moment, please wait and try again or create a new game.',
  },
  letter_used: {
    name: 'Letter already used',
    desc: 'You have already used that letter, please try another.',
  },
  guess_not_allowed: {
    name: 'Guesses not allowed',
    desc: 'Full guesses are not allowed in this game, please try entering a letter instead.',
  },
  guess_length: {
    name: 'Guess is wrong length',
    desc: 'The guess you have entered is the incorrect length, please check you have spelt it correctly.',
  },
};

function createError(data) {
  const errorArea = document.getElementById('error_area');
  errorArea.insertAdjacentHTML('afterbegin', render('error', (typeof data === 'string') ? errorData[data] : data));
}

const urlSearchParams = new URLSearchParams(window.location.search);
const params = Object.fromEntries(urlSearchParams.entries());
if (params.error !== undefined) {
  createError(params.error);
  window.history.pushState({}, document.title, window.location.pathname);
}

export default {
  create: createError,
  data: errorData,
};
