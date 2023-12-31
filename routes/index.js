const express = require('express');
const router = express.Router();

const {signin, signup, signout, refresh, updateProfile, getUserById} = require('../controllers/user-controller')

const {allcourses, idcourse, enrollUserInCourse, unenrollUserFromCourse, updateCourse, getCourseLessons, getTestQuestions, getLessonInfo, getUserLesson, createCourse, deleteCourse} = require('../controllers/courses-controller')
const {verifyToken, verifyTokenAdmin} = require('../middleware/token-controller')
const {submitUserAnswers} = require('../controllers/test-controller')
const {certificate} = require('../controllers/cetificate-controller')
//роути для юзерів
router.post('/signup', signup);
router.post('/signin', signin);
router.post('/signout', signout);

router.post('/updateprofile',verifyToken, updateProfile);
router.get('/refresh', refresh);
router.get('/profile', verifyToken, getUserById);
router.get('/profile/courses/:courseId/lesson/:lessonIndex',getUserLesson)

//роути для курсі
router.get('/courses', allcourses);
router.get('/courses/id/:id',verifyToken, idcourse);

router.post('/courses/enroll/', verifyToken, enrollUserInCourse);
router.post('/courses/unenroll/', verifyToken, unenrollUserFromCourse);
//тест
router.post('/profile/courses/:courseId/lesson/:lessonIndex/test/:testIndex', verifyToken, submitUserAnswers);

router.post('/courses/updatecourse/:courseId', updateCourse)

router.get('/profile/courses/:id/lessons',verifyToken, getCourseLessons)

router.get('/enrolledcourses/id/:courseId/lesson/:lessonIndex',verifyToken, getLessonInfo)
router.get('/enrolledcourses/id/:courseId/lesson/:lessonIndex/test/:testIndex/',verifyToken, getTestQuestions)

router.delete('/courses/deleteCourse/:courseId', deleteCourse);
router.post('/courses/createCourse', createCourse);
module.exports = router
