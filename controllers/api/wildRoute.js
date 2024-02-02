const router = require('express').Router();
const withAuth = require('../../utils/auth');

router.get('/', (req, res) => {
     res.render('login');
});



module.exports = router;