const express = require('express')
const session = require('express-session');
const crypto = require('crypto');
const bodyParser = require('body-parser');
const cors = require('cors'); // CORS 미들웨어 추가 외부 접근? 허용 하기 위해서 필요
const path = require('path'); // path 모듈 추가
const multer = require('multer');

const app = express()
const port = 3000;

// ejs 설정
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'public/views')); // views 폴더 위치 설정

app.use(bodyParser.json());
app.use(cors()); // CORS 미들웨어를 사용하여 모든 도메인에서 요청을 허용
app.use(express.static(path.join(__dirname, 'public'))); // 정적 파일 위치 설정

// 32바이트 길이의 랜덤 문자열 생성
const generateRandomString = (length) => {
    return crypto.randomBytes(length).toString('hex');
};

const sessionSecret = generateRandomString(32); // 32바이트 길이의 랜덤 문자열 생성

// 세션 설정
app.use(
    session({
        secret: sessionSecret, // 임의의 문자열로 변경해야 합니다.
        resave: false,
        saveUninitialized: false,
        cookie: {
            secure: false, // HTTPS에서만 쿠키를 전송하는 경우 true로 변경해야 합니다.
            httpOnly: true, // JavaScript를 통해 쿠키에 접근하지 못하도록 하는 것이 안전합니다.
            maxAge: 24 * 60 * 60 * 1000, // 쿠키의 만료 기간 설정 (24시간 예시)
        },
    })
);

// 라우트 설정
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'html', 'index.html'));
});

app.get('/index', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'html', 'index.html'));
});

app.get('/main', (req, res) => {
    if (req.session.nickname === undefined || req.session.nickname === null) {
        console.log("로그인 안함");
        return res.sendFile(path.join(__dirname, 'public', 'html', 'index.html'));
    }

    // 세션이 있는 경우에만 'main.ejs'를 렌더링
    res.render('main', { userName: req.session.nickname, userEmail: req.session.email });
});

app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'html', 'register.html'));
});

const regRouter = require('./public/routes/reg.routes');
app.use('/', regRouter);

const loginRouter = require('./public/routes/login.routes');
app.use('/', loginRouter);

const mainRouter = require('./public/routes/main.routes');
app.use('/', mainRouter);

app.listen(port, () => {
    console.log(`서버가 http://localhost:${port} 에서 실행 중입니다.`);
});
