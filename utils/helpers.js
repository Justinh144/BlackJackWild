const { User } = require('../models')

const calcHandValue = (hand) => {
    let total = 0;
    hand.forEach((card) => {
        total += card.value;
    });
    return total;
};

const updateDataBaseBalance = async (id, newBalance, outcome) => {
    try {
        // Update chip count
        await User.update(
            { chipCount: newBalance },
            { where: { id } }
        );

        // Update wins count based on outcome
        if (outcome === 'win') {
            await User.increment('handsWon', { by: 1, where: { id } });
        }

        const user = await User.findByPk(id);
        // console.log(user);
    } catch (err) {
        console.error(`Error updating database balance: ${err}`);
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


const updatePlayerWins = async (id) => {
    try {
        await User.increment('handsWon', { by: 1, where: { id } });
    } catch (err) {
        console.error(`Error updating player's win count: ${err}`);
    }
};



module.exports = { calcHandValue, updateDataBaseBalance, calculateNewBalance, isBust, updatePlayerWins};