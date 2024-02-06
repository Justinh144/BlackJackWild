// const express = require('express');
// const router = express.Router();
const router = require('express').Router();

// const classic = require('./classicRoutes');
// const wild = require('./wildRoutes');
const userRoutes = require('./userRoutes')


// router.use('/classic', classic);
// router.use('/wild', wild);
router.use('/users', userRoutes);


module.exports = router;