const { Card } = require('../models');
const sequelize = require('../config/connection');

const getValue = (card) => {
    if (card === 'Jack' || card === 'Queen' || card === 'King') {
      return 10;
    } else if (card === 'Ace') {
      return 11;
    } else {
    return parseInt(card, 10);
    }
  };
  
const seedDeck = async () => {
    try{
    const suits = ['Hearts', 'Diamonds', 'Clubs', 'Spades'];
    const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'Jack', 'Queen', 'King', 'Ace'];

    const seededCards = [];

    for (const suit of suits) {
      for (const value of values) {
        const cardName = `${value} of ${suit}`;
        const filename = 'filename';  

        const card = {
          cardName,
          filename,
          value: getValue(value),
          suit,
        };

        seededCards.push(card);
      }
    }

    await Card.bulkCreate(seededCards);
    

    console.log('Deck seeded successfully!');
    }catch (err) {
        console.error(`Error seeding deck: ${err}`);
    }
}

const run = async () => {
  await sequelize.sync({ force: true });
  await seedDeck();
  process.exit(0);
};

run();
