const User = require('../models/user'); // Підключення моделі користувача

// Контролер для запису користувача на курс
const enrollUserInCourse = async (req, res) => {
  try {
    const userId = req.user.id; // Отримуємо ідентифікатор користувача з авторизації
    const courseId = req.params.courseId; // Отримуємо ідентифікатор курсу з параметра запиту

    // Перевіряємо, чи користувач уже записаний на цей курс
    const user = await User.findById(userId);
    const isEnrolled = user.enrolledCourses.some((course) => course.courseId.toString() === courseId);

    if (isEnrolled) {
      return res.status(400).json({ message: 'Користувач вже записаний на цей курс' });
    }

    // Створюємо об'єкт userCourseSchema для запису
    const enrollment = {
      courseId: courseId,
      progress: 0, // Новий користувач починає курс з прогресом 0%
      completedTests: [], // Поки немає пройдених тестів
    };

    // Додаємо об'єкт enrollment до масиву enrolledCourses користувача
    user.enrolledCourses.push(enrollment);

    // Зберігаємо оновлені дані користувача
    await user.save();

    res.status(200).json({ message: 'Користувач успішно записаний на курс' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { enrollUserInCourse };
