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
const playerCard5 = document.querySelector('#card5');
const compCard1 = document.querySelector('#compCard1');
const compCard2 = document.querySelector('#compCard2');
const compCard3 = document.querySelector('#compCard3');
const compCard4 = document.querySelector('#compCard4');
const compCard5 = document.querySelector('#compCard5');
const bankRoll = document.querySelector('.current_bankroll');
const hideCard = document.querySelector('#hideCard');
const reloadChipBtn = document.querySelector('#reload_button');

let currentHand = 'splitHand1';
let isUserSplit = false;

const calcHandValue = (hand) => {
    let total = 0;
    hand.forEach((card) => {
        total += card.value;
    });
    return total;
};

const showMessage = (message) => {
    const popUp = document.getElementById('pop_up');
    const popUpContent = document.getElementById('pop_up_content');
    popUpContent.textContent = message;
    popUp.style.display = 'block';
    setTimeout(() => {
        popUp.style.opacity = '0';
        setTimeout(() => {
            popUp.style.display = 'none';
            popUp.style.opacity = '1';
        }, 1000);
    }, 3000);
};

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
            // split();
        });
        hitBtn.addEventListener('click', () => {
            hit();
        });
        dealBtn.addEventListener('click', () => {
            deal();
        });
        doublednBtn.addEventListener('click', () => {
            doubleDn();
        });
        stayBtn.addEventListener('click', () => {
            stay();
        });
        [...chipBtns].forEach(chip => {
            chip.addEventListener('click', () => {
                const playerBet = parseInt(chip.value);
                sendBet(playerBet);
            });
        });
        hideCard.removeAttribute('src');
        document.addEventListener('keypress', async (event) => {
            try{
                switch(event.key) {
                    case ' ':
                        event.preventDefault();
                        await toggleHand();
                        break;
                    case 's':
                        stay();
                        break;
                    case 'h':
                        hit();
                        break;
                    case 'd':
                        deal();
                        break;
                    case 'x':
                        doubleDn();
                        break;
                    // case 't':
                        // split();
                        // break;
                    case 'b': 
                        sendBet(100);
                        break;
                    default:
                        console.log('Invalid key press');
                }

            } catch (error) {
                console.error(error);
            }
        });
        // document.addEventListener('keypress', async (event) => {
        //     try {
        //         if (event.key === ' ') {
        //             event.preventDefault();
        //             // console.log('keypress');
        //             await toggleHand();
        //         } else {
        //             console.log('no split occurred');
        //         }
        //     } catch (err) {
        //         console.error('Error toggling hand:', err);
        //     }
        // });
        reloadChipBtn.addEventListener('click',() => {
            reloadChips();
        })


    } catch (err) {
        console.error('Error initializing game UI:', err);
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

        if (data.error) {
            showMessage(data.error);
        } else {
            data.gameState.playerHand.forEach((card, index) => {
                const playerCardSlot = document.getElementById(`card${index + 1}`);
                playerCardSlot.setAttribute('src', `./images/card_images/${card.filename}`);
            });

            if (data.gameState.playerHand.length === 5) {
                if (calcHandValue(data.gameState.playerHand) > 21) {
                    hideCard.removeAttribute('src');
                    loss('You Busted!');
                } else {
                    stay();
                }
            } else if (data.message === 'You Busted!') {
                hideCard.removeAttribute('src');
                loss(data.message);
            } 
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
        if (data.error) {
            showMessage(data.error);
        } else {
            hideCard.setAttribute('src', './images/card_images/card_card_back.png');
    
            document.getElementById('card1').setAttribute('src', './images/card_images/' + data.gameState.playerHand[0].filename);
            document.getElementById('card2').setAttribute('src', './images/card_images/' + data.gameState.playerHand[1].filename);
    
            
            document.getElementById('compCard1').setAttribute('src', './images/card_images/' + data.gameState.computerHand[0].filename);
            document.getElementById('compCard2').setAttribute('src', './images/card_images/' + data.gameState.computerHand[1].filename);
    
    
            if (calcHandValue(data.gameState.playerHand) === 21) {
                blackJack('Blackjack!');
            }
        }

    } catch(err) {
        console.log(`Error dealing: ${err}`);
    }
}

const initialize = async () => {
    try {
        const response = await fetch('/api/classic/initialize');
        const data = await response.json();

    } catch (err) {
        console.error('Error starting game:', err);
    }
}

const sendBet = async (placedBet) => {
    try {
        const response = await fetch('/api/classic/bet', {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ placedBet }),
        });
        const data = await response.json();
        currentWager.textContent = `Current Wager: $${data.gameState.playerBet}`;
        bankRoll.textContent = `Bankroll : $${data.gameState.playerBalance - data.gameState.playerBet}`

        if (data.error) {
            showMessage(data.error)
        }
    } catch (error) {
        console.error("Error:", error);
    }
}

const doubleDn = async () => {
    try { 
        const response = await fetch("/api/classic/doubledn", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({}),
        });
        const data = await response.json();
        if (data.error) {
            return showMessage(data.error);
        } 

        hideCard.removeAttribute('src');
        playerCard3.setAttribute('src', './images/card_images/' + data.gameState.playerHand[2].filename);
        currentWager.textContent = `Current Wager: $${data.gameState.playerBet}`;
        bankRoll.textContent = `Bankroll: $${data.gameState.playerBalance - data.gameState.playerBet}`;
    
            if (data.message === 'bust') {
                loss('You Busted!')
            } else if (data.message = 'stay'){
                stay();
            }
    } catch (error) {
        console.error("Error:", error);
    }
}

const split = async () => {
    try { 
        const response = await fetch("/api/classic/split", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({}),
        });
        const data = await response.json();

        if (data.error) {
            showMessage(data.error)
        }


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

        // if (data.success) {
        //     console.log(data.message);
        // } else {
        //     console.error('Falied to toggle hand:', data.message);
        // }
    } catch (error) {
        console.error('Error toggling hand:', error);
    }
};

const drawComputerCard = async () => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    try {
        const response = await fetch("/api/classic/drawcomputercard", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({}),
        });
        const data = await response.json();

        data.gameState.computerHand.forEach((card, index) => {
            const compCardSlot = document.getElementById(`compCard${index + 1}`);
            compCardSlot.setAttribute('src', `./images/card_images/${card.filename}`);
        });

        let playerTotal;
        let computerTotal;
        if (calcHandValue(data.gameState.computerHand) < 16){
            drawComputerCard();
        } else {
            hideCard.removeAttribute('src');
            playerTotal = calcHandValue(data.gameState.playerHand);
            computerTotal = calcHandValue(data.gameState.computerHand);
            if(computerTotal > 21) {
                computerBust();
            } else if (playerTotal > computerTotal) {
                win('You Win!');
            } else if (playerTotal === computerTotal) {
                push('Push');
            } else if (playerTotal < computerTotal && computerTotal <= 21) {
                loss('You Lost!');
            }
        }
    } catch(error) {
        console.error(error);
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

        if (data.error) {
            showMessage(data.error) 
        } else {
            data.gameState.computerHand.forEach((card, index) => {
                const compCardSlot = document.getElementById(`compCard${index + 1}`);
                compCardSlot.setAttribute('src', `./images/card_images/${card.filename}`);
            });
        
            hideCard.removeAttribute('src');
    
            let playerTotal = 0;
            let computerTotal = 0;
            if (data.stayMessage === 'Dealer stay' || data.gameState.playerHand.length === 5){
                playerTotal = calcHandValue(data.gameState.playerHand);
                computerTotal = calcHandValue(data.gameState.computerHand);
                if (playerTotal > computerTotal) {
                    console.log('player wins');
                    win('You Win!');
                } else if (playerTotal === computerTotal) {
                    console.log('push');
                    push('Push');
                } else if (playerTotal < computerTotal) {
                    console.log('player loses');
                    loss('You Lost!');
                }
            } else if (data.stayMessage === 'Dealer hit'){
                drawComputerCard();
            } 
        }

    } catch (err) {
        console.error("Error:", err);
    }
};

const computerBust = async () => {
    try {
        const response = await fetch("/api/classic/computerbust", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({}),
        });
        const data = await response.json();
        win('Opponent Busts!');

    } catch (error) {
        console.error("Error:", error);
    }
};

const win = async (message) => {
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
        showMessage(message);

        currentWager.textContent = 'Current Wager: $0';
        bankRoll.textContent = 'Bankroll: $' + data.gameState.playerBalance;

        playerCard1.removeAttribute('src');
        playerCard2.removeAttribute('src');
        playerCard3.removeAttribute('src');
        playerCard4.removeAttribute('src');
        playerCard5.removeAttribute('src');

        compCard1.removeAttribute('src');
        compCard2.removeAttribute('src');
        compCard3.removeAttribute('src');
        compCard4.removeAttribute('src');
        compCard5.removeAttribute('src');

        hideCard.removeAttribute('src');

    } catch (error) {
        console.error("Error:", error);
    }
};

const loss = async (message) => {
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
        showMessage(message);

        currentWager.textContent = 'Current Wager: $0';
        bankRoll.textContent = 'Bankroll: $' + data.gameState.playerBalance;

        playerCard1.removeAttribute('src');
        playerCard2.removeAttribute('src');
        playerCard3.removeAttribute('src');
        playerCard4.removeAttribute('src');
        playerCard5.removeAttribute('src');

        compCard1.removeAttribute('src');
        compCard2.removeAttribute('src');
        compCard3.removeAttribute('src');
        compCard4.removeAttribute('src');
        compCard5.removeAttribute('src');

        hideCard.removeAttribute('src');


    } catch (error) {
        console.error("Error:", error);
    }
};

const push = async (message) => {
    try {
        await new Promise(resolve => setTimeout(resolve, 3000));
        const response = await fetch("/api/classic/push", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({}),
        });
        const data = await response.json();
        showMessage(message);

        playerCard1.removeAttribute('src');
        playerCard2.removeAttribute('src');
        playerCard3.removeAttribute('src');
        playerCard4.removeAttribute('src');
        playerCard5.removeAttribute('src');

        compCard1.removeAttribute('src');
        compCard2.removeAttribute('src');
        compCard3.removeAttribute('src');
        compCard4.removeAttribute('src');
        compCard5.removeAttribute('src');

        currentWager.textContent = 'Current Wager: $0';
        bankRoll.textContent = 'Bankroll: $' + data.gameState.playerBalance;

        hideCard.removeAttribute('src');

    } catch (error) {
        console.error("Error:", error);
    }
};

const blackJack = async (message) => {
    try {
        await new Promise(resolve => setTimeout(resolve, 3000));
        const response = await fetch("/api/classic/blackjack", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({}),
        });
        const data = await response.json();
        showMessage(message);

        playerCard1.removeAttribute('src');
        playerCard2.removeAttribute('src');
        playerCard3.removeAttribute('src');
        playerCard4.removeAttribute('src');
        playerCard5.removeAttribute('src');

        compCard1.removeAttribute('src');
        compCard2.removeAttribute('src');
        compCard3.removeAttribute('src');
        compCard4.removeAttribute('src');
        compCard5.removeAttribute('src');

        currentWager.textContent = 'Current Wager: $0';
        bankRoll.textContent = 'Bankroll: $' + data.gameState.playerBalance;

        hideCard.removeAttribute('src');

    } catch (error) {
        console.error("Error:", error);
    }
};

const reloadChips =async () => {
    try{
        const response = await fetch("/api/classic/reload", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({}),
        });
        const data = await response.json();
        if (data.error) {
            showMessage(data.error);
        } else {
            bankRoll.textContent = `Bankroll: $${data.gameState.playerBalance}`;
        }
    }catch (error) {
        console.log(error)
    }
};