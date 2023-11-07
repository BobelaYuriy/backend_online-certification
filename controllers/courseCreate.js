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

module.exports = {
  createCourse,
};
