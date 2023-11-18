const Course = require("../models/courses");
const cloudinary = require("../utils/cloudinary");

const createCourse = async (req, res) => {
  try {
    const {
      title,
      image,
      description,
      instructor,
      duration,
      level,
      category,
      language,
      lessons,
    } = req.body;

    const uploadRes = await cloudinary.uploader.upload(image, {
      folder: "imagesCourses",
    });
    const newCourse = new Course({
      title,
      image: uploadRes,
      description,
      instructor,
      duration,
      level,
      category,
      language,
      lessons,
    });

    const savedCourse = await newCourse.save();
    res.status(201).json(savedCourse);
  } catch (error) {
    es.status(500).json({ error: error.message });
  }
};

const updateCourse = async (req, res) => {
  const courseId = req.params.courseId; // Отримуємо ідентифікатор курсу з параметра запиту

  try {
    // Оновлюємо курс за його ідентифікатором
    const updatedCourse = await Course.findByIdAndUpdate(
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

module.exports = {
  createCourse,
  updateCourse
};
