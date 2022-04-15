function createHangmanCanvas(element, initMaxLives, size = null) {
  let livesUsed = 0;
  const container = element;
  container.innerHTML = '';
  const display = container.appendChild(document.createElement('canvas'));
  display.width = (size != null) ? size : window.innerWidth;
  display.height = (size != null) ? size : window.innerWidth;
  const context = display.getContext('2d');
  context.fillStyle = '#000';
  context.lineWidth = display.width / 70;
  let maxLives = initMaxLives;

  function setMaxLives(newMax) {
    maxLives = newMax;
    setLivesUsed(livesUsed);
  }

  // Helper functions for canvas drawing
  // Whilst I could use a fixed size with coordinates, this seems to be the best way to allow to scale it to a device
  // If size is set to display width then it will always be able to scale to the right size as it seems to have issues going very large/ small using pure css
  function drawRect(x, y, width, height) {
    return context.fillRect(x * display.width, y * display.height, width * display.width, height * display.height);
  }

  function drawLine(startX, startY, endX, endY) {
    context.beginPath();
    context.moveTo(startX * display.width, startY * display.height);
    context.lineTo(endX * display.width, endY * display.height);
    context.stroke();
  }

  function drawCircle(x, y, radius) {
    context.beginPath();
    context.arc(x * display.width, y * display.height, radius * display.width, 0, 2 * Math.PI);
    context.stroke();
  }

  function setLivesUsed(val) {
    context.clearRect(0, 0, display.width, display.height);
    // Just have the option of -1 for an empty canvas
    if (val !== -1) {
      drawLine(0.1, 0.015, 0.1, 0.98);
      drawLine(0.02, 0.98, 0.2, 0.98);
      drawLine(0.1, 0.02, 0.5, 0.02);
    }


    const percent = val / maxLives;

    let stages = [];
    const getEnd = (start, end, currentStage) => {
      const diff = ((end > start) ? end - start : start - end);
      return (start + (((end > start) ? 1 : -1) * Math.min(((percent - currentStage / stages.length) / (1 / stages.length)) * diff, diff)));
    };

    stages = [
      (stage) => {
        drawLine(0.5, 0.015, 0.5, 0.015 + getEnd(0, 0.1, stage));
      },
      (stage, maxStages) => {
        drawCircle(0.5, 0.2, 0.08);
        if (percent < (stage + 1) / maxStages) {
          context.fillStyle = '#fff';
          drawRect(0.4, 0.29, 0.2, -(0.18 - (0.18 * (percent - (stage / maxStages)) / (1 / maxStages))));
          context.fillStyle = '#000';
        }
      },
      (stage) => {
        drawLine(0.5, 0.28, 0.5, getEnd(0.28, 0.6, stage));
      },
      (stage) => {
        drawLine(0.5, 0.4, getEnd(0.5, 0.4, stage), getEnd(0.4, 0.5, stage));
      },
      (stage) => {
        drawLine(0.5, 0.4, getEnd(0.5, 0.6, stage), getEnd(0.4, 0.5, stage));
      },
      (stage) => {
        drawLine(0.5, 0.6, getEnd(0.5, 0.4, stage), getEnd(0.6, 0.8, stage));
      },
      (stage) => {
        drawLine(0.5, 0.6, getEnd(0.5, 0.6, stage), getEnd(0.6, 0.8, stage));
      },
      () => {
        drawLine(0.47, 0.18, 0.49, 0.22);
        drawLine(0.49, 0.18, 0.47, 0.22);
        drawLine(0.51, 0.18, 0.53, 0.22);
        drawLine(0.53, 0.18, 0.51, 0.22);
      },
    ];

    for (const [stage, func] of stages.entries()) {
      if (percent > stage / stages.length) {
        func(stage, stages.length);
      }
    }

    livesUsed = val;
  }

  return { setMaxLives, setLivesUsed };
}


export default {
  create: createHangmanCanvas,
};
