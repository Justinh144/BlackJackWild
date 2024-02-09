const { User } = require('../models')

const calcHandValue = (hand) => {
    let total = 0;
    hand.forEach((card) => {
        total += card.value;
    });
    return total;
};

const updateDataBaseBalance = async (id, newBalance) => {
        await User.update(
            { chipCount: newBalance },
            { where: { id } }
        );
        const user = await User.findByPk(id);
        // console.log(user);
};

const checkWinner = (playerHand, computerHand)  => {
    let outcome;
    const playerHandValue = calcHandValue(playerHand);
    const computerHandValue = calcHandValue(computerHand);
    // console.log(`player hand value\n`, playerHandValue);
    // console.log(`computer hand value\n`,computerHandValue);

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

const calculateNewBalance = (playerBalance, playerBet, outcome) => {
    try{
        if (outcome === 'win') {
            return playerBalance + playerBet;
        } else if (outcome === 'loss') {
            return playerBalance - playerBet;
        } else {
            return playerBalance;
        }
    } catch(err) {
        console.error(`Error calculating new balance: ${err}`);
    }
};

const isBust = (hand) => {
    const totalValue = calcHandValue(hand);
    return totalValue > 21;
}



module.exports = { calcHandValue, updateDataBaseBalance, checkWinner, calculateNewBalance, isBust };