const readlineSync = require('readline-sync');
const { calculateHandValue, checkWinner } = require('./scores');
const { createDeck, deal } = require('./deck_handler');
const { bet, getUserDecision, drawComputerCard } = require('./actions');

const inBank = 10000;

const playGame = async () => {
    const newDeck = await createDeck();
    let playerBalance = inBank;

    while (true) {
        const playerBet = bet(playerBalance);

        if (playerBet !== false) {
            let playerHand = deal(newDeck, 2);
            let computerHand = deal(newDeck, 2);

            console.log(`Player's hand`, playerHand);
            console.log(`Computer's hand`, computerHand);

            // User's turn
            let decision = getUserDecision();
            while (decision === 'Hit') {
                playerHand.push(newDeck.pop()); // Draw a card
                console.log('Player\'s hand:', playerHand);

                if (calculateHandValue(playerHand) > 21) {
                    console.log('Bust! You went over 21.');
                    checkWinner(playerHand, computerHand);
                    break;
                }

                decision = getUserDecision();
            }

            // Computer's turn
            console.log('Computer\'s turn:');
            console.log('Computer\'s hand:', computerHand);

            while (calculateHandValue(computerHand) < 17) {
                drawComputerCard(newDeck, computerHand);
            }

            checkWinner(playerHand, computerHand);

        } else {
            console.log('Exiting the game due to insufficient balance.');
            break;
        }

        // Ask if the player wants to play another round
        const playAgain = readlineSync.keyInYNStrict('Do you want to play another round?');
        if (!playAgain) {
            console.log('Exiting the game. Thank you for playing!');
            break;
        }
    }
};

playGame();
