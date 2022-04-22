import render from './templates.js';
import './error.js';

function displayRecentResults() {
  const results = (JSON.parse(localStorage.getItem('results') || '[]')).slice(-5).reverse();
  const resultList = document.getElementById('home_results');
  console.log(results);
  if (results.length === 0) {
    resultList.innerHTML += 'No results could be found';
  } else {
    for (const { id, date } of results) {
      const dateString = new Date(date).toLocaleString('en-gb', { month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true });
      resultList.innerHTML += render('result', { id, date: dateString });
    }
  }
}

displayRecentResults();
