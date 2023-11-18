const express = require('express');
const router = express.Router();

const {signin, signup, signout, refresh, updateProfile, getUserById} = require('../controllers/user-controller')

const {allcourses, idcourse, enrollUserInCourse, unenrollUserFromCourse, updateCourse, getLesson} = require('../controllers/courses-controller')
const {verifyToken} = require('../middleware/token-controller')
const {submitUserAnswers} = require('../controllers/test-controller')
const {certificate} = require('../controllers/cetificate-controller')
//роути для юзерів
router.post('/signup', signup);
router.post('/signin', signin);
router.post('/signout', signout);

router.post('/updateprofile',verifyToken, updateProfile);
router.get('/refresh', refresh);
router.get('/profile', verifyToken, getUserById);

//роути для курсі
router.get('/courses', allcourses);
router.get('/courses/id/:id',verifyToken, idcourse);

router.post('/courses/enroll/', verifyToken, enrollUserInCourse);
router.post('/courses/unenroll/', verifyToken, unenrollUserFromCourse);

router.post('/courses/test/', verifyToken, submitUserAnswers);

router.post('/courses/updatecourse/:courseId', updateCourse)

router.get('/courses/id/:courseId/lesson/:lessonIndex', getLesson)

//certificate
router.post('/certificate/', certificate)
module.exports = router
