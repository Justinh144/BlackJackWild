const splitBtn = document.querySelector('#split_button');
const hitBtn = document.querySelector('#hit_button');
const dealBtn = document.querySelector('#deal_button');
const doublednBtn = document.querySelector('#doubledn_button');
const stayBtn = document.querySelector('#stay_button');
const chipBtns = document.getElementsByClassName('chips');

const currentWager = document.querySelector('.current_wager');
const playerCard1 = document.querySelector('#card1');
const playerCard2 = document.querySelector('#card2');
const playerCard3 = document.querySelector('#card3');
const playerCard4 = document.querySelector('#card4');
const compCard1 = document.querySelector('#compCard1');
const compCard2 = document.querySelector('#compCard2');
const bankRoll = document.querySelector('.current_bankroll');

const calcHandValue = (hand) => {
    let total = 0;
    hand.forEach((card) => {
        total += card.value;
    });
    return total;
};

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
            hit();
        });
        dealBtn.addEventListener('click', () => {
            deal();
        });
        doublednBtn.addEventListener('click', () => {
            sendDecision('doubledn');
        });
        stayBtn.addEventListener('click', () => {
            stay();
        });
        [...chipBtns].forEach(chip => {
            chip.addEventListener('click', () => {
                const playerBet = parseInt(chip.value);
                // console.log(playerBet);
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

const bust = async () => {
    try {
        await new Promise(resolve => setTimeout(resolve, 3000));
        const response = await fetch("/api/classic/bust", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({}),
        });
        const data = await response.json();
        console.log(data);
        console.log(data.gameState.playerBalance);

        currentWager.textContent = 'Current Wager: $0';
        bankRoll.textContent = 'Bankroll: $' + data.gameState.playerBalance;

        playerCard1.removeAttribute('src');
        playerCard2.removeAttribute('src');
        playerCard3.removeAttribute('src');
        playerCard4.removeAttribute('src');

    } catch (error) {
        console.error("Error:", error);
    }
};


const hit = async () => {
    try { 
        const response = await fetch("/api/classic/hit", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({}),
        });
        const data = await response.json();
        console.log(data);
        console.log(data.gameState.playerHand.length)

        if (data.gameState.playerHand.length !== 2) {
            console.log('newplayercard',data.gameState.playerHand[data.gameState.playerHand.length-1]);
            playerCard3.setAttribute('src', './images/card_images/' + data.gameState.playerHand[data.gameState.playerHand.length-1].filename);
        } 
        // else if (data.gameState.playerHand.length === 4) {
        //     playerCard4.setAttribute('src', './images/card_images/' + data.gameState.playerHand[data.gameState.playerHand.length-1].filename)
        // }


        // else if (data.gameState.playerHand.length = 3){
        //     console.log('newplayercard',data.gameState.playerHand[data.gameState.playerHand.length-1]);
        //     // playerCard3.setAttribute('src', './images/card_images/' + data.gameState.playerHand[data.gameState.playerHand.length-1].filename);
        // }


        // currentWager.textContent = 'Current Wager: $' + data.gameState.playerBet;

        // bankRoll.textContent = 'Bank Roll: $' + data.gameState.playerBalance;
        if (data.message === 'bust') {
            await bust();
        }

    } catch (error) {
        console.error("Error:", error);
    }
}

const deal = async () => {
    try {
        const response = await fetch('/api/classic/deal', {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
        });
        const data = await response.json();
        console.log(data);
        // console.log('data after dealing is\n',data);
        // console.log(data.playerHand[0].filename);

        playerCard1.setAttribute('src', './images/card_images/' + data.gameState.playerHand[0].filename);
        playerCard2.setAttribute('src', './images/card_images/' + data.gameState.playerHand[1].filename);

        
        // compCard1.setAttribute('src', './images/card_images/' + data.computerHand[1].filename);
        // compCard2.setAttribute('src', './images/card_images/' + data.computerHand[1].filename);

    } catch(err) {
        console.log(`Error dealing: ${err}`);
    }
}

const initialize = async () => {
    try {
        const response = await fetch('/api/classic/initialize');
        const data = await response.json();
        console.log(data);

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
        currentWager.textContent = `Current Wager: $${data.gameState.playerBet}`;
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

        // if (decision === 'hit' && data.gameState.handBusts === true) {
            // playerCard1.removeAttribute('src', '');
            // playerCard2.removeAttribute('src', '');
        // }

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

        // if (data.success) {
        //     console.log(data.message);
        // } else {
        //     console.error('Falied to toggle hand:', data.message);
        // }
    } catch (error) {
        console.error('Error toggling hand:', error);
    }
};

const stay = async () => {
    try { 
        const response = await fetch("/api/classic/stay", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({}),
        });
        const data = await response.json();
        console.log(data);

        let playerTotal = 0;
        let computerTotal = 0;
        if (data.stayMessage === 'Dealer bust') {
            await computerBust();
        } else if (data.stayMessage === 'Dealer stay'){
            playerTotal = calcHandValue(data.gameState.playerHand);
            computerTotal = calcHandValue(data.gameState.computerHand);
            console.log(playerTotal);
            console.log(computerTotal);
        }

        if (playerTotal > computerTotal) {
            win();
        } else {
            loss();
        }

    } catch (err) {
        console.error("Error:", err);
    }
};

const computerBust = async () => {
    try {
        await new Promise(resolve => setTimeout(resolve, 3000));
        const response = await fetch("/api/classic/computerbust", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({}),
        });
        const data = await response.json();
        console.log(data);
        // console.log(data.gameState.playerBalance);

        currentWager.textContent = 'Current Wager: $0';
        bankRoll.textContent = 'Bankroll: $' + data.gameState.playerBalance;

        playerCard1.removeAttribute('src');
        playerCard2.removeAttribute('src');
        playerCard3.removeAttribute('src');
        playerCard4.removeAttribute('src');

    } catch (error) {
        console.error("Error:", error);
    }
};

const win = async () => {
    try {
        await new Promise(resolve => setTimeout(resolve, 3000));
        const response = await fetch("/api/classic/win", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({}),
        });
        const data = await response.json();
        console.log(data);
        // console.log(data.gameState.playerBalance);

        currentWager.textContent = 'Current Wager: $0';
        bankRoll.textContent = 'Bankroll: $' + data.gameState.playerBalance;

        playerCard1.removeAttribute('src');
        playerCard2.removeAttribute('src');
        playerCard3.removeAttribute('src');
        playerCard4.removeAttribute('src');

    } catch (error) {
        console.error("Error:", error);
    }
};

const loss = async () => {
    try {
        await new Promise(resolve => setTimeout(resolve, 3000));
        const response = await fetch("/api/classic/loss", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({}),
        });
        const data = await response.json();
        console.log(data);
        // console.log(data.gameState.playerBalance);

        currentWager.textContent = 'Current Wager: $0';
        bankRoll.textContent = 'Bankroll: $' + data.gameState.playerBalance;

        playerCard1.removeAttribute('src');
        playerCard2.removeAttribute('src');
        playerCard3.removeAttribute('src');
        playerCard4.removeAttribute('src');

    } catch (error) {
        console.error("Error:", error);
    }
};