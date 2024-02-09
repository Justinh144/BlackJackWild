const User = require ('../../models/User');

const calculateHandValue = (hand) => {
    let handValue = 0;
    hand.forEach((card) => {
        handValue += card.value;
    });
    // console.log(`Hand value: ${handValue}`);
    return handValue;
};

const checkWinner = (playerHand, computerHand) => {
    let outcome;
    const playerHandValue = calculateHandValue(playerHand);
    const computerHandValue = calculateHandValue(computerHand);
    console.log(`player hand value\n`, playerHandValue);
    console.log(`computer hand value\n`,computerHandValue);

    if (playerHandValue > 21) {
        console.log('Player busts! Computer wins.');
        outcome = 'loss';
        return outcome;
    } else if (computerHandValue > 21) {
        console.log('Computer busts! Player wins.');
        outcome = 'win';
        return outcome;
    } else if (playerHandValue === computerHandValue) {
        console.log('It\'s a tie!');
        outcome = 'tie'
        return outcome;
    } else if (playerHandValue > computerHandValue) {
        console.log('Player wins!');
        outcome = 'win';
        return outcome;
    } else {
        console.log('Computer wins!');
        outcome = 'loss';
        return outcome;
    }
};

const calculateNewBalance = (balance, bet, outcome) => {
    try{
        if (outcome === 'win') {
            return balance + bet;
        } else if (outcome === 'loss') {
            return balance - bet;
        } else {
            return balance;
        }

    } catch(err) {
        console.error(`Error calculating new balance: ${err}`);
    }
};

const updatePlayerBalance = async (newBalance, userId) => {
    await User.update({ chipCount: newBalance }, { where: { id: userId } });
    this.playerBalance = newBalance;
}

module.exports = { calculateHandValue, checkWinner, calculateNewBalance, updatePlayerBalance };