const router = require('express').Router();
const { User, Card } = require('../../models');
const  { Game } = require('../../utils/gameplay/test');
const { calcHandValue, updateDataBaseBalance, checkWinner, calculateNewBalance, isBust } = require('../../utils/helpers');
const withAuth = require('../../utils/auth');

router.get('/initialize', withAuth, async (req, res) => {
    try {
        const game = new Game(req.session.user_id);
        await game.initialize();

        console.log('game at initialization', game);

        req.session.game =  game;
        req.session.gameState = {
            deck: game.deck,
            playerBalance: game.playerBalance,
            playerHand: [],
            playerBet: null,
            computerHand: [],
            split: false,
            splitHand1: [],
            splitHand2: [],
            isUserSplitHand1: true,
        };
        
        return res.status(200).json(req.session.game);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: `Failed to start game: ${err}` });
    }
});

router.post('/hit', async (req, res) => {
    try{
        let playerHand = req.session.gameState.playerHand;
        let deck = req.session.gameState.deck;
        let playerBalance = req.session.gameState.playerBalance;
        let computerHand = req.session.gameState.computerHand;
        let playerBet = req.session.gameState.playerBet;
        let splitHand1 = req.session.gameState.splitHand1;
        let splitHand2 = req.session.gameState.splitHand2;
        let isUserSplitHand1 = req.session.gameState.isUserSplitHand1;
        let split = req.session.gameState.split;

        if (playerBet === null || playerBet === undefined || playerBet === 0) {
            return res.status(400).json({ error: 'Please place a bet first' });
        }

        if (split) {
            if ((splitHand1.length === null || splitHand1.length === undefined || splitHand1.length === 0)&&
                (splitHand2.length === null || splitHand2.length === undefined || splitHand2.length === 0)) {

                return res.status(400).json({ error: 'Did not split hands, please try again'});
            }
            let playingHand;
            let bustHand;
            if (isUserSplitHand1) {
                playingHand = splitHand1;
                bustHand = splitHand2;
            } else {
                playingHand = splitHand2;
                bustHand = splitHand1;
            }

            if (playingHand.length === 0) {
                return res.status(400).json({ error: 'You must deal cards for the current hand!' });
            }

            // Draw a new card from the deck
            const newCard = deck.shift();
            playingHand.push(newCard);

            console.log(playingHand);
            deck.push(newCard);

            const total = calcHandValue(playingHand);

            if (total > 21) {
                const newPlayerBalance = calculateNewBalance(playerBalance, playerBet, 'loss');
                await updateDataBaseBalance(req.session.user_id, newPlayerBalance);

                req.session.gameState.playerBalance = newPlayerBalance;
                // req.session.gameState.playerHand = isUserSplitHand1 ? splitHand2 : splitHand1;
                if (isUserSplitHand1) {
                    req.session.gameState.splitHand1 = [];
                } else {
                    req.session.gameState.splitHand2 = [];
                }

                if ((splitHand1.length === 0 || isBust(splitHand1)) && (splitHand2.length === 0 || isBust(splitHand2))) {
                    req.session.gameState.computerHand = [];
                    req.session.gameState.playerBet = 0;
                    req.session.gameState.split = false;
                } else {
                    req.session.gameState.playerBet = playerBet;
                    req.session.gameState.computerHand = computerHand;
                }

                if (req.session.gameState.splitHand1.length === 0 && req.session.gameState.splitHand2.length === 0) {
                    req.session.gameState.isUserSplitHand1 = true;
                } else if (req.session.gameState.splitHand1.length === 0 && req.session.gameState.splitHand2.length !== 0) {
                    req.session.gameState.isUserSplitHand1 = false;
                } else if (req.session.gameState.splitHand2.length === 0 && req.session.gameState.splitHand1.length !== 0) {
                    req.session.gameState.isUserSplitHand1 = true;
                }
                // req.session.gameState.split = false;
                // req.session.gameState.isUserSplitHand1 = true;
                console.log(`You lose! Player busts!`);
                console.log('gameState at user Hit and Bust', req.session.gameState);
            } else {

            }

        } else {

            if (playerHand.length === null || playerHand.length === undefined || playerHand.length === 0) {
                return res.status(400).json({ error: 'You must deal cards!' });
            }

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
                const newPlayerBalance = calculateNewBalance(playerBalance, playerBet, 'loss');
                await updateDataBaseBalance(req.session.user_id, newPlayerBalance);
                console.log(`You lose! Player busts!`);
                playerBalance -= playerBet;
                playerBet = 0;
                req.session.gameState.playerBalance = newPlayerBalance;
                req.session.gameState.playerBet = playerBet;
                req.session.gameState.playerHand = [];
                req.session.gameState.computerHand = [];
                console.log('gameState at user Hit and Bust', req.session.gameState);
            } else {
                req.session.gameState.playerHand = playerHand;
                req.session.gameState.deck = deck;
            } 
        } // end of reg split logic

        console.log('gamestate at end of hit route', req.session.gameState);
        const user = await User.findByPk(req.session.user_id);
        console.log('user at end of hit', user);
        console.log('hit route')
        return res.status(200).json('success. /hit route hit');
    } catch(err) {
        res.status(500).json({ error: `Failed to hit: ${err}`});
    }
});

router.post('/stay', async (req, res) => {
    try{
        let playerHand = req.session.gameState.playerHand;
        let computerHand = req.session.gameState.computerHand;
        let deck = req.session.gameState.deck;
        let playerBalance = req.session.gameState.playerBalance;
        let playerBet = req.session.gameState.playerBet;

        if (playerBet === null || playerBet === undefined || playerBet === 0) {
            return res.status(400).json({ error: 'Please place a bet first' });
        }

        if (playerHand.length === null || playerHand.length === undefined || playerHand.length === 0) {
            return res.status(400).json({ error: 'You must deal cards!' });
        }

        let computerTurn = true;
        while (computerTurn) {
            let newCard = deck.shift();
            computerHand.push(newCard);
            if (calcHandValue(computerHand) > 21) {
                computerTurn = false;
                deck.push(newCard);
                req.session.gameState.computerHand = computerHand;
                console.log('computer hand when > 21',req.session.gameState.computerHand)
                break;
            } else if (calcHandValue(computerHand) >= 17) {
                    computerTurn = false;
                    deck.push(newCard);
                    req.session.gameState.computerHand = computerHand;
                    console.log('computer hand when >= 17',req.session.gameState.computerHand)
                    break;
            } else {
                deck.push(newCard);
                req.session.gameState.computerHand = computerHand;
                console.log('computer hand when < 17, hit again',req.session.gameState.computerHand)
            }
        }

        const outcome = checkWinner(playerHand, computerHand);
        const newPlayerBalance = calculateNewBalance(playerBalance, playerBet, outcome);

        await updateDataBaseBalance(req.session.user_id, newPlayerBalance);

        req.session.gameState.playerBalance = newPlayerBalance;
        req.session.gameState.playerBet = 0;
        req.session.gameState.playerHand = [];
        req.session.gameState.computerHand = [];
        req.session.gameState.deck = deck;
        console.log('end of stay', req.session.gameState);
        console.log('deck length', req.session.gameState.deck.length)
        const user = await User.findByPk(req.session.user_id);
        console.log('user at end of stay', user);

        console.log('stay route')
        return res.status(200).json('success. /stay route hit');
    } catch(err) {
        res.status(500).json({ error: `Failed to stay: ${err}`});
    }
});

router.post('/split', (req, res) => {
    try{
        let playerHand = req.session.gameState.playerHand;
        let deck = req.session.gameState.deck;
        let playerBet = req.session.gameState.playerBet;

        if (playerBet === null || playerBet === undefined || playerBet === 0) {
            return res.status(400).json({ error: 'Please place a bet first' });
        }

        if (playerHand.length === null || playerHand.length === undefined || playerHand.length === 0) {
            return res.status(400).json({ error: 'You must deal cards!' });
        }

        // if (playerHand[0].value !== playerHand[1].value) {
        //     return res.status(400).json({ error: 'You cannot split cards that are not of the same value!' });
        // }

        console.log(playerHand);
        let splitHand1 = [playerHand[0]];
        let splitHand2 = [playerHand[1]];

        const card1 = deck.shift();
        const card2 = deck.shift();

        splitHand1.push(card1);
        splitHand2.push(card2);

        deck.push(card1, card2);

        req.session.gameState.split = true;
        req.session.gameState.playerBet = playerBet;
        req.session.gameState.playerHand = [];
        req.session.gameState.splitHand1 = splitHand1;
        req.session.gameState.splitHand2 = splitHand2;
        req.session.gameState.deck = deck;

        console.log('gamestate afer splitting', req.session.gameState);
        console.log('deck length after splitting', deck.length);

        console.log('split route')
        return res.status(200).json('success. /split route hit');
    } catch(err) {
        res.status(500).json({ error: `Failed to split: ${err}`});
    }
});

router.post('/doubledn', (req, res) => {
    try{
        let playerHand = req.session.gameState.playerHand;
        let playerBalance = req.session.gameState.playerBalance;
        let playerBet = req.session.gameState.playerBet;

        if (playerBet === null || playerBet === undefined || playerBet === 0) {
            return res.status(400).json({ error: 'Please place a bet first' });
        }

        if (playerHand.length === null || playerHand.length === undefined || playerHand.length === 0) {
            return res.status(400).json({ error: 'You must deal cards!' });
        }

        const doubledBet = playerBet * 2;

        if (doubledBet > playerBalance) {
            return res.status(400).json({ error: 'Insufficient funds!' });
        } else {
            req.session.gameState.playerBet = doubledBet;
        }

        console.log('gamestate at end of doubledn', req.session.gameState);

        console.log('doubledn route')
        return res.status(200).json('success. /doubledn route hit');
    } catch(err) {
        res.status(500).json({ error: `Failed to doubledn: ${err}`});
    }
});

router.post('/deal', async (req, res) => {
    try{

        let playerHand = req.session.gameState.playerHand;
        let computerHand = req.session.gameState.computerHand;
        let deck = req.session.gameState.deck;
        let playerBalance = req.session.gameState.playerBalance;
        let playerBet = req.session.gameState.playerBet;

        if (playerBet === null || playerBet === undefined || playerBet === 0) {
            return res.status(400).json({ error: 'Please place a bet first!' });
        }

        if (playerHand.length !== 0 || computerHand.length !== 0) {
            return res.status(400).json({ error: 'You cannot deal more than 2 cards!' });
        }

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

        console.log('gamestate after dealing', req.session.gameState);

        console.log('deal route')
        return res.status(200).json('success. /deal route hit');
    } catch(err) {
        res.status(500).json({ error: `Failed to deal: ${err}`});
    }
});


router.post('/bet', async (req, res) => {
    try{
        const { placedBet } = req.body;
        if (placedBet < req.session.gameState.playerBalance) {
            req.session.gameState.playerBet += placedBet;
        }
        console.log('gamestate after placing bet',req.session.gameState);

        return res.status(200).json(`Success user bets: $${req.session.gameState.playerBet}`)
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: `Failed posting bet: ${err}`});
    }
});

router.post('/togglehand', async (req, res) => {
    try {
        const { gameState } = req.session;
        
        if (gameState.splitHand1.length === 0 || gameState.splitHand2.length === 0) {
            req.session.gameState.isUserSplitHand1 = (gameState.splitHand2.length === 0);
        } else {
            req.session.gameState.isUserSplitHand1 = !req.session.gameState.isUserSplitHand1;
        }

        console.log('Toggled to', req.session.gameState.isUserSplitHand1 ? 'first split hand' : 'second split hand');
        console.log('gamestate after toggling:', req.session.gameState);

        const toggledHand = req.session.gameState.isUserSplitHand1 ? 'first split hand' : 'second split hand';

        res.status(200).json({ success: true, message: `Successfully toggled to ${toggledHand}`});

    } catch(err) {
        res.status(500).json({ success: false, error: `Failed to toggle hand: ${err}`});
    }
});


module.exports = router