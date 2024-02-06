const calculateHandValue = (hand) => {
    let handValue = 0;
    hand.forEach((card) => {
        handValue += card.value;
    });
    // console.log(`Hand value: ${handValue}`);
    return handValue;
};

const checkWinner = (playerHand, computerHand) => {
    const playerHandValue = calculateHandValue(playerHand);
    const computerHandValue = calculateHandValue(computerHand);
    console.log(`player hand value\n`, playerHandValue);
    console.log(`computer hand value\n`,computerHandValue);

    if (playerHandValue > 21) {
        console.log('Player busts! Computer wins.');
    } else if (computerHandValue > 21) {
        console.log('Computer busts! Player wins.');
    } else if (playerHandValue === computerHandValue) {
        console.log('It\'s a tie!');
    } else if (playerHandValue > computerHandValue) {
        console.log('Player wins!');
    } else {
        console.log('Computer wins!');
    }
};

module.exports = { calculateHandValue, checkWinner };