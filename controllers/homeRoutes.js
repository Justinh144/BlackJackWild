const router = require('express').Router();
const withAuth = require('../utils/auth');
// const { Project, User , Card } = require('../models');
const path = require('path');
const player = require('play-sound')();
// const { User , Card } = require('../models'); //threw an error saying User was already declared (line 4), commented out to get it to run -Matt
// const { Game } = require('../utils/gameplay/blackjack');

router.get('/', (req, res) => {
     res.render('homepage');
});

// Comment out this part to mute audio
  // const audioFilePath = path.join(__dirname, '../audio/Casino.mp3');
  // console.log('Audio file path:', audioFilePath); // Log the resolved file path

  // player.play(audioFilePath, { afplay: ['-v', 1] }, function(err) {
  //     if (err) {
  //         console.error('Error playing audio:', err);
  //     } else {
  //         console.log('Audio file played successfully');
  //     }
  // });

 
 
  
  // Comment out this part to mute audio

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
       });
       
       const user = userData.get({ plain: true });

      //  console.log('user data is ', user);
   
       res.render('profile', {
         ...user,
         logged_in: true
       });
     } catch (err) {
       res.status(500).json(err);
     }
   });

   router.get('/classic', withAuth, async (req, res) => {
    try {
        const userData = await User.findByPk(req.session.user_id);
        const user = userData.get({ plain: true });
        // console.log(user);
        const cards = await Card.findAll({});

        // Render the classic.handlebars page
        res.render('classic', {
            logged_in: req.session.logged_in,
            cards: cards,
            user: user,
        });
    } catch (err) {
        console.error(err);
        res.status(500).render('error', { error: err });
    }
});

module.exports = router;