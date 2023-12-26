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
    const course = await CardsUsers.findById(courseId);

    if (!course) {
      return res.status(404).json({ message: "Курс не знайдено" });
    }

    // Створюємо об'єкт userCourseSchema для запису
    const enrollment = {
      courseId: courseId,
      title: course.title,
      description: course.description,
      level: course.level,
      category: course.category,
      image: course.image,
      progress: 0, // Новий користувач починає курс з прогресом 0%
      accuracy: 0,
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
const deleteCourse = async (req, res) => {
  try {
    const courseId = req.params.courseId;

    // Знаходимо курс за його ідентифікатором
    const course = await CardsUsers.findById(courseId);

    if (!course) {
      return res.status(404).json({ message: 'Курс не знайдено' });
    }

    // Видаляємо курс з бази даних
    await CardsUsers.deleteOne({ _id: courseId });

    // Також видаляємо цей курс зі всіх користувачів, які на нього записані
    await User.updateMany(
      { 'enrolledCourses.courseId': courseId },
      { $pull: { enrolledCourses: { courseId: courseId } } }
    );

    res.status(200).json({ message: 'Курс видалено успішно' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createCourse = async (req, res) => {
  try {
    // Отримати дані для створення курсу з запиту
    const { title, description, instructor, duration, level, category, language, lessons, image } = req.body;

    // Створити новий об'єкт курсу
    const newCourse = new CardsUsers({
      title,
      description,
      instructor,
      duration,
      level,
      category,
      language,
      lessons,
      image,
    });

    // Зберегти курс в базі даних
    const savedCourse = await newCourse.save();

    res.status(201).json({ message: 'Курс створено успішно', course: savedCourse });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getTestQuestions = async (req, res) => {
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

const getUserLesson = async (req, res) => {
  try {
    const courseId = req.params.courseId;
    const lessonIndex = req.params.lessonIndex;
    const course = await CardsUsers.findById(courseId);

    if (!course) {
      return res.status(404).json({ message: "Курс не знайдено" });
    }

    if (lessonIndex >= 0 && lessonIndex < course.lessons.length) {
      const lesson = course.lessons[lessonIndex];

      // Отримання індексу наступного урока
      const nextLessonIndex = parseInt(lessonIndex) + 1;
      const nextLesson = nextLessonIndex < course.lessons.length
        ? {
          index: nextLessonIndex,
          title: course.lessons[nextLessonIndex].title,
        }
        : null;

      const lessonInfo = {
        material: lesson.material,
        tests: lesson.tests,
        nextLesson: nextLesson,
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
    const userId = req.user.id; // Отримуємо ідентифікатор користувача з авторизації
    const courseId = req.params.id;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "Користувач не знайдений" });
    }

    const courseInfo = user.enrolledCourses.find(course => course.courseId.toString() === courseId);

    if (!courseInfo) {
      return res.status(404).json({ message: "Курс не знайдений" });
    }

    const course = await CardsUsers.findById(courseId);

    if (!course) {
      return res.status(404).json({ message: "Курс не знайдений" });
    }

    // Створюємо масив короткої інформації про уроки
    const lessonsInfo = course.lessons.map((lesson, index) => {
      const lessonData = {
        index: index,
        title: lesson.title,
        duration: lesson.duration,
        description: lesson.description,
        isCompleted: false, // Додано поле для визначення пройденості уроку
      };

      // Перевірка, чи користувач пройшов всі тести уроку
      const completedTests = courseInfo.completedTests.filter(test => test.lessonIndex === index);
      if (completedTests.length === lesson.tests.length) {
        lessonData.isCompleted = true;
      }

      return lessonData;
    });

    // Розділяємо уроки на всі та пройдені
    const allLessons = lessonsInfo;
    const completedLessons = lessonsInfo
      .filter(lesson => lesson.isCompleted)
      .map(lesson => ({
        lessonIndex: lesson.index,
        testResults: courseInfo.completedTests
          .filter(test => test.lessonIndex === lesson.index)
          .map(test => ({
            testIndex: test.testIndex,
            userScore: test.userScore,
            maxScore: test.maxScore,
            percentageCorrect: test.percentageCorrect,
          })),
      }));

    // Формуємо об'єкт для відповіді
    const responseObj = {
      allLessons: allLessons,
      completedLessons: completedLessons,
    };

    res.status(200).json(responseObj);
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
  getTestQuestions,
  getUserLesson,
  deleteCourse,
  createCourse
};
