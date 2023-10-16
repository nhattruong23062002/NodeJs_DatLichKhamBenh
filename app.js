var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const passport = require('passport');
const cors = require('cors');

const {
  passportConfig,
  passportConfigLocal
} = require('./middlewares/passport');




var connectDB =require("./config/connectDB") ;


var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users/router');
var specialtyRouter = require('./routes/specialty/router');
var scheduleRouter = require('./routes/schedule/router');
var historyRouter = require('./routes/history/router');
var clinicRouter = require('./routes/clinic/router');
var bookingRouter = require('./routes/booking/router');
var allcodeRouter = require('./routes/allcode/router');
var markdownRouter = require('./routes/markdown/router');
var doctorinforRouter = require('./routes/doctor-infor/router');




var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

passport.use(passportConfig);
passport.use(passportConfigLocal);

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(
  cors({
    origin: '*',
  }),
);

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/specialty', specialtyRouter);
app.use('/schedule', scheduleRouter);
app.use('/history', historyRouter);
app.use('/clinic', clinicRouter);
app.use('/booking', bookingRouter);
app.use('/allcode', allcodeRouter);
app.use('/markdown', markdownRouter);
app.use('/doctor-infor', doctorinforRouter);








// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

connectDB();
// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
