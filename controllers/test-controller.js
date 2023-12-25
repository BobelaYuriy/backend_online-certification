const User = require("../models/user");
const Course = require("../models/courses");

const submitUserAnswers = async (req, res) => {
  try {
    const userId = req.user.id;
    const courseId = req.params.courseId;
    const lessonIndex = parseInt(req.params.lessonIndex);
    const testIndex = parseInt(req.params.testIndex);
    const userAnswers = req.body.userAnswers;

    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({ message: "Курс не знайдено" });
    }

    if (lessonIndex < 0 || lessonIndex >= course.lessons.length) {
      return res.status(404).json({ message: "Урок не знайдено" });
    }

    const test = course.lessons[lessonIndex].tests[testIndex];

    if (!test) {
      return res.status(404).json({ message: "Тест не знайдено" });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "Користувача не знайдено" });
    }

    const enrolledCourse = user.enrolledCourses.find(
      (enrolledCourse) => enrolledCourse.courseId.toString() === courseId
    );

    if (!enrolledCourse) {
      return res
        .status(400)
        .json({ message: "Користувач не записаний на цей курс" });
    }

    const testAlreadyCompleted = enrolledCourse.completedTests.some(
      (completedTest) =>
        completedTest.lessonIndex === lessonIndex &&
        completedTest.testIndex === testIndex
    );

    if (testAlreadyCompleted) {
      return res
        .status(400)
        .json({ message: "Цей тест вже пройдений користувачем" });
    }

    const correctAnswers = test.questions.map(
      (question) => question.correctAnswer
    );
    const userScores = userAnswers.map((answer, index) =>
      answer === correctAnswers[index] ? 1 : 0
    );

    const totalScore = userScores.reduce((total, score) => total + score, 0);
    const maxScore = test.questions.length;
    const percentageCorrect =  Math.round((totalScore / maxScore) * 100);
    const completedTest = {
      lessonIndex,
      testIndex,
      userScore: totalScore,
      maxScore,
      percentageCorrect,
    };

    enrolledCourse.completedTests.push(completedTest);

   // Підраховуємо актуальність на всьому курсі
   const allTests = course.lessons.reduce(
    (tests, lesson) => tests.concat(lesson.tests),
    []
  );

  const allUserScores = enrolledCourse.completedTests.map(
    (completedTest) => completedTest.userScore
  );

  const totalUserScore = allUserScores.reduce((total, score) => total + score, 0);
  const totalMaxScore = allTests.reduce(
    (total, test) => total + test.questions.length,
    0
  );

  const overallPercentageCorrect = Math.round((totalUserScore / totalMaxScore) * 100);
  
  // Оновлюємо актуальність для всього курсу
  enrolledCourse.accuracy = overallPercentageCorrect;

  const completedTestCount = enrolledCourse.completedTests.length;
  const totalTestCount = allTests.length;
  enrolledCourse.progress = Math.round((completedTestCount / totalTestCount) * 100);

  await user.save();

  res.status(200).json({
    message: "Результати тестування збережено",
    completedTest,
    percentageCorrect,
    overallPercentageCorrect,
  });
} catch (error) {
  res.status(500).json({ error: error.message });
}
};

module.exports = {
  submitUserAnswers,
};
