const CardsUsers = require("../models/courses");
const User = require("../models/user"); // Підключення моделі користувача
const mongoose = require("mongoose");

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
      query.title = { $regex: searchQuery, $options: "i" };
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
};

const idcourse = async (req, res) => {
  try {
    const isValidObjectId = mongoose.Types.ObjectId.isValid(req.params.id);

    if (!isValidObjectId) {
      return res.status(400).json({ error: "Невірний формат ідентифікатора" });
    }

    const course = await CardsUsers.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: "Курс не знайдено" });
    }

    const userId = req.user.id; // Отримання ID користувача з авторизації
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "Користувача не знайдено" });
    }

    // Перевірка, чи користувач записаний на курс
    const isEnrolled = user.enrolledCourses.some(
      (enrolledCourse) => enrolledCourse.courseId.toString() === req.params.id
    );
    // Створюємо новий об'єкт, який містить об'єкт course та поле isEnrolled
    const resultObject = {
      isEnrolled,
      ...course.toObject(), // Копіюємо властивості курсу
    };


    return res.status(200).json(resultObject);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const enrollUserInCourse = async (req, res) => {
  try {
    const userId = req.user.id; // Отримуємо ідентифікатор користувача з авторизації
    const courseId = req.query.id; // Отримуємо ідентифікатор курсу з параметра запиту

    // Перевіряємо, чи користувач уже записаний на цей курс
    const user = await User.findById(userId);
    const isEnrolled = user.enrolledCourses.some(
      (course) => course.courseId.toString() === courseId
    );

    if (isEnrolled) {
      return res
        .status(400)
        .json({ message: "Користувач вже записаний на цей курс" });
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

    res.status(200).json({ message: "Користувач успішно записаний на курс" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const unenrollUserFromCourse = async (req, res) => {
  try {
    const userId = req.user.id; // Отримуємо ідентифікатор користувача з авторизації
    const courseId = req.query.id; // Отримуємо ідентифікатор курсу з параметра запиту

    // Знаходимо користувача в базі даних
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "Користувача не знайдено" });
    }

    // Перевіряємо, чи користувач записаний на цей курс
    const enrolledCourseIndex = user.enrolledCourses.findIndex(
      (enrollment) => enrollment.courseId.toString() === courseId
    );

    if (enrolledCourseIndex === -1) {
      return res
        .status(400)
        .json({ message: "Користувач не записаний на цей курс" });
    }

    // Видаляємо об'єкт enrollment з масиву enrolledCourses користувача
    user.enrolledCourses.splice(enrolledCourseIndex, 1);

    // Зберігаємо оновлені дані користувача
    await user.save();

    res.status(200).json({ message: "Користувач видалений з курсу" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const updateCourse = async (req, res) => {
  const courseId = req.params.courseId; // Отримуємо ідентифікатор курсу з параметра запиту

  try {
    // Оновлюємо курс за його ідентифікатором
    const updatedCourse = await CardsUsers.findByIdAndUpdate(
      courseId,
      { $set: req.body }, // req.body містить дані для оновлення
      { new: true } // Опція new дозволяє повертати оновлену версію курсу
    );

    if (!updatedCourse) {
      return res.status(404).json({ message: "Курс не знайдено" });
    }

    res.status(200).json(updatedCourse); // Повертаємо оновлену версію курсу
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getTestQuestions= async (req, res) => {
  try {
    const courseId = req.params.courseId;
    const lessonIndex = req.params.lessonIndex;
    const testIndex = req.params.testIndex;

    // Знайти курс за ідентифікатором
    const course = await CardsUsers.findById(courseId);

    if (!course) {
      return res.status(404).json({ message: "Курс не знайдено" });
    }

    // Знайти урок в курсі за індексом
    const lesson = course.lessons[lessonIndex];

    if (!lesson) {
      return res.status(404).json({ message: "Урок не знайдено" });
    }

    // Знайти тест в уроці за індексом
    const test = lesson.tests[testIndex];

    if (!test) {
      return res.status(404).json({ message: "Тест не знайдено" });
    }

    // Повернути тільки питання тесту та варіанти відповідей
    const questions = test.questions.map((question) => {
      return {
        text: question.text,
        options: question.options,
      };
    });

    res.status(200).json({ questions });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getLessonInfo = async (req, res) => {
  try {
    const courseId = req.params.courseId;
    const lessonIndex = req.params.lessonIndex;

    const course = await CardsUsers.findById(courseId);

    if (!course) {
      return res.status(404).json({ message: "Курс не знайдено" });
    }

    if (lessonIndex >= 0 && lessonIndex < course.lessons.length) {
      const lesson = course.lessons[lessonIndex];
      const lessonInfo = {
        title: lesson.title,
        description: lesson.description,
        duration: lesson.duration,
        tests: lesson.tests.map(test => {
          return {
            title: test.title,
          };
        }),
      };

      res.status(200).json(lessonInfo);
    } else {
      res.status(404).json({ message: "Урок не знайдено" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getCourseLessons = async (req, res) => {
  try {
    const courseId = req.params.courseId;

    // Знайти курс за ідентифікатором
    const course = await CardsUsers.findById(courseId);

    if (!course) {
      return res.status(404).json({ message: "Курс не знайдено" });
    }

    // Створити масив для зберігання даних про уроки та тести
    const lessonsAndTests = course.lessons.map((lesson) => {
      // Для кожного уроку витягти необхідну інформацію
      const lessonData = {
        title: lesson.title,
        duration: lesson.duration,
        description: lesson.description,
        material: lesson.material,
      };

      // Додати інформацію про тести уроку
      lessonData.tests = lesson.tests.map((test) => {
        return {
          title: test.title,
          //testId: test._id, // або може вам треба test._id.toString(), залежно від потреб
        };
      });

      return lessonData;
    });

    res.status(200).json(lessonsAndTests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  allcourses,
  idcourse,
  enrollUserInCourse,
  unenrollUserFromCourse,
  updateCourse,
  getCourseLessons,
  getLessonInfo,
  getTestQuestions
};
