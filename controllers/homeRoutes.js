const router = require('express').Router();
const withAuth = require('../utils/auth');

router.get('/', (req, res) => {
     res.render('login');
    
});

router.get('/potato', (req, res) => {
     res.render('login2');
    
});



module.exports = router;