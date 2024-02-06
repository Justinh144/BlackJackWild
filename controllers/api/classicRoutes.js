const router = require('express').Router();
const { User, Card } = require('../../models');


// router.get('/', async (req, res) => {
//     try {
//         console.log('hit classic')
//         const userData = await User.findAll({
//             include: [{
//                 model: User,
//                 attributes: ['name'],
//             },
//             {
//                 model: Card,
//                 attributes: ['cardname', 'filename']
//             }],
//         });
//         // console.log('User Data is   ', + userData);
//         const cards =  await Card.findAll({})
//         res.render('classic', {
//             logged_in: req.session.logged_in,
//             users: userData,
//             cards: cards,
//         });
//         // console.log("Classic rendered??")
//     } catch (err) {
//         console.error(err);
//         res.status(500).render('error', {error: err });
//     }
// });


router.get('/classic', async (req, res) => {
    try {
        const userId = req.session.userId;

        let game = req.session.game;
        if (!game) {
            game = new BlackjackGame(userId);
            req.session.game = game;
        }

        const continueGame = await game.startRound();

        // Send the game state as a response (you might want to render a template or send JSON)
        res.send(`Game state: ${continueGame ? 'Continue' : 'Game Over'}`);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});


module.exports = router