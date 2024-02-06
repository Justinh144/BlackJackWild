const Card = require('../../models/Card');

const createDeck = async () => {
    try{
        const allcards = await Card.findAll({
            attributes: ['value', 'card_name'],
        });
        const formattedCards = allcards.map((card) => card.get({ plain: true }));
        // shuffle them randomly
        const deck = shuffleDeck(formattedCards);
        // console.log(deck);
        return deck;
    } catch(err) {
        console.error(`Error creating new deck: ${err}`);
    }
};

const shuffleDeck = (cards) => {
    try{
    //Fisher-Yates
        const deck = [...cards];

        for (let i = deck.length -1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [deck[i], deck[j]] = [deck[j], deck[i]];
            // console.log(shuffledDeck);
        };

        return deck;
    } catch(err) {
        console.error(`Error shuffling deck: ${err}`);
    }
};


const drawCard = (deck, numOfCards) => {
    try{
        const drawnCards = deck.splice(0, numOfCards);
        // console.log('Drawn cards:', drawnCards);
        deck.push(...drawnCards);
        return drawnCards;
    } catch(err) {
        console.error(`Error drawing card: ${err}`);
    }
};

const deal = (deck, numOfCards) => {
    try{
        return drawCard(deck, numOfCards);
    } catch(err) {
        console.error(`Error dealing: ${err}`);
    }
};

module.exports = { createDeck, deal };