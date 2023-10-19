const express = require('express');
const router = express.Router();
const {signin, signup} = require('../controllers/user-controller')
const {allcourses, idcourse} = require('../controllers/courses-controller')
const {verifyToken} = require('../controllers/token-controller')

router.post('/signup', signup);
router.post('/signin', signin);

router.post('/sigout');
router.get('/refresh');
router.get('/users');

router.get('/courses', allcourses);
router.get('/courses/:id',verifyToken, idcourse);

module.exports = router
