const cloudinary = require("../utils/cloudinary");
const { createCanvas, loadImage } = require("canvas");
const User = require("../models/user");
const Course = require("../models/courses");
const path = require('path');

const certificate = async (req, res) => {
  try {
    const { userId, courseId } = req.body;

    // Отримати дані користувача та курсу з бази даних
    const user = await User.findById(userId);
    const course = await Course.findById(courseId);
    
    if (!user || !course) {
      return res
        .status(404)
        .json({ message: "Користувач або курс не знайдено" });
    }

    const canvas = createCanvas(900, 637);
    const context = canvas.getContext("2d");
    
    // Завантажити фонове зображення сертифіката
    const certificatePath = path.join(__dirname, '../utils/certificate.jpg');
    const background = await loadImage(certificatePath);
    context.drawImage(background, 0, 0, canvas.width, canvas.height);
    
    // Стилі тексту для привітання
    context.font = "60px 'Times New Roman', Times, serif"; // Зміна розміру та шрифту
    context.fillStyle = "#004B38";
    context.textAlign = "center"; // Центрування тексту
    
    // Виведення привітання в центрі сертифікату
    const welcomeText = `Вітаємо, ${user.username}!`;
    context.fillText(welcomeText, canvas.width / 2, 150);
    
    // Стилі для повідомлення про завершення курсу
    context.font = "50px 'Arial', sans-serif"; // Зміна розміру та шрифту
    context.fillStyle = "#C01C2B"; // Зміна кольору тексту
    
    // Виведення повідомлення про завершення курсу
    const courseCompletionText = "Ви успішно завершили курс:";
    context.fillText(courseCompletionText, canvas.width / 2, 250);
    
    // Виведення назви курсу в центрі сертифікату
    const courseTitleText = course.title;
    context.fillText(courseTitleText, canvas.width / 2, 300);

    // Отримати сертифікат як base64 строку
    const certificateBase64 = canvas.toDataURL("image/jpeg");

    // Завантажити base64 строку сертифіката на Cloudinary
    const uploadRes = await cloudinary.uploader.upload(certificateBase64, {
      folder: "imagesCertificates",
    });

    // Оновити користувача, додавши інформацію про пройдений курс
    user.enrolledCourses.push({
      courseId: course._id,
      courseTitle: course.title,
      certificateUrl: uploadRes.url,
    });

    // Зберегти оновлені дані користувача
    await user.save();

    res
      .status(201)
      .json({
        message: "Сертифікат збережено",
        certificateUrl: uploadRes.url,
      });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  certificate,
};
