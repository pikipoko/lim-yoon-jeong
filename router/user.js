

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
        console.log('/user 패스로 GET 요청됨.');

        const userSession = req.session.passport; 
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
}