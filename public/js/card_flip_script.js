function flipCard() {
    const card = document.querySelector('.card');
    card.classList.toggle('flipped');
  }

  console.log("hello");


const classicBtn = document.querySelector('.lucky-button');

classicBtn.addEventListener('click', () => {
  window.location.replace('/login');
});