const express = require('express');
const router = express.Router();

const {signin, signup, signout, refresh, updateProfile, getUserById} = require('../controllers/user-controller')

const {allcourses, idcourse, enrollUserInCourse, unenrollUserFromCourse} = require('../controllers/courses-controller')
const {verifyToken} = require('../middleware/token-controller')
const {submitUserAnswers} = require('../controllers/test-controller')
const {certificate} = require('../controllers/cetificate')
//user
router.post('/signup', signup);
router.post('/signin', signin);
router.post('/signout', signout);
router.post('/updateprofile',verifyToken, updateProfile);
router.get('/refresh', refresh);
router.get('/profile', verifyToken, getUserById);

//course
router.get('/courses', allcourses);
router.get('/courses/id/:id',verifyToken, idcourse);

router.post('/courses/aboba/test',certificate);

router.post('/courses/enroll/', verifyToken, enrollUserInCourse);
router.post('/courses/unenroll/', verifyToken, unenrollUserFromCourse);

router.post('/courses/test/:courseId', verifyToken, submitUserAnswers);
module.exports = router
