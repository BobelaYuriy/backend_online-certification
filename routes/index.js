const express = require('express');
const router = express.Router();
const {signin, signup} = require('../controllers/user-controller')
const {allcourses} = require('../controllers/courses-controller')

router.post('/signup', signup);
router.post('/signin', signin);

router.post('./sigout');
router.get('./refresh')
router.get('./users')

router.get('./courses', allcourses)

module.exports = router
