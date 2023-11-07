const User = require("../models/user");
const Course = require("../models/courses");

const submitUserAnswers = async (req, res) => {
  try {
    const userId = req.user.id; // Отримуємо ідентифікатор користувача з авторизації
    const courseId = req.query.id; // Отримуємо ідентифікатор курсу з параметра запиту
    const lessonIndex = parseInt(req.id.lessonIndex); // Індекс уроку
    const testIndex = parseInt(req.id.testIndex); // Індекс тесту
    const userAnswers = req.body.userAnswers; // Масив відповідей користувача

    // Знаходимо курс за ідентифікатором
    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({ message: "Курс не знайдено" });
    }

    // Отримуємо тест, на який відповідає користувач
    const test = course.lessons[lessonIndex].tests[testIndex];

    if (!test) {
      return res.status(404).json({ message: "Тест не знайдено" });
    }

    // Перевіряємо правильність відповідей користувача

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "Користувача не знайдено" });
    }

    // Знаходимо відповідний курс користувача
    const enrolledCourse = user.enrolledCourses.find(
      (enrolledCourse) => enrolledCourse.courseId.toString() === courseId
    );

    if (!enrolledCourse) {
      return res
        .status(400)
        .json({ message: "Користувач не записаний на цей курс" });
    }

    const testAlreadyCompleted = user.enrolledCourses.some((enrolledCourse) => {
      return (
        enrolledCourse.completedTests &&
        enrolledCourse.completedTests.some(
          (completedTest) =>
            completedTest.lessonIndex === lessonIndex &&
            completedTest.testIndex === testIndex
        )
      );
    });

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

    // Розраховуємо суму балів користувача за тест
    const totalScore = userScores.reduce((total, score) => total + score, 0);
    const maxScore = test.questions.length;
    // Оновлюємо інформацію про бали та результати тесту в користувача
    const completedTest = {
      lessonIndex,
      testIndex,
      userScore: totalScore,
      maxScore: maxScore,
    };

    enrolledCourse.completedTests.push(completedTest);

    // Підраховуємо загальний прогрес користувача на курсі
    const completedTestCount = enrolledCourse.completedTests.length;
    const totalTestCount = course.lessons.reduce(
      (count, lesson) => count + lesson.tests.length,
      0
    );
    enrolledCourse.progress = Math.round(
      (completedTestCount / totalTestCount) * 100
    );

    // Зберігаємо оновлені дані користувача
    await user.save();

    res
      .status(200)
      .json({ message: "Результати тестування збережено", completedTest });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  submitUserAnswers,
};
