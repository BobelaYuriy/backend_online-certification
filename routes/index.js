const express = require('express');
const router = express.Router();
const {signin, signup, signout, refresh} = require('../controllers/user-controller')
const {allcourses, idcourse, searchcourse} = require('../controllers/courses-controller')
const {verifyToken} = require('../controllers/token-controller')

router.post('/signup', signup);
router.post('/signin', signin);

router.post('/signout', signout);
router.get('/refresh', refresh);
router.get('/courses', allcourses);
router.get('/courses/:id',verifyToken, idcourse);
router.get('/courses/search/', searchcourse);

module.exports = router
