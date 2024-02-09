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
                attributes: ['value', 'cardName', 'filename'],
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

    
};

// const USERID = 200;
// const playerBalance = 10000;
// const betAmountFromUi = 50
// const game = new Game();
// console.log(game.initialize());
// Export the Game class
module.exports = { Game };

