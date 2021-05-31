const attendance = require('./attendance');
const apiCrypto = require('./apiCrypto');

module.exports = (router, passport) => { // router는 app 객체를 인자로 받은 것
    console.log('user_passport 호출됨.');
    
    //===== 회원가입과 로그인 라우팅 함수 =====//
    router.route('/user').post(passport.authenticate('local-login', {       
        successRedirect: '/userShow',
        failureRedirect: '/public/login.html',
        failureFlash: true
    }));
    
    router.route('/admin/list/signup').get((req, res) => {
        console.log('/admin/list/signup 패스로 GET 요청됨.');

        const adminSession = req.session.admin;
        if (adminSession) {
            console.log('관리자 로그인 정보가 있습니다.');
        }
        else {
            console.log('관리자 로그인 정보가 없습니다.');
            res.redirect('/public/login.html');
            return;
        }
        res.render('signup.ejs');
        return;
    });

    router.route('/admin/list/signup').post(passport.authenticate('local-signup', {
        successRedirect: '/admin/list',
        failureRedirect: '/admin/list/signup',
        failureFlash: true
    }));

    router.route('/logout').get((req, res) => {
        console.log('/logout 패스로 GET 요청됨.');

        req.logout(); // req.user에 들어있는 로그인 세션 삭제
        res.redirect('/');
    });

    router.route('/userShow').get((req, res) => {
        console.log('/userShow 패스로 GET 요청됨.');

        const userSession = req.user; 
        if (userSession) {
            console.log('유저 로그인 정보가 있습니다.');
        }
        else {
            console.log('유저 로그인 정보가 없습니다.');
            res.redirect('/public/login.html');
            return;
        }

        res.render('user.ejs');     
    })

    router.route('/userShow').post(async(req, res) => {
        console.log('/userShow 패스로 POST 요청됨.');

        const userSession = req.user; 
        if (userSession) {
            console.log('유저 로그인 정보가 있습니다.');
        }
        else {
            console.log('유저 로그인 정보가 없습니다.');
            res.redirect('/public/login.html');
            return;
        }

        const userCode = userSession.code;
        const response = await attendance.getHistory(userCode);
        res.json(response);
        return;
    })

    router.route('/user/addInfo').get((req, res) => {
        console.log('/user/addInfo 패스로 GET 요청됨.');

        const userSession = req.user; 
        if (userSession) {
            console.log('유저 로그인 정보가 있습니다.');
        }
        else {
            console.log('유저 로그인 정보가 없습니다.');
            res.redirect('/public/login.html');
            return;
        }
        res.render('addUserInfo.ejs');
        return;
    });

    router.route('/user/addInfo').post(async(req, res) => {
        console.log('/user/addInfo 패스로 POST 요청됨.');

        const userSession = req.user; 
        if (userSession) {
            console.log('유저 로그인 정보가 있습니다.');
        }
        else {
            console.log('유저 로그인 정보가 없습니다.');
            res.redirect('/public/login.html');
            return;
        }

        const paramAccount = req.body.account || req.query.account;
        const paramPassword = req.body.password || req.query.password;
        console.log(paramAccount + ' : ' + paramPassword + ' -> ' + userSession.code);

        const database = req.app.get('database');
        try {
            const conn = await database.pool.getConnection(async(conn) => conn);
            try {
                const account = paramAccount;
                const private_key = apiCrypto.encrypt(paramPassword);

                const [row] = await conn.query('update users set account =?, private_key =? where code =?', [account, private_key, userSession.code]);
                conn.release();
                
            } catch (err) {
                conn.release();
                console.log('사용자 정보 업데이트 중 오류 : ' + err);
            }
            
        } catch (err) {
            console.log('데이터베이스 연결 객체 오류 : ' + err);
        }
        res.redirect('/userShow');
    });
}