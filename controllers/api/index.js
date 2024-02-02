const router = require('express').Router();

const classic = require('./classicRoute');
const wild = require('./wildRoute');

router.use('./classic', classic);
router.use('./wild', wild)

module.exports = router;