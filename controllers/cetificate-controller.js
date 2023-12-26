const cloudinary = require("../utils/cloudinary");
const { createCanvas, loadImage, registerFont } = require("canvas");
const User = require("../models/user");
const Course = require("../models/courses");
const path = require('path');

const certificate = async (req, res) => {
  try {
    const userId = req.user.id;
    const courseId = req.params.courseId;
    // Отримати дані користувача та курсу з бази даних
    const user = await User.findById(userId);
    const course = await Course.findById(courseId);
    const enrolledCourse = user.enrolledCourses.find(course => course.courseId.toString() === courseId);

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
    const pathToFont = path.join(__dirname, '../utils/times.ttf');
    const font = await registerFont(pathToFont, { family: 'TIMES' });
    // Стилі тексту для привітання
    context.font = "60px TIMES"; // Зміна розміру та шрифту
    context.fillStyle = "#386058";
    context.textAlign = "center"; // Центрування тексту
    
    // Виведення привітання в центрі сертифікату
    const welcomeText = `Вітаємо, ${user.username}!`;
    context.fillText(welcomeText, canvas.width / 2, 250);
    
    // Стилі для повідомлення про завершення курсу
    context.font = "50px TIMES"; // Зміна розміру та шрифту
    context.fillStyle = "#DA3755"; // Зміна кольору тексту
    
    // Виведення повідомлення про завершення курсу
    const courseCompletionText = "Ви успішно завершили курс:";
    context.fillText(courseCompletionText, canvas.width / 2, 350);
    
    // Виведення назви курсу в центрі сертифікату
    const courseTitleText = course.title;
    context.fillText(courseTitleText, canvas.width / 2, 400);

    // Отримати сертифікат як base64 строку
    const certificateBase64 = canvas.toDataURL("image/jpeg");

    // Завантажити base64 строку сертифіката на Cloudinary
    const uploadRes = await cloudinary.uploader.upload(certificateBase64, {
      folder: "imagesCertificates",
    });

    // Оновити користувача, додавши інформацію про пройдений курс
    enrolledCourse.certificate = uploadRes.url;

    // Зберегти оновлені дані користувача
    await user.save();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


module.exports = {
  certificate,
};
