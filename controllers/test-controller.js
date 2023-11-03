const User = require('../models/user')
const CardsUsers = require('../models/courses'); // Замініть на правильний шлях до вашої моделі

// Модель користувача (userSchema) залишається незмінною.

// Оновлений контролер для обробки результатів тестування
const submitUserAnswers = async (req, res) => {
    try {
      const userId = req.user.id; // Отримуємо ідентифікатор користувача з авторизації
      const courseId = req.params.courseId; // Отримуємо ідентифікатор курсу з параметра запиту
      const lessonIndex = parseInt(req.body.lessonIndex); // Індекс уроку
      const testIndex = parseInt(req.body.testIndex); // Індекс тесту
      const userAnswers = req.body.userAnswers; // Масив відповідей користувача
  
      // Знаходимо курс за ідентифікатором
      const course = await CardsUsers.findById(courseId);
  
      if (!course) {
        return res.status(404).json({ message: 'Курс не знайдено' });
      }
  
      // Отримуємо тест, на який відповідає користувач
      const test = course.lessons[lessonIndex].tests[testIndex];
  
      if (!test) {
        return res.status(404).json({ message: 'Тест не знайдено' });
      }
  
      // Перевіряємо правильність відповідей користувача
      const correctAnswers = test.questions.map((question) => question.correctAnswer);//створює масив правильних відповідей
      const userScores = userAnswers.map((answer, index) => (answer === correctAnswers[index] ? 1 : 0));
  
      // Розраховуємо суму балів користувача за тест
      const totalScore = userScores.reduce((total, score) => total + score, 0);
  
      // Оновлюємо інформацію про бали та результати тесту в користувача
      const user = await User.findById(userId);
  
      if (!user) {
        return res.status(404).json({ message: 'Користувача не знайдено' });
      }
  
      const enrolledCourse = user.enrolledCourses.find((course) => course.courseId.toString() === courseId);
  
      if (!enrolledCourse) {
        return res.status(400).json({ message: 'Користувач не записаний на цей курс' });
      }
  
      const completedTest = {
        lessonIndex,
        testIndex,
        score: totalScore,
      };
  
      enrolledCourse.completedTests.push(completedTest);
  
      // Підраховуємо загальний прогрес користувача на курсі
      const completedTestCount = enrolledCourse.completedTests.length;
      const totalTestCount = course.lessons.reduce((count, lesson) => count + lesson.tests.length, 0);
      enrolledCourse.progress = Math.round((completedTestCount / totalTestCount) * 100);;
      // Зберігаємо оновлені дані користувача
      await user.save();
  
      res.status(200).json({ message: 'Результати тестування збережено', totalScore });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  
  module.exports = {
    submitUserAnswers
  };
  