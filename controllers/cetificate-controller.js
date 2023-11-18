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

    // Створити новий елемент canvas
    const canvas = createCanvas(900, 637);
    const context = canvas.getContext("2d");

    // Завантажити фонове зображення сертифіката
    const certificatePath = path.join(__dirname, '../utils/certificate.jpg');
    const background = await loadImage(certificatePath);
    context.drawImage(background, 0, 0, canvas.width, canvas.height);

    // Додати ім'я користувача та інші дані
    context.font = "40px Arial";
    context.fillStyle = "#000000";
    context.fillText(`Вітаємо, ${user.username}!`, 100, 100);
    context.fillText(`Ви успішно завершили курс: ${course.title}`, 100, 150);

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
