const router = require('express').Router();
const { User, Card } = require('../../models');
const  { Game } = require('../../utils/gameplay/Game');
const { calcHandValue, updateDataBaseBalance, calculateNewBalance, updatePlayerWins } = require('../../utils/helpers');
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
            playerBet: 0,
            computerHand: [],
            split: false,
            splitHand1: [],
            splitHand2: [],
            isUserSplitHand1: true,
            handBusts: false,
            doubleDn: false,
            playerStay: false,
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
        // let splitHand1 = req.session.gameState.splitHand1;
        // let splitHand2 = req.session.gameState.splitHand2;
        // let isUserSplitHand1 = req.session.gameState.isUserSplitHand1;
        // let split = req.session.gameState.split;
        let handBusts = req.session.gameState.handBusts;
        let doubleDn = req.session.gameState.doubleDn;

        if (playerBet === null || playerBet === undefined || playerBet === 0) {
            return res.status(200).json({ error: 'Please place a bet first', gameState: req.session.gameState });
        }
        if (playerHand.length > 5 || doubleDn === true || handBusts === true) {
            return res.status(200).json({ error: 'You cannot hit again!', gameState: req.session.gameState});
        }

        // SPLIT FUNCTIONALITY WORK IN PROGRESS //
        // if (split) {
        //     if ((splitHand1.length === null || splitHand1.length === undefined || splitHand1.length === 0)&&
        //         (splitHand2.length === null || splitHand2.length === undefined || splitHand2.length === 0)) {

        //         return res.status(200).json({ error: 'Did not split hands, please try again', gameState: req.session.gameState});
        //     }
        //     let playingHand;
        //     let bustHand;
        //     if (isUserSplitHand1) {
        //         playingHand = splitHand1;
        //         bustHand = splitHand2;
        //     } else {
        //         playingHand = splitHand2;
        //         bustHand = splitHand1;
        //     }

        //     if (playingHand.length === 0) {
        //         return res.status(200).json({ error: 'You must deal cards for the current hand!', gameState: req.session.gameState });
        //     }

        //     const newCard = deck.shift();
        //     playingHand.push(newCard);

        //     console.log(playingHand);
        //     deck.push(newCard);

        //     const total = calcHandValue(playingHand);

        //     if (total > 21) {
        //         const newPlayerBalance = calculateNewBalance(playerBalance, playerBet, 'loss');
        //         await updateDataBaseBalance(req.session.user_id, newPlayerBalance);

        //         req.session.gameState.handBusts = true;

        //         req.session.gameState.playerBalance = newPlayerBalance;
        //         if (isUserSplitHand1) {
        //             req.session.gameState.splitHand1 = [];
        //         } else {
        //             req.session.gameState.splitHand2 = [];
        //         }

        //         if ((splitHand1.length === 0 || isBust(splitHand1)) && (splitHand2.length === 0 || isBust(splitHand2))) {
        //             req.session.gameState.computerHand = [];
        //             req.session.gameState.playerBet = 0;
        //             req.session.gameState.split = false;
        //         } else {
        //             req.session.gameState.playerBet = playerBet;
        //             req.session.gameState.computerHand = computerHand;
        //         }

        //         if (req.session.gameState.splitHand1.length === 0 && req.session.gameState.splitHand2.length === 0) {
        //             req.session.gameState.isUserSplitHand1 = true;
        //         } else if (req.session.gameState.splitHand1.length === 0 && req.session.gameState.splitHand2.length !== 0) {
        //             req.session.gameState.isUserSplitHand1 = false;
        //         } else if (req.session.gameState.splitHand2.length === 0 && req.session.gameState.splitHand1.length !== 0) {
        //             req.session.gameState.isUserSplitHand1 = true;
        //         }
        //         console.log(`You lose! Player busts!`);
        //         console.log('gameState at user Hit and Bust', req.session.gameState);
        //     } else {

        //     }
        // END OF SPLIT FUNCTIONALITY //

         

            if (playerHand.length === null || playerHand.length === undefined || playerHand.length === 0) {
                return res.status(200).json({ error: 'You must deal cards!', gameState: req.session.gameState });
            }

            const newCard = deck.shift();

            playerHand.push(newCard);
            req.session.gameState.playerHand = playerHand;
            console.log('playerHand after push', playerHand);
            deck.push(newCard);
            req.session.gameState.deck = deck;

            let cardValue = 0;
            playerHand.forEach((card) => {
                cardValue += card.value;
            });
            console.log(cardValue);
            if (cardValue > 21) {
                const aces = playerHand.filter(card => card.value === 11);
                if (aces.length) {
                    const index = playerHand.findIndex(card => card.value === 11);
                    req.session.gameState.playerHand[index].value = 1;
            
                    // Recalculate hand value after adjusting Ace value
                    const newHandValue = calcHandValue(req.session.gameState.playerHand);
            
                    if (newHandValue > 21) {
                        const newPlayerBalance = calculateNewBalance(playerBalance, playerBet, 'loss');
                        await updateDataBaseBalance(req.session.user_id, newPlayerBalance);
                        req.session.gameState.handBusts = true;
                        return res.status(200).json({ message: 'You Busted!', route: 'hit', gameState: req.session.gameState });
                    } else {
                        req.session.gameState.playerHand = playerHand;
                        req.session.gameState.deck = deck;
                        req.session.gameState.handBusts = false;
                        return res.status(200).json({ message: 'hit', route: 'hit', gameState: req.session.gameState });
                    }
                } else {
                    const newPlayerBalance = calculateNewBalance(playerBalance, playerBet, 'loss');
                    await updateDataBaseBalance(req.session.user_id, newPlayerBalance);
                    req.session.gameState.handBusts = true;
                    return res.status(200).json({ message: 'You Busted!', route: 'hit', gameState: req.session.gameState });
                }
            } else if (req.session.gameState.playerHand.length === 5){
                return res.status(200).json({ message: 'stay', route:'hit', gameState: req.session.gameState});
            } else {
                return res.status(200).json({ message: 'hit', route: 'hit', gameState: req.session.gameState})
            }  
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
        let playerStay = req.session.gameState.playerStay;

        if (playerStay === true) {
            return res.status({ error: 'You cannot stay twice!', gameState: req.session.gameState});
        }

        if (playerBet === null || playerBet === undefined || playerBet === 0) {
            return res.status(200).json({ error: 'Please place a bet first',gameState: req.session.gameState });
        }

        if (playerHand.length === null || playerHand.length === undefined || playerHand.length === 0) {
            return res.status(200).json({ error: 'You must deal cards!',gameState: req.session.gameState });
        }


        if (calcHandValue(computerHand) >= 17) {
            req.session.gameState.playerStay = true;
            return res.status(200).json({ stayMessage: 'Dealer stay', gameState: req.session.gameState});
        } 
        if (calcHandValue(computerHand) > 21) {
            req.session.gameState.playerStay = true;
            stayMessage = 'Dealer bust';
            return res.status(200).json({ stayMessage: stayMessage, gameState: req.session.gameState});
        } else {
            stayMessage = 'Dealer hit';
            req.session.gameState.playerStay = true;
            return res.status(200).json({ stayMessage: stayMessage, gameState: req.session.gameState});
        }
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
            return res.status(200).json({ error: 'Please place a bet first', gameState: req.session.gameState });
        }

        if (playerHand.length === null || playerHand.length === undefined || playerHand.length === 0) {
            return res.status(200).json({ error: 'You must deal cards!' , gameState: req.session.gameState});
        }

        if (playerHand[0].value !== playerHand[1].value) {
            return res.status(200).json({ error: 'You cannot split hands that do not hold the same value!' , gameState: req.session.gameState});
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

router.post('/doubledn', async (req, res) => {
    try{
        let playerHand = req.session.gameState.playerHand;
        let playerBalance = req.session.gameState.playerBalance;
        let playerBet = req.session.gameState.playerBet;
        let deck = req.session.gameState.deck;

        if (playerBet === null || playerBet === undefined || playerBet === 0) {
            req.session.gameState.playerBet = 0;
            return res.status(200).json({ error: 'Please place a bet first',gameState: req.session.gameState });
        }

        if (playerHand.length === null || playerHand.length === undefined || playerHand.length === 0) {
            return res.status(200).json({ error: 'You must deal cards!',gameState: req.session.gameState });
        }

        if (playerHand.length > 2) {
            return res.status(200).json({ error: 'You cannot double down after hitting!', gameState: req.session.gameState});
        }
        const doubledBet = playerBet * 2;

        if (doubledBet > playerBalance) {
            return res.status(200).json({ error: 'Insufficient funds!', gameState: req.session.gameState});
        } else {
            req.session.gameState.playerBet = doubledBet;
        }
        req.session.gameState.doubleDn = true;

        const newCard = deck.shift();
        deck.push(newCard);
        req.session.gameState.deck = deck;
        playerHand.push(newCard);
        req.session.gameState.playerHand = playerHand;


        if (calcHandValue(playerHand) > 21) {
            const aces = playerHand.filter(card => card.value === 11);
            if (aces.length) {
                const index = playerHand.findIndex(card => card.value === 11);
                req.session.gameState.playerHand[index].value = 1;
        
                // Recalculate hand value after adjusting Ace value
                const newHandValue = calcHandValue(req.session.gameState.playerHand);
        
                if (newHandValue > 21) {
                    const newPlayerBalance = calculateNewBalance(playerBalance, playerBet, 'loss');
                    await updateDataBaseBalance(req.session.user_id, newPlayerBalance);
                    req.session.gameState.handBusts = true;
                    return res.status(200).json({ message: 'bust', route: 'doubledn', gameState: req.session.gameState });
                } else {
                    req.session.gameState.playerHand = playerHand;
                    req.session.gameState.deck = deck;
                    req.session.gameState.handBusts = false;
                    return res.status(200).json({ message: 'hit', route: 'hit', gameState: req.session.gameState });
                }
            } else {
                const newPlayerBalance = calculateNewBalance(playerBalance, playerBet, 'loss');
                await updateDataBaseBalance(req.session.user_id, newPlayerBalance);
                req.session.gameState.handBusts = true;
                return res.status(200).json({ message: 'bust', route: 'doubledn', gameState: req.session.gameState });
            }
        } else {
            return res.status(200).json({ message: 'doubledn', route: 'doubledn', gameState: req.session.gameState})
        }
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
            return res.status(200).json({ error: 'Please place a bet first!', gameState: req.session.gameState });
        }

        if (playerHand.length !== 0 || computerHand.length !== 0) {
            return res.status(200).json({ error: 'You cannot deal more than 2 cards!', gameState: req.session.gameState });
        }

        const card1 = deck.shift();
        const card2 = deck.shift();
        const card3 = deck.shift();
        const card4 = deck.shift();

        playerHand.push(card1, card3);
        computerHand.push(card2, card4);
        deck.push(card1, card2, card3, card4);

        const playerAces = playerHand.filter(card => card.value === 11);
        if (playerAces.length === 2) {
            const index = playerHand.findIndex(card => card.value === 11);
            req.session.gameState.playerHand[index].value = 1;
        }

        const compAces = computerHand.filter(card => card.value === 11);
        if (compAces.length === 2) {
            const index = computerHand.findIndex(card => card.value === 11);
            req.session.gameState.computerHand[index].value = 1;
        }

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
        const { placedBet } = req.body;
        let playerBet = req.session.gameState.playerBet;
        let playerBalance = req.session.gameState.playerBalance;

        if (req.session.gameState.playerHand.length !== 0 || req.session.gameState.splitHand1.length !== 0 || req.session.gameState.splitHand2.length !== 0 || req.session.gameState.computerHand.length !== 0) {
            return res.status(200).json({ error: 'You cannot place a bet after dealing!', gameState: req.session.gameState})
        } else if (playerBet > playerBalance) {
            return res.status(200).json({ error: 'You cannot bet more than your balance!', gameState: req.session.gameState});
        } else if ((placedBet + playerBet) > playerBalance){
            return res.status(200).json({ error: 'You cannot bet more than your balance!', gameState: req.session.gameState});
        } else { 
            playerBet += placedBet;
            req.session.gameState.playerBet = playerBet;
            const user = await User.findByPk(req.session.user_id);
            req.session.gameState.playerBet = playerBet;
            return res.status(200).json({ message: 'res object after bet', gameState: req.session.gameState, user: user});
        }
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

        res.status(200).json({ success: true, toggledHand: toggledHand, gameState: req.session.gameState});

    } catch(err) {
        res.status(500).json({ success: false, error: `Failed to toggle hand: ${err}`});
    }
});


router.post('/computerbust', (req, res) => {
    try {
        const { gameState } = req.session;
        res.status(200).json({ message: 'res object after COMPUTERbust', outcome:'Opponent busted!', gameState: gameState})
    }catch(err) {
        res.status(500).json({ message: `Error busting: ${err}`});
    }
});

router.post('/win', async (req, res) => {
    try{

        await updatePlayerWins(req.session.user_id);

        const { gameState } = req.session;
        newPlayerBalance = gameState.playerBalance + gameState.playerBet;

        await updateDataBaseBalance(req.session.user_id, newPlayerBalance);

        gameState.computerHand = [];
        gameState.playerHand = [];
        gameState.handBusts = false;
        gameState.playerBalance = gameState.playerBalance + gameState.playerBet;
        gameState.playerBet = 0;
        gameState.playerStay = false;
        gameState.doubleDn = false;
      
        const user= await User.findByPk(req.session.user_id);


        res.status(200).json({ message: 'res object after win', outcome: 'You Win!' ,gameState: gameState, user: user, audio: '/audio/Win.mp3'});
    

    } catch(err) {
        res.status(500).json({ message: `Error at /win: ${err}`});
    }
});


router.post('/blackjack', async (req, res) => {
    try{
        const { gameState } = req.session;

        newPlayerBalance = gameState.playerBalance + gameState.playerBet;
        await updateDataBaseBalance(req.session.user_id, (gameState.playerBalance + (gameState.playerBet * (3/2))));

        gameState.computerHand = [];
        gameState.playerHand = [];
        gameState.handBusts = false;
        gameState.playerBalance = gameState.playerBalance + (gameState.playerBet * (3/2));
        gameState.playerStay = false;
        gameState.playerBet = 0;

        const user = await User.findByPk(req.session.user_id);

        res.status(200).json({ message: 'res object after blackJack', outcome: 'Blackjack!',gameState: gameState, user: user });
    } catch(err) {
        res.status(500).json({ message: `Error at /blackjack: ${err}`});
    }
});

router.post('/loss', async (req, res) => {
    try{
        const { gameState } = req.session;

        newPlayerBalance = gameState.playerBalance - gameState.playerBet;
        await updateDataBaseBalance(req.session.user_id, newPlayerBalance);

        gameState.computerHand = [];
        gameState.playerHand = [];
        gameState.handBusts = false;
        gameState.playerBalance = gameState.playerBalance - gameState.playerBet;
        gameState.playerBet = 0;
        gameState.doubleDn = false;
        gameState.playerStay = false;

        const user = await User.findByPk(req.session.user_id);

        res.status(200).json({ message: 'res object after loss', outcome: 'You Lost!', gameState: gameState, user:user});
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
        gameState.doubleDn = false;
        gameState.playerStay = false;

        
        res.status(200).json({ message: 'res object after push', outcome: 'Push', gameState: gameState});
    } catch(err) {
        res.status(500).json({ message: `Error at /push: ${err}`});
    }
});

router.post('/drawcomputercard', (req, res) => {
    try {  
        let computerHand = req.session.gameState.computerHand;
        let deck = req.session.gameState.deck;
        if (computerHand.length < 5) {
            const newCard = deck.shift();
            computerHand.push(newCard);
            deck.push(newCard);
            return res.status(200).json({ message: 'Dealer draw', gameState: req.session.gameState});
        } else {
            return res.status(200).json({ message: 'Dealer stay', gameState: req.session.gameState});
        }

    } catch(err) {
        res.status(500).json({ error: 'error at /drawcomputercard'})
    }
});

router.post('/reload', async (req, res) => {
    try {
    let playerBalance = req.session.gameState.playerBalance;
    if (playerBalance <= 100) {
            await User.update(
                { chipCount: 20000 },
                { where: { id: req.session.user_id }}
            );   
            req.session.gameState.playerBalance = 20000;
            return res.status(200).json({ message: 'Chips reloaded', gameState: req.session.gameState})
        } else {
            return res.status(200).json({ error: 'Cannot reload chips unless less than 100!'})
        }
    } catch (err) {
        res.status(500).json({ error: 'error at /reload'});
    }
})

module.exports = router