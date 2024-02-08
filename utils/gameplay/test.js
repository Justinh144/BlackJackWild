const { User, Card } = require('../../models');

// Define the Game class
class Game {
    constructor(userId) {
        this.deck = null;
        this.userId = userId;
        this.playerBalance = 0;
    }

    // creates deck if one does not exist, shuffles and returns the deck
    async initialize() {
        try {
            if (!this.deck) {
                this.deck = await this.createDeck();

                const user = await User.findByPk(this.userId);
                // console.log(user);
                if (user) {
                    this.playerBalance = user.chipCount || 0;
                }
            }
        } catch(err) {
            console.log(`Error initializing: ${err}`);
        }  
    }

    async createDeck() {
        try{
            const allcards = await Card.findAll({
                attributes: ['value', 'card_name'],
            });
            // console.log(allcards)
            const formattedCards = allcards.map((card) => card.get({ plain: true }));
            // shuffle them randomly
            const deck = await this.shuffleDeck(formattedCards);
            // console.log(deck);
            return deck;
        } catch(err) {
            console.error(`Error creating new deck: ${err}`);
        }
    };

    async shuffleDeck(cards) {
        try{
            const deck = [...cards];
    
            for (let i = deck.length -1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [deck[i], deck[j]] = [deck[j], deck[i]];
            };
            // console.log(deck);
            return deck;
        } catch(err) {
            console.error(`Error shuffling deck: ${err}`);
        }
    };

    bet(playerBalance, betAmount) {
        if (betAmount <= playerBalance) {
            this.playerBet = betAmount;
            // console.log(game);
            return betAmount;
        } else {
            console.log('Invalid bet amount. Please enter valid bet.');
            return false;
        }
    };

    async deal() {
        try {
            this.playerHand = [];
            this.computerHand = [];
            
            this.playerHand.push(this.deck.shift());

            this.computerHand.push(this.deck.shift());

            this.playerHand.push(this.deck.shift());

            this.computerHand.push(this.deck.shift());
        } catch(err) {
            console.error(`Error dealing cards: ${err}`);
        }
    };

    async hit() {
        try {
            console.log('hit method');
            const newCard = this.deck.shift();
            this.playerHand.push(newCard);
            this.deck.push(newCard);
            // console.log(`player drew:`, newCard);

            const playerHandValue = this.calculateHandValue(this.playerHand);
            if (playerHandValue > 21) {
                console.log(`player busts! over 21`);
                return true;
            } else {
                return false;
            }

        }catch(err) {
            console.log(`Error hitting: ${err}`);
        }
    };

    // async stay() {
    //     try{
    //         await this.dealerTurn();
    //     } catch(err) {
    //         console.log(`Error staying: ${err}`);
    //     }
    // }

    // // async doubledn() {

    // // }

    // // async split() {

    // // }

    // async calculateHandValue(hand) {
    //     let handValue = 0;
    //     hand.forEach((card) => {
    //         handValue += card.value;
    //     });
    //     // console.log(`Hand value: ${handValue}`);
    //     return handValue;
    // };

    // // async checkBlackJack(hand) {

    // // }

    // async dealerTurn() {
    //     try{
    //         console.log(await this.calculateHandValue(this.computerHand));
    //         while (await this.calculateHandValue(this.computerHand) < 17) {
    //             const drawnCard = this.deck.splice(0, 1)[0];
    //             // console.log('Drawn cards:', drawnCard);
    //             this.computerHand.push({...drawnCard});
    //             this.deck.push({drawnCard});
    //         }
    
    //         if (await this.calculateHandValue(this.computerHand) > 21) {
    //             console.log(`Dealer busts!`);
    //             return true;
    //         } else {
    //             console.log(`Dealer stays.`);
    //             return false;
    //         }
    //     } catch(err) {
    //         console.log(`Error taking dealerturn: ${err}`);
    //     }
    // }

    // async checkWinner (playerHand, computerHand) {
    //     let outcome;
    //     const playerHandValue = calculateHandValue(playerHand);
    //     const computerHandValue = calculateHandValue(computerHand);
    //     console.log(`player hand value\n`, playerHandValue);
    //     console.log(`computer hand value\n`,computerHandValue);
    
    //     if (playerHandValue > 21) {
    //         console.log('Player busts! Computer wins.');
    //         outcome = 'loss';
    //         return outcome;
    //     } else if (computerHandValue > 21) {
    //         console.log('Computer busts! Player wins.');
    //         outcome = 'win';
    //         return outcome;
    //     } else if (playerHandValue === computerHandValue) {
    //         console.log('It\'s a tie!');
    //         outcome = 'tie'
    //         return outcome;
    //     } else if (playerHandValue > computerHandValue) {
    //         console.log('Player wins!');
    //         outcome = 'win';
    //         return outcome;
    //     } else {
    //         console.log('Computer wins!');
    //         outcome = 'loss';
    //         return outcome;
    //     }
    // };

    // // async resetGame() {

    // // }

    // // async endGame() {

    // // }

    // async updatePlayerBalance(newBalance) {
    //     await User.update({ chipCount: newBalance }, { where: { id: this.userId } });
    //     this.playerBalance = newBalance;
    // };

};

// const USERID = 200;
// const playerBalance = 10000;
// const betAmountFromUi = 50
// const game = new Game();
// console.log(game.initialize());
// Export the Game class
module.exports = { Game };

