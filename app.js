#!/usr/bin/env node
var createError = require('http-errors');
//zlib壓縮
var compression = require('compression');
var express = require('express');
var engine = require('ejs-locals');
var path = require('path');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var flash = require('connect-flash');
var logger = require('morgan');

var app = express();

//database
const firebase_db = require('./connections/firebase_admin_connect');
const layout_datadase = require('./routes/layout');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var forumRouter = require('./routes/forum');
var signinRouter = require('./routes/signin');
var articleRouter = require('./routes/article');
var dashboard = require('./routes/dashboard');
var searchRouter = require('./routes/search');
var justcontrolRouter = require('./routes/justcontrol');


app.engine('ejs', engine);
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
//zlib壓縮
app.use(compression());

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({
    extended: false
}));
app.use(cookieParser());
app.use(session({
    store: new firebase_db.FirebaseStore({
      database: firebase_db.ref.database()
    }),
    name:'justforum',
    secret: 'asdfasgbrwew77et53hnhwetynsy',
    resave: true,
    saveUninitialized: true,
    cookie: {
        secure: false
    }
}));
app.use(flash());
app.use(express.static(path.join(__dirname, 'public')));


//紀錄查看過文章的ip
var article_watch = [];
var today = 0;
(function clear_article_watch() {
    setInterval(()=>{
        if (new Date().getDate() !== today){
            today = new Date().getDate();
            article_watch = [];
        }
    },60000);
})();

function getIp(req, res, next) {
    if (req.method == 'POST'){
        return next();
    }
    if (!req.config){
        req.config = {};
    }
    req.config.ip = (req.headers["x-forwarded-for"] || "").split(",").pop() || req.connection.remoteAddress.replace(/^.*:/, "") || req.socket.remoteAddress.replace(/^.*:/, "") || req.connection.socket.remoteAddress.replace(/^.*:/, "");

    if (req.originalUrl.substr(0,12) == '/article?id='){
        let step1 = true;
        for (const key in article_watch) {
            if (article_watch[key].ip == req.config.ip) {
                if (article_watch[key].article.indexOf(req.originalUrl.substr(12)) == -1) {
                    article_watch[key].article += req.originalUrl.substr(12);
                    req.config.watch = 1;
                }
                step1 = false;
                break;
            }
        }
        if (step1){
            article_watch.push({ip:req.config.ip,article:req.originalUrl.substr(12)});
            req.config.watch = 1;
        }
    }
    //聊天室歷史紀錄
    req.config.local_msg = local_msg;
    next();
}

app.use('/',getIp, indexRouter);
app.use('/user',getIp, usersRouter);
app.use('/forum',getIp, forumRouter);
app.use('/signin',getIp, signinRouter);
app.use('/article',getIp, articleRouter);
app.use('/dashboard',getIp, dashboard);
app.use('/search',getIp, searchRouter);
app.use('/justcontrol', getIp, justcontrolRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    next(createError(404));
});

// error handler
app.use(getIp,function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = '找不到該頁面喔~' || err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    layout_datadase.layout(req.session.uid || '', 'home').then(function (layout) {
        let layout_data = layout;
        layout_data.url = layout.local_URL + req.originalUrl;
        res.render('error', {
            title: '找不到該頁面喔!',
            auth: req.session.uid || '',
            layout_data: layout_data,
            path_type: ['home'],
            config: req.config || ''
        });
    });

});



//================================================server================================================
/**
 * Module dependencies.
 */

var debug = require('debug')('justeasy:server');
var http = require('http');

/**
 * Get port from environment and store in Express.
 */

var port = normalizePort(process.env.PORT || '3000');
app.set('port', port);

/**
 * Create HTTP server.
 */

var server = http.createServer(app);
//open socket.io
const io = require('socket.io')(server);

var online_person = [[],[]];
var local_msg = [];
var room = [];
io.on('connection', (socket) => {

    socket.on('online', (msg) => {
        //會員
        if (msg.auth){
            if (online_person[0].indexOf(msg.ip) !==-1){
                online_person[0].splice(online_person[0].indexOf(msg.ip),1);
            }
            if (online_person[1].indexOf(msg.ip) == -1) {
                online_person[1].push(msg.ip);
            }
        }else{
            if (online_person[1].indexOf(msg.ip) !== -1) {
                online_person[1].splice(online_person[1].indexOf(msg.ip), 1);
            }
            if (online_person[0].indexOf(msg.ip) == -1) {
                online_person[0].push(msg.ip);
            }
        }
        let all_person_num = online_person[0].length + online_person[1].length;
        io.emit('online', {
            not_auth: online_person[0].length,
            all: all_person_num
        });
    });
    //公共聊天
    socket.on('send', (msg) => {
        let msg_ = msg;
        let today = new Date();
        let utc = 0;
        if (today.getTimezoneOffset() !== -480){
            let set_utc = 8;
            utc = (today.getTimezoneOffset()/60)*-1;
            utc = -(utc - set_utc);
        }
        msg_.date = today.getFullYear() + '/' + (today.getMonth() + 1) + '/' + today.getDate() + '-' + (today.getHours() + utc) + ':' + today.getMinutes();
        local_msg.push(msg_);
        if (local_msg.length >60){
            local_msg.splice(0,10);
        }
        io.emit('getmsg', msg_);
    });
    socket.on('disconnect', () => {
        online_person = [[],[]];
        io.emit('online_test', '');
    });
    
    // //向被監看者要求畫面
    // socket.on('req_img', (id) => {
    //     io.to(id).emit('give_me', 'img');
    // });
    // //收到img
    // socket.on('getimg', (img) => {
    //     io.to(img.user_id).emit('img', 'data:image/jpeg;base64,' + img);
    // });
    // //被監看端
    // socket.on('add_watch_id', (msg) => {
    //     let inroom = false;
    //     for (const key in room) {
    //         if(room[key].user == msg.user){
    //             inroom = true;
    //         }
    //     }
    //     if (!inroom){
    //         room.push({user:msg.user,watch_list:[{id:msg.id,name:msg.name}]});
    //     }else{
    //         room[key].watch_list.push({id:msg.id,name:msg.name});
    //     }
    // });

    // //刷新再線清單，並寄給boss清單
    // socket.on('send_boss',(msg)=>{
    //     let user = msg.user; //帳號
    //     let id = msg.id; //被監看id
    //     for (const key in room) {
    //         if (room[key].user == user) {
    //             room[key].watch_list.push({id:id,name:msg.name});
    //             io.to(msg.boss).emit('online_id', {id:id,name:msg.name});
    //             break;
    //         }
    //     }
    // });

    // //監看端上線
    // socket.on('req_online_id', (msg) => {
    //     let user = msg.user;
    //     let boss = msg.id;
    //     for (const key in room) {
    //         if (room[key].user == user) {
    //             let temp = room[key].watch_list.slice(0);
    //             room[key].watch_list.length = 0;
    //             for (const list in temp) {
    //                 //檢查所有被監看者是否再線
    //                 io.to(temp[list].id).emit('boss_id', boss);
    //             }
    //             break;
    //         }else{
    //             socket.emit('get_watch_list', {msg:'no_person'});
    //         }
    //     }
    // });
});

/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
    var port = parseInt(val, 10);

    if (isNaN(port)) {
        // named pipe
        return val;
    }

    if (port >= 0) {
        // port number
        return port;
    }

    return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
    if (error.syscall !== 'listen') {
        throw error;
    }

    var bind = typeof port === 'string' ?
        'Pipe ' + port :
        'Port ' + port;

    // handle specific listen errors with friendly messages
    switch (error.code) {
        case 'EACCES':
            console.error(bind + ' requires elevated privileges');
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.error(bind + ' is already in use');
            process.exit(1);
            break;
        default:
            throw error;
    }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
    var addr = server.address();
    var bind = typeof addr === 'string' ?
        'pipe ' + addr :
        'port ' + addr.port;
    debug('Listening on ' + bind);
}