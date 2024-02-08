const readlineSync = require('readline-sync');
const { deal } = require('./deck_handler')

const getUserDecision = () => {
    const options = ['Hit', 'Stand'];
    const index = readlineSync.keyInSelect(options, 'Choose your action:');
    return options[index];
};

const hit = () => {
    // player choose to hit - draw card and update hand
};


const stand = () => {
    //player stands - no action
};

const bet = (playerBalance) => {
    try {

        if (betAmount <= 0 || betAmount > playerBalance) {
            return bet(playerBalance);
        }

        console.log(`You've bet $${betAmount}`);
        return betAmount;
    } catch (err) {
        console.error(`Error betting: ${err}`);
    }
};

const drawComputerCard = (deck, hand) => {
    const drawnCards = deal(deck, 1);
    console.log('Computer draws:', drawnCards);
    hand.push(...drawnCards);
    console.log('Computer\'s hand:', hand);
};


module.exports = { bet, getUserDecision, drawComputerCard };