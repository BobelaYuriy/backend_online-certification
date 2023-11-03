const CardsUsers = require('../models/courses')
const User = require('../models/user'); // Підключення моделі користувача
const verifyToken = require('../middleware/token-controller')
const mongoose = require('mongoose')

const allcourses = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;

    const searchQuery = req.query.search;
    const category = req.query.category;

    let accessNextPage = true;
    let accessPreviousPage = true;

    let query = {};

    if (searchQuery) {
        // Якщо є параметр `query`, додаємо умову для фільтрації за назвою курсу
        query.title = { $regex: searchQuery, $options: 'i' };
    }

    if (category) {
        // Якщо є параметр `category`, додаємо умову для фільтрації за категорією
        query.category = category;
    }

    const courses = await CardsUsers.find(query)
        .skip((page - 1) * limit)
        .limit(limit);

    const nextpage = await CardsUsers.find(query)
        .skip(page * limit)
        .limit(limit);

    if (nextpage.length === 0) {
        accessNextPage = false;
    }
    if (page <= 1) {
        accessPreviousPage = false;
    }

    res.json({ accessNextPage, accessPreviousPage, courses });
} catch (error) {
    res.status(500).json({ error: error.message });
}
}

const idcourse = async (req, res) => {
    try {
        const isValidObjectId = mongoose.Types.ObjectId.isValid(req.params.id);

        if (!isValidObjectId) {
            return res.status(400).json({ error: 'Невірний формат ідентифікатора' });
        }
        
        const course = await CardsUsers.findById(req.params.id);
        
        if (!course) {
            return res.status(404).json({ message: 'Курс не знайдено' });
        }

        return res.status(200).json(course)

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

const enrollUserInCourse = async (req, res) => {
  try {
    const userId = req.user.id; // Отримуємо ідентифікатор користувача з авторизації
    const courseId = req.params.courseId; // Отримуємо ідентифікатор курсу з параметра запиту

    const course = await CardsUsers.findById(courseId);

    // Перевіряємо, чи користувач уже записаний на цей курс
    const user = await User.findById(userId);
    const isEnrolled = user.enrolledCourses.some((course) => course.courseId.toString() === courseId);

    if (isEnrolled) {
      return res.status(400).json({ message: 'Користувач вже записаний на цей курс' });
    }

    // Створюємо об'єкт userCourseSchema для запису
    const enrollment = {
      courseId: courseId,
      courseTitle:course.title,
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

const unenrollUserFromCourse = async (req, res) => {
    try {
      const userId = req.user.id; // Отримуємо ідентифікатор користувача з авторизації
      const courseId = req.params.courseId; // Отримуємо ідентифікатор курсу з параметра запиту
  
      // Знаходимо користувача в базі даних
      const user = await User.findById(userId);
  
      if (!user) {
        return res.status(404).json({ message: 'Користувача не знайдено' });
      }
  
      // Перевіряємо, чи користувач записаний на цей курс
      const enrolledCourseIndex = user.enrolledCourses.findIndex(
        (enrollment) => enrollment.courseId.toString() === courseId
      );
  
      if (enrolledCourseIndex === -1) {
        return res.status(400).json({ message: 'Користувач не записаний на цей курс' });
      }
  
      // Видаляємо об'єкт enrollment з масиву enrolledCourses користувача
      user.enrolledCourses.splice(enrolledCourseIndex, 1);
  
      // Зберігаємо оновлені дані користувача
      await user.save();
  
      res.status(200).json({ message: 'Користувач видалений з курсу' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
};

module.exports = {
    allcourses,
    idcourse,
    enrollUserInCourse,
    unenrollUserFromCourse
  };