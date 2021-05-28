// express 서버를 위한 모듈
const express = require('express');
const http = require('http');
const static = require('serve-static');
const path = require('path');

const cookieParser = require('cookie-parser');
const expressSession = require('express-session');

const cors = require('cors');

const expressErroHandler = require('express-error-handler');

const config = require('./config/config');

const database_loader = require('./database/database_loader');
const route_loader = require('./router/router_loader');

// 소켓 통신으로 받은 데이터를 블록체인에 저장하기 위한 모듈
const attendance = require('./router/attendance');

// 결제를 위한 모듈
const pay = require('./router/pay');

//===== Passport 사용 =====//
const passport = require('passport');
const flash = require('connect-flash');

// 서버 객체
const app = express(); 

// 뷰 관련 설정
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

// port 번호 설정
app.set('port', process.env.PORT || config.server_port);

// get 방식
app.use('/public', static(path.join(__dirname, 'public')));

// post 방식
app.use(express.urlencoded({extended:false})); 
app.use(express.json()); 

// 세션 추가
app.use(cookieParser());
app.use(expressSession({
    secret:'my key',
    resave:true,
    saveUninitialized:true
}));

app.use(cors());

//===== Passport 초기화 및 로그인 세션유지 =====//
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

const router = express.Router();
route_loader.init(app, router);

// passport 설정
const passportConfig = require('./config/passportConfig');
passportConfig(app, passport);

// passport 관련 함수 라우팅
const userPassport = require('./router/user');
userPassport(app, passport);

// 등록된 라우터 패스가 없는 경우
const errorHandler = expressErroHandler({
    static: {
        '404': './public/404.html'
    }
});


app.use(expressErroHandler.httpError(404));
app.use(errorHandler);

const server = http.createServer(app).listen(app.get('port'), async function() {    
    console.log('익스프레스로 웹 서버를 실행함 : ' + app.get('port'));
    
    database_loader.init(app);
});

// socket 서버 실행
// 추후 허용된 클라이언트만 접근하도록 제한둬야함 
// -> 현재는 간단하게만 구현해둔 상태
const socketio = require('socket.io')(server);
socketio.sockets.on('connection', (socket) => {
    socket.on('streaming', (data) => {
		console.log(data);
        attendance.submitHistory(data);
	});

    socket.on('pay', (data) => {
        console.log(data.code + " : " + data.price);
     
        const result = await pay.transfer(database_loader, data.code, data.price);
        if (result) {
            console.log('결제 성공');
            socket.emit('pay', 'completed');
        }
        else {
            //원래는 각각을 세분화 해야함.
            console.log('잔액 부족 또는 일치하는 사용자 정보 없음.');
            socket.emit('pay', 'row balance');
        }
    })
});
console.log('소켓 서버 실행 완료.');