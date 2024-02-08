const readlineSync = require('readline-sync');
const { checkWinner, calculateNewBalance } = require('./scores');
const { createDeck, deal } = require('./deck_handler');
const { bet, getUserDecision, drawComputerCard } = require('./actions');
const { User } = require('../../models');

class Game {
    constructor(userId) {
        this.deck = null;
        this.userId = userId;
        this.playerBalance = 0;
    }

    async initialize() {
        if (!this.deck) {
            this.deck = await createDeck();

            const user = await User.findByPk(this.userId);
            // console.log(user);
            if (user) {
                this.playerBalance = user.chipCount || 0;
            }
        }
    }

    async startRound() {
    
        let continueGame = true;
        while (continueGame) {
            const playerBet = bet(this.playerBalance);
    
            if (playerBet !== false) {
                let playerHand = deal(this.deck, 2);
                let computerHand = deal(this.deck, 2);

    
                console.log(`Player's hand:`, playerHand);
                console.log(`Computer's hand:`, computerHand);
    
                let decision = getUserDecision();
                while (decision === 'Hit') {
                    playerHand.push(this.deck.pop());
                    console.log('Player\'s hand:', playerHand);
    
                    if (calculateHandValue(playerHand) > 21) {
                        console.log('Bust! You went over 21.');
                        checkWinner(playerHand, computerHand);
                        break;
                    }
    
                    decision = getUserDecision();
                }
    
                console.log(`Computer's turn:`);
                console.log(`Computer's hand:`, computerHand);
    
                while (calculateHandValue(computerHand) < 17) {
                    drawComputerCard(this.deck, computerHand);
                }
    
                let outcome = checkWinner(playerHand, computerHand);
    
                const newBalance = calculateNewBalance(this.playerBalance, playerBet, outcome);
                await this.updatePlayerBalance(newBalance);
    
                continueGame = await this.askPlayAgain();
            } else {
                console.log('Exiting the game due to insufficient balance.');
                continueGame = false;
            }
        }
    }

    async updatePlayerBalance(newBalance) {
        await User.update({ chipCount: newBalance }, { where: { id: this.userId } });
        this.playerBalance = newBalance;
    }

    async askPlayAgain() {
        return new Promise((resolve) => {
            const playAgain = readlineSync.keyInYNStrict('Do you want to play another round?');
            resolve(playAgain);
        });
    };
}


// module.exports = { Game };

// const game = new Game(1);
// const hand = [{ value: 1 }, { value:2 }];
// const handValue = game.calculateHandValue(hand);
// console.log('Hand value:', handValue);