import render from './templates.js';
import request from './request.js';
export default () => {
  document.getElementById('page_content').innerHTML = render('identity', { createOrJoin: (window.gameData.players.length === 0) ? 'Create' : 'Join' });
  document.querySelector('#identity_form input').addEventListener('input', (e) => {
    if (e.target.value.length > 0) {
      document.querySelector('#identity_form button').disabled = false;
    } else {
      document.querySelector('#identity_form button').disabled = true;
    }
  });
  document.getElementById('identity_form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = new FormData(e.target);
    await request.POST(`/api/${window.gameId}/join`, {
      name: data.get('name'),
    });
  });
};
