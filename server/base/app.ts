/// <reference path="./http.ts" />
/// <reference path="./router.ts" />
module H {
    const dotenv = require('dotenv');
    dotenv.config('../env');
    const createError = require('http-errors');
    const path = require('path');
    const cookieParser = require('cookie-parser');
    const logger = require('morgan');
    const express_session = require("express-session");
    const express = require('express');
    export const $env = process.env;
    export let port: number = parseInt($env.PORT + "")  || 8009;
    export let app = express();
    
    app.all('*', function (req: any, res: any, next: any) {//做跨域请求
        //   res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Origin', req.headers.origin);
        res.header('Access-Control-Allow-Headers', ['token', 'x-requested-with', 'Content-Type']);
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

    app.use('/', H.Router.create_router(express));

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

    app.set('port', port);
    H.Http.createHttp(app, port);
}

