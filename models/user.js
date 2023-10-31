const mongoose = require('mongoose');

const userCourseSchema = new mongoose.Schema({
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'cardsusers' }, // Посилання на курс
  progress: Number, // Прогрес користувача на курсі (наприклад, відсоток завершення)
  completedTests: [
    {
      lessonIndex: Number, // Індекс уроку, на якому пройдений тест
      testIndex: Number, // Індекс тесту в уроці
      score: Number // Бали, отримані користувачем за тест
    }
  ]
});

const userSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true },
  username: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  enrolledCourses: [userCourseSchema] // Масив курсів, на які користувач записаний
});

const User = mongoose.model('users', userSchema);

module.exports = User;