const router = require('express').Router();
const withAuth = require('../utils/auth');
const { Project, User , Card } = require('../models');

router.get('/', (req, res) => {
     res.render('homepage');
});

router.get('/login', (req, res) => {
     // If the user is already logged in, redirect the request to another route
     if (req.session.logged_in) {
       res.redirect('/profile');
       return;
     }
     res.render('login');
   });


router.get('/profile', withAuth, async (req, res) => {
     try {
      console.log('hit /profile');
       // Find the logged in user based on the session ID
       const userData = await User.findByPk(req.session.user_id, {
         attributes: { exclude: ['password'] },
         include: [{ model: Project }],
       });
      console.log('user data is ', + userData);
       const user = userData.get({ plain: true });
   
       res.render('profile', {
         ...user,
         logged_in: true
       });
     } catch (err) {
       res.status(500).json(err);
     }
   });

   router.get('/classic', withAuth , async (req, res) => {
    try {
        // console.log('hit classic')
        // const userData = await User.findAll({
        //     include: [{
        //         model: User,
        //         attributes: ['name'],
        //     },
        //     {
        //         model: Card,
        //         attributes: ['cardname', 'filename']
        //     }],
        // });
        // console.log('User Data is   ', + userData);
        const cards =  await Card.findAll({})
        res.render('classic', {
            logged_in: req.session.logged_in,
            // users: userData,
            // cards: cards,
        });
        console.log("Classic rendered??")
    } catch (err) {
        console.error(err);
        res.status(500).render('error', {error: err });
    }
});

module.exports = router;