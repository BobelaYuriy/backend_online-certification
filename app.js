const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const mongoose = require('mongoose')
const db = require('./db');
//підключення роутів
const allCoursesRouter = require('./routes/allCourses')
const usersRouter = require('./routes/users')
// const deignCoursesRouter= require('./routes/designCourses');
// const developmentCoursesRouter= require('./routes/developmentCourses');
// const marketingCoursesRouter= require('./routes/marketingCourses');
// const personalDevelopmentCoursesRouter= require('./routes/personalDevelopmentCourses');
// const businessCoursesRouter= require('./routes/businessCourses');
// const photographyCoursesRouter= require('./routes/photographyCourses');
// const musicCoursesRouter= require('./routes/musicCourses');

const app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//дозволи для ресурів через Cors 
app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

//роути
app.use('/api', allCoursesRouter);
app.use('/api', usersRouter);

app.use((req, res, next) => {
  req.db = db; 
  next();
});


//підключення бази даних

//перехоплення помилок
app.use(function (req, res, next) {
  next(createError(404));
});

app.use(function (err, req, res, next) {

  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
