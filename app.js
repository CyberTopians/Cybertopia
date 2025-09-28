var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

const cors = require("cors");

app.use(cors({
    origin: "http://localhost:4200", // allow Angular dev server
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
}));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);




// Serve Angular frontend
app.use(express.static(path.join(__dirname, "frontend/dist/frontend")));

// Catch-all to handle Angular routing (must be last)
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend/dist/frontend/index.html"));
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  res.status(err.status || 500);

  // If request is to API, return JSON
  if (req.originalUrl.startsWith("/api") || req.originalUrl.startsWith("/users")) {
    res.json({ error: err.message });
  } else {
    // Otherwise just send text (Angular will catch the route if it exists)
    res.send(err.message);
  }
});

module.exports = app;
