const router = require('express').Router();
const { User, Card } = require('../../models');
const { Game } = require('../../utils/gameplay/blackjack');
const withAuth = require('../../utils/auth');


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


// In your router file
router.get('/start-game', withAuth, async (req, res) => {
    try {
        const game = new Game(req.session.user_id);
        await game.initialize();
        game.startRound();
        res.status(200).json({ message: 'Game started' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to start game' });
    }
});



module.exports = router