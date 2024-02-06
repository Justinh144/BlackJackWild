const router = require('express').Router();
const { User, Card } = require('../../models');


router.get('/', async (req, res) => {
    try {
        console.log('hit classic')
        const userData = await User.findAll({
            include: [{
                model: User,
                attributes: ['name'],
            },
            {
                model: Card,
                attributes: ['cardname', 'filename']
            }],
        });
        // console.log('User Data is   ', + userData);
        const cards =  await Card.findAll({})
        res.render('classic', {
            logged_in: req.session.logged_in,
            users: userData,
            cards: cards,
        });
        // console.log("Classic rendered??")
    } catch (err) {
        console.error(err);
        res.status(500).render('error', {error: err });
    }
});

module.exports = router