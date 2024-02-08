const router = require('express').Router();
const { User, Card } = require('../../models');
const  { Game } = require('../../utils/gameplay/test');
const withAuth = require('../../utils/auth');
// const { deal } = require('../../utils/gameplay/deck_handler');
// const { calculateHandValue, checkWinner, calculateNewBalance, updatePlayerBalance } = require('../../utils/gameplay/scores');
// const { drawComputerCard } = require('../../utils/gameplay/actions');


router.get('/initialize', withAuth, async (req, res) => {
    try {
        const game = new Game(req.session.user_id);
        // console.log(game);
        await game.initialize();


        // console.log('game at initialization', game);

        req.session.game =  game;
        req.session.gameState = {
            deck: game.deck,
            playerBalance: game.playerBalance,
            playerHand: [],
            playerBet: null,
            computerHand: [],
        };
        // console.log(req.session.game);
        
        res.status(200).json(req.session.game);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: `Failed to start game: ${err}` });
    }
});

router.post('/hit', (req, res) => {
    try{
        let playerHand = req.session.gameState.playerHand;
        let deck = req.session.gameState.deck;
        let playerBalance = req.session.gameState.playerBalance;
        let playerBet = req.session.gameState.playerBet;

        const newCard = deck.shift();

        playerHand.push(newCard);
        console.log(playerHand);
        deck.push(newCard);

        let cardValue = 0;
        playerHand.forEach((card) => {
            cardValue += card.value;
        });
        console.log(cardValue);
        if (cardValue > 21) {
            console.log(`You lose! Player busts!`);
            playerBalance -= playerBet;
            playerBet = 0;
        }

        req.session.gameState.playerHand = playerHand;
        req.session.gameState.deck = deck;
        req.session.gameState.playerBalance = playerBalance;
        req.session.gameState.playerBet = playerBet;

        console.log(req.session.gameState);

        console.log('hit route')
        res.status(200).json('success. /hit route hit');
    } catch(err) {
        res.status(500).json({ error: `Failed to hit: ${err}`});
    }
});

router.post('/stay', (req, res) => {
    try{
    
        console.log('stay route')
        res.status(200).json('success. /stay route hit');
    } catch(err) {
        res.status(500).json({ error: `Failed to stay: ${err}`});
    }
});

router.post('/split', (req, res) => {
    try{
        console.log('split route')
        res.status(200).json('success. /split route hit');
    } catch(err) {
        res.status(500).json({ error: `Failed to split: ${err}`});
    }
});

router.post('/doubledn', (req, res) => {
    try{
        console.log('doubledn route')
        res.status(200).json('success. /doubledn route hit');
    } catch(err) {
        res.status(500).json({ error: `Failed to doubledn: ${err}`});
    }
});

router.post('/deal', async (req, res) => {
    try{
        let playerHand = req.session.gameState.playerHand;
        let computerHand = req.session.gameState.computerHand;
        let deck = req.session.gameState.deck;


        const card1 = deck.shift();
        const card2 = deck.shift();
        const card3 = deck.shift();
        const card4 = deck.shift();

        playerHand.push(card1, card3);
        computerHand.push(card2, card4);
        deck.push(card1, card2, card3, card4);

        // console.log(playerHand);
        // console.log(computerHand);
        // console.log(deck);


        req.session.gameState.playerHand = playerHand;
        req.session.gameState.computerHand = computerHand;
        req.session.gameState.deck = deck;

        console.log(req.session.gameState);

        console.log('deal route')
        res.status(200).json('success. /deal route hit');
    } catch(err) {
        res.status(500).json({ error: `Failed to deal: ${err}`});
    }
});


router.post('/bet', async (req, res) => {
    try{
        const { placedBet } = req.body;
        const game = req.session.game;
        // console.log('this is game: /bet route',game);
        if (placedBet < req.session.gameState.playerBalance) {
            req.session.gameState.playerBet = placedBet;
        }
        // console.log(req.session.gameState);

        res.status(200).json(`Success user bets: $${placedBet}`)
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: `Failed posting bet: ${err}`});
    }
});


module.exports = router