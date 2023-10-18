const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema({
  title: String,
  duration: String,
  description: String
});

const courseSchema = new mongoose.Schema({
  title: String,
  description: String,
  instructor: {
    name: String,
    bio: String
  },
  duration: String,
  level: String,
  category: String,
  language: String,
  lessons: [lessonSchema]
});

const CardsUsers = mongoose.model('cardsusers', courseSchema);
module.exports = CardsUsers;