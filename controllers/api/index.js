// const express = require('express');
// const router = express.Router();
const router = require('express').Router();

// const wild = require('./wildRoutes');
const userRoutes = require('./userRoutes');
const classicRoutes = require('./classicRoutes');

// router.use('/classic', classic);
// router.use('/wild', wild);
router.use('/users', userRoutes);
router.use('/classic', classicRoutes);


module.exports = router;