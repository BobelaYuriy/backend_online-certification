const express = require('express');
const router = express.Router();
const {signin, signup, signout, refresh} = require('../controllers/user-controller')
const {allcourses, idcourse, enrollUserInCourse, unenrollUserFromCourse} = require('../controllers/courses-controller')
const {verifyToken} = require('../middleware/token-controller')
const {submitUserAnswers} = require('../controllers/test-controller')

router.post('/signup', signup);
router.post('/signin', signin);
router.post('/signout', signout);

router.get('/refresh', refresh);
router.get('/courses', allcourses);
router.get('/courses/id/:id',verifyToken, idcourse);

router.post('/courses/enroll/:courseId', verifyToken, enrollUserInCourse);
router.post('/courses/unenroll/:courseId', verifyToken, unenrollUserFromCourse);

router.post('/courses/test/:courseId', verifyToken, submitUserAnswers);
module.exports = router
