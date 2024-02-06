const Game = require('../../utils/gameplay/blackjack.js');

const classicBtn = document.querySelector('#classic-btn');

classicBtn.addEventListener('click', () => {
  document.location.replace('/classic')
  .then(() => {
    const game = new Game();
    game.startRound();
  })
});

