

module.exports = (router, passport) => { // router는 app 객체를 인자로 받은 것
    console.log('user_passport 호출됨.');
    
    //===== 회원가입과 로그인 라우팅 함수 =====//
    router.route('/login').get((req, res) => {
        console.log('/login 패스로 GET 요청됨.');

        res.redirect('/public/login.html');
    });

    router.route('/login').post(passport.authenticate('local-login', {       
        successRedirect: '/public/index.html',
        failureRedirect: '/login',
        failureFlash: true
    }));
    
    router.route('/signup').get((req, res) => {
        console.log('/signup 패스로 GET 요청됨.');

        res.redirect('/public/signup.html');
    });

    router.route('/signup').post(passport.authenticate('local-signup', {
        successRedirect: '/public/index.html',
        failureRedirect: '/signup',
        failureFlash: true
    }));

    router.route('/logout').get((req, res) => {
        console.log('/logout 패스로 GET 요청됨.');

        req.logout(); // req.user에 들어있는 로그인 세션 삭제
        res.redirect('/');
    });
}