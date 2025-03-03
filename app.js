var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

const {engine} = require('express-handlebars');

app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views')); // Usa path.join per la portabili
app.engine('hbs', engine({
  extname: '.hbs',
  defaultLayout: 'main',
  partialsDir: path.join(__dirname, 'views/partials'), // Specifica la cartella dei partials
  helpers: {  // Definisci gli helper qui
    formatDate: function(date) { // Helper formatDate
      if (!date) {
        return '';  // Gestisci il caso in cui la data è null/undefined
      }
      try {
        // Usa la libreria 'moment' (MOLTO più semplice di Intl.DateTimeFormat)
        return new Intl.DateTimeFormat('it-IT', { //Formattazione data
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }).format(new Date(date));

      } catch (error) {
        console.error("Errore nella formattazione della data:", error);
        return date; // Restituisci la data non formattata in caso di errore
      }
    }
  }
}));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);

app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

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
