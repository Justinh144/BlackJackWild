const splitBtn = document.querySelector('#split_btn');
const hitBtn = document.querySelector('#hit_btn');
const dealBtn = document.querySelector('#deal_btn');
const doublednBtn = document.querySelector('#doubledn_btn');
const stayBtn = document.querySelector('#stay_btn');
const chipBtns = document.getElementsByClassName('chips');

let currentHand = 'splitHand1';
let isUserSplit = false;

document.addEventListener('DOMContentLoaded', async () => {
    try {
        initialize();
        initializeGameUI();
    } catch (err) {
        console.error('Error starting game:', err);
    }
});

const initializeGameUI = () => {
    try {
        splitBtn.addEventListener('click', () => {
            sendDecision('split');
        });
        hitBtn.addEventListener('click', () => {
            sendDecision('hit');
        });
        dealBtn.addEventListener('click', () => {
            sendDecision('deal');
        });
        doublednBtn.addEventListener('click', () => {
            sendDecision('doubledn');
        });
        stayBtn.addEventListener('click', () => {
            sendDecision('stay');
        });
        [...chipBtns].forEach(chip => {
            chip.addEventListener('click', () => {
                const playerBet = parseInt(chip.value);
                console.log(playerBet);
                sendBet(playerBet);
            });
        });
        document.addEventListener('keypress', async (event) => {
            try {
                if (event.key === ' ') {
                    event.preventDefault();
                    // console.log('keypress');
                    await toggleHand();
                } else {
                    console.log('no split occurred');
                }
            } catch (err) {
                console.error('Error toggling hand:', err);
            }
        });

    } catch (err) {
        console.error('Error initializing game UI:', err);
    }
};

const deal = async () => {
    try {
        const response = await fetch('/api/classic/deal', {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
        });
        const data = response.json();
        console.log(data);
    } catch(err) {
        console.log(`Error dealing: ${err}`);
    }
}

const initialize = async () => {
    try {
        const response = await fetch('/api/classic/initialize');
        const data = await response.json();
        console.log('new Game created', data);

    } catch (err) {
        console.error('Error starting game:', err);
    }
}

const sendBet = async (placedBet) => {
    try {
        // await initialize();
        const response = await fetch('/api/classic/bet', {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ placedBet }),
        });
        const data = await response.json();
        console.log(data);
    } catch (error) {
        console.error("Error:", error);
    }
}

function updateChipCount(newChipCount) {
    const chipCountElement = document.querySelector('.chip_count');
    chipCountElement.textContent = newChipCount;
}

const sendDecision = async (decision) => {
    try { 
        const response = await fetch("/api/classic/" + decision, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ decision, currentHand }),
        });
        const data = await response.json();
        console.log(data);

    } catch (error) {
        console.error("Error:", error);
    }
}

const toggleHand = async () => {
    try {
        const response = await fetch('/api/classic/togglehand', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        const data = await response.json();
        console.log(data);

        if (data.success) {
            console.log(data.message);
        } else {
            console.error('Falied to toggle hand:', data.message);
        }
    } catch (error) {
        console.error('Error toggling hand:', error);
    }
};