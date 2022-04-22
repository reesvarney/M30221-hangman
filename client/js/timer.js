const intervalRate = 0.2;

function startTimer(time, id, cb) {
  const timeout = setTimeout(() => {
    cb();
    end();
  }, (time + intervalRate) * 1000 );
  let displayTime = time + intervalRate;
  const interval = setInterval(() => {
    updateTimers(displayTime, id);
    displayTime -= intervalRate;
  }, intervalRate * 1000);


  function end() {
    window.clearTimeout(timeout);
    window.clearInterval(interval);
    updateTimers(time, id);
  }
  return end;
}

function updateTimers(value, id) {
  const displayElements = document.querySelectorAll(`*[data-timer="${id}"]`);
  for (const element of displayElements) {
    element.innerHTML = `${Math.floor(value / 60)}:${(value % 60).toFixed(2)}`;
  }
}

export default startTimer;
