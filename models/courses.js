const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
  text: String, // Текст питання
  options: [String], // Варіанти відповідей
  correctAnswer: Number, // Індекс правильної відповіді в масиві options
});

const testSchema = new mongoose.Schema({
  title: String, // Назва тесту
  questions: [questionSchema], // Питання та варіанти відповідей
});

const lessonSchema = new mongoose.Schema({
  title: String,
  duration: String,
  description: String,
  material: {type:String, default:null},
  tests: [testSchema], // Масив тестів для уроку
});

const courseSchema = new mongoose.Schema({
  title: String,
  image: {type:String, default:null},
  description: String,
  instructor: {
    name: String,
    bio: String,
  },
  duration: String,
  level: String,
  category: String,
  language: String,
  lessons: [lessonSchema],
});

const Course = mongoose.model("cardsusers", courseSchema);

module.exports = Course;
