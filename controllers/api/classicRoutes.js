const router = require('express').Router();
const { User, Card } = require('../../models');
const  { Game } = require('../../utils/gameplay/test');
const { calcHandValue, updateDataBaseBalance, checkWinner, calculateNewBalance, isBust, updatePlayerWins } = require('../../utils/helpers');
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
            handBusts: false,
            
        };
        
        return res.status(200).json({message: 'new Game created', game: req.session.game, gameState: req.session.gameState});
    } catch (err) {
        // console.error(err);
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
        let handBusts = req.session.gameState.handBusts;

        if (playerBet === null || playerBet === undefined || playerBet === 0) {
            return res.status(400).json({ error: 'Please place a bet first' });
        }
        if (calcHandValue(playerHand) > 21 || calcHandValue(playerHand) === 21 || playerHand.length > 5) {
            return res.status(400).json({ error: 'You cannot hit again!'});
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

            const newCard = deck.shift();
            playingHand.push(newCard);

            console.log(playingHand);
            deck.push(newCard);

            const total = calcHandValue(playingHand);

            if (total > 21) {
                const newPlayerBalance = calculateNewBalance(playerBalance, playerBet, 'loss');
                await updateDataBaseBalance(req.session.user_id, newPlayerBalance);

                req.session.gameState.handBusts = true;

                req.session.gameState.playerBalance = newPlayerBalance;
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
                console.log(`You lose! Player busts!`);
                console.log('gameState at user Hit and Bust', req.session.gameState);
            } else {

            }

        } else {
            if (calcHandValue(playerHand) > 21 || calcHandValue(playerHand) === 21 || playerHand.length > 5) {
                return res.status(400).json({ error: 'You cannot hit again!'});
            }

            if (playerHand.length === null || playerHand.length === undefined || playerHand.length === 0) {
                return res.status(400).json({ error: 'You must deal cards!' });
            }

            const newCard = deck.shift();

            playerHand.push(newCard);
            req.session.gameState.playerHand = playerHand;
            console.log('playerHand after push', playerHand);
            deck.push(newCard);

            let cardValue = 0;
            playerHand.forEach((card) => {
                cardValue += card.value;
            });
            console.log(cardValue);
            if (cardValue > 21) {
                const newPlayerBalance = calculateNewBalance(playerBalance, playerBet, 'loss');
                await updateDataBaseBalance(req.session.user_id, newPlayerBalance);
                return res.status(200).json({ message: 'bust', route:'hit', gameState: req.session.gameState });
            } else if( cardValue === 21) {
                const newPlayerBalance = calculateNewBalance(playerBalance, playerBet, 'win');
                await updateDataBaseBalance(req.session.user_id, newPlayerBalance);
                return res.status(200).json({ message: 'blackjack', route: 'hit', gameState: req.session.gameState});
            } else {
                req.session.gameState.playerHand = playerHand;
                req.session.gameState.deck = deck;
                req.session.gameState.handBusts = false;
                return res.status(200).json({ message: 'hit', route: 'hit', gameState: req.session.gameState });
            } 
        } // end of reg split logic
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
        
        while (calcHandValue(computerHand) < 17) {
            let newCard = deck.shift();
            computerHand.push(newCard);
            req.session.gameState.computerHand = computerHand
            deck.push(newCard);
        }


        let stayMessage = '';
        if (calcHandValue(computerHand) > 21) {
            stayMessage = 'Dealer bust';
        } else if(calcHandValue(computerHand) >=17 && calcHandValue(computerHand) <= 21) {
            stayMessage = 'Dealer stay';
        }

        // let computerTurn = true;
        // while (computerTurn) {
        //     let newCard = deck.shift();
        //     computerHand.push(newCard);
        //     if (calcHandValue(computerHand) > 21) {
        //         computerTurn = false;
        //         deck.push(newCard);
        //         // req.session.gameState.computerHand = computerHand;
        //         // console.log('computer hand when > 21',req.session.gameState.computerHand);
        //         return res.status(200).json({ message: 'Dealer bust', route: 'stay', gameState: req.session.gameState});
        //     } else if (calcHandValue(computerHand) >= 17) {
        //             computerTurn = false;
        //             deck.push(newCard);
        //             // req.session.gameState.computerHand = computerHand;
        //             // console.log('computer hand when >= 17',req.session.gameState.computerHand)
        //             return res.status(200).json({ message: 'Dealer hand > 17, dealer stay', route: 'stay', gameState: req.session.gameState});
        //     } else {
        //         deck.push(newCard);
        //         // req.session.gameState.computerHand = computerHand;
        //     }
        // }

        const outcome = checkWinner(playerHand, computerHand);
        const newPlayerBalance = calculateNewBalance(playerBalance, playerBet, outcome);

        await updateDataBaseBalance(req.session.user_id, newPlayerBalance);
        // req.session.gameState.playerBalance = newPlayerBalance;
        // req.session.gameState.playerBet = 0;

        // req.session.gameState.deck = deck;
        // console.log('end of stay', req.session.gameState);
        // console.log('deck length', req.session.gameState.deck.length)
        const user = await User.findByPk(req.session.user_id);
        console.log('user at end of stay', user);

        console.log('stay route')
        return res.status(200).json({ message: 'res object after stay', stayMessage: stayMessage, gameState: req.session.gameState});
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
            return res.status(200).json({ message: 'Please place a bet first', gameState: req.session.gameState });
        }

        if (playerHand.length === null || playerHand.length === undefined || playerHand.length === 0) {
            return res.status(200).json({ message: 'You must deal cards!' , gameState: req.session.gameState});
        }

        if (playerHand[0].value !== playerHand[1].value) {
            return res.status(200).json({ message: 'You cannot split hands that do not hold the same value!' , gameState: req.session.gameState});
        }

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

        // console.log('gamestate afer splitting', req.session.gameState);
        // console.log('deck length after splitting', deck.length);

        console.log('split route')
        return res.status(200).json({message: 'res object after split', gameState: req.session.gameState});
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
            return res.status(400).json({ message: 'Please place a bet first' });
        }

        if (playerHand.length === null || playerHand.length === undefined || playerHand.length === 0) {
            return res.status(400).json({ message: 'You must deal cards!' });
        }

        if (playerHand.length > 2) {
            return res.status(200).json({ message: 'You cannot double down after hitting!', gameState: req.session.gameState});
        } 

        const doubledBet = playerBet * 2;

        if (doubledBet > playerBalance) {
            return res.status(400).json({ error: 'Insufficient funds!' });
        } else {
            req.session.gameState.playerBet = doubledBet;
        }

        console.log('doubledn route')
        return res.status(200).json({ message: 'res object after doubledn', gameState: req.session.gameState});
    } catch(err) {
        res.status(500).json({ error: `Failed to doubledn: ${err}`});
    }
});

router.post('/deal', async (req, res) => {
    try{

        let playerHand = req.session.gameState.playerHand;
        let computerHand = req.session.gameState.computerHand;
        let deck = req.session.gameState.deck;
        // let playerBalance = req.session.gameState.playerBalance;
        let playerBet = req.session.gameState.playerBet;
        // let handBusts = req.session.gameState.handBusts;

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

        // handBusts = true;
        req.session.gameState.playerHand = playerHand;
        req.session.gameState.computerHand = computerHand;
        req.session.gameState.deck = deck;
        // req.session.gameState.handBusts = handBusts;

        // console.log('gamestate after dealing', req.session.gameState);

        console.log('deal route')
        return res.status(200).json({ message: 'res object after dealing', gameState: req.session.gameState});
    } catch(err) {
        res.status(500).json({ error: `Failed to deal: ${err}`});
    }
});


router.post('/bet', async (req, res) => {
    try{

        // let {playerHand, splitHand1, splitHand2, computerHand, playerBet} = req.session.gameState;
        let playerBet = req.session.gameState.playerBet;
        const { placedBet } = req.body;
        const { playerHand, splitHand1, splitHand2, computerHand } = req.session.gameState;
        const handPopulated = playerHand.length !== 0 || splitHand1.length !== 0 || splitHand2.length !== 0 || computerHand.length !== 0;        
        if ((placedBet <= req.session.gameState.playerBalance && !handPopulated)) {
            playerBet += placedBet;
        }
        req.session.gameState.handBusts = false;
        req.session.gameState.playerBet = playerBet;
        return res.status(200).json({ message: 'res object after bet', gameState: req.session.gameState});
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

        // console.log('Toggled to', req.session.gameState.isUserSplitHand1 ? 'first split hand' : 'second split hand');
        // console.log('gamestate after toggling:', req.session.gameState);

        const toggledHand = req.session.gameState.isUserSplitHand1 ? 'splitHand1' : 'splitHand2';

        res.status(200).json({ success: true, toggledHand: toggledHand});

    } catch(err) {
        res.status(500).json({ success: false, error: `Failed to toggle hand: ${err}`});
    }
});

router.post('/bust', (req, res) => {
    try {
        const { gameState } = req.session;

        res.status(200).json({ message: 'res object after bust', gameState: gameState})
    }catch(err) {
        res.status(500).json({ message: `Error busting: ${err}`});
    }
});

router.post('/computerbust', (req, res) => {
    try {
        const { gameState } = req.session;
        res.status(200).json({ message: 'res object after COMPUTERbust', gameState: gameState})
    }catch(err) {
        res.status(500).json({ message: `Error busting: ${err}`});
    }
});

router.post('/win', async (req, res) => {
    try{

        await updatePlayerWins(req.session.user_id);

        const { gameState } = req.session;
        gameState.computerHand = [];
        gameState.playerHand = [];
        gameState.handBusts = false;
        gameState.playerBalance = gameState.playerBalance + gameState.playerBet;
        gameState.playerBet = 0;
        
        const user= await User.findByPk(req.session.user_id);
        user.wins += 1;
        await user.save();

        res.status(200).json({ message: 'res object after win', gameState: gameState});
    } catch(err) {
        res.status(500).json({ message: `Error at /win: ${err}`});
    }
});

router.post('/blackjack', (req, res) => {
    try{
        const { gameState } = req.session;
        gameState.computerHand = [];
        gameState.playerHand = [];
        gameState.handBusts = false;
        gameState.playerBalance = gameState.playerBalance + gameState.playerBet;
        gameState.playerBet = 0;

        res.status(200).json({ message: 'res object after blackJack', gameState: gameState});
    } catch(err) {
        res.status(500).json({ message: `Error at /blackjack: ${err}`});
    }
});

router.post('/loss', async (req, res) => {
    try{
        const { gameState } = req.session;
        gameState.computerHand = [];
        gameState.playerHand = [];
        gameState.handBusts = false;
        gameState.playerBalance = gameState.playerBalance - gameState.playerBet;
        gameState.playerBet = 0;

        
        res.status(200).json({ message: 'res object after loss', gameState: gameState});
    } catch(err) {
        res.status(500).json({ message: `Error at /loss: ${err}`});
    }
});

router.post('/push', (req, res) => {
    try{
        const { gameState } = req.session;
        gameState.computerHand = [];
        gameState.playerHand = [];
        gameState.handBusts = false;
        gameState.playerBalance = gameState.playerBalance;
        gameState.playerBet = 0;

        
        res.status(200).json({ message: 'res object after push', gameState: gameState});
    } catch(err) {
        res.status(500).json({ message: `Error at /push: ${err}`});
    }
});

module.exports = router