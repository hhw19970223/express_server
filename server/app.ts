var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var hhwRouter = require('./base/routes/hhw');
var execRouter = require('./base/routes/exec');
var express_session = require("express-session");
var app = express();

app.all('*', function (req: any, res: any, next: any) {//做跨域请求
    //   res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Origin', req.headers.origin);
    res.header('Access-Control-Allow-Headers', ['token','x-requested-with','Content-Type']);
    res.header('Access-Control-Allow-Methods', '*');
    res.header('Content-Type', 'application/json;charset=utf-8');
    res.header('Access-Control-Allow-Credentials', true);
    next();
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express_session({
    resave: true,
    saveUninitialized: false,
    secret: "hhw",
    name: "hhw",
    cookie: {
        maxAge: 200 * 60 * 1000,
    },
}));

app.use('/', hhwRouter);
app.use('/', execRouter);

// catch 404 and forward to error handler
app.use(function (req: any, res: any, next: any) {
    next(createError(404));
});

// error handler
app.use(function (err: any, req: any, res: any, next: any) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;
