const mongoose = require("mongoose");

const userCourseSchema = new mongoose.Schema({
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: "cardsusers" }, // Посилання на курс
  courseTitle: String,
  progress: Number, // Прогрес користувача на курсі (наприклад, відсоток завершення)
  completedTests: [
    {
      lessonIndex: Number, // Індекс уроку, на якому пройдений тест
      testIndex: Number, // Індекс тесту в уроці
      userScore: Number, // Бали, отримані користувачем за тест
      maxScore: Number,
    },
  ],
});

const userSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true },
  username: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  enrolledCourses: [userCourseSchema], // Масив курсів, на які користувач записаний
  city: { type: String,default: null},
  age: { type: Number,default: null},
  sex: { type: String,default: null },
  avatar:{ type:String,default: null}
});

const User = mongoose.model("users", userSchema);

module.exports = User;
