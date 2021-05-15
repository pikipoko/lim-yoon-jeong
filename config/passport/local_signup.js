const LocalStrategy = require('passport-local').Strategy;
const crypto = require('crypto');


module.exports = new LocalStrategy({
    // 각 필드로 어떤 속성이 들어오는지 명시적으로 지정해주기(안해도 되지만)
    usernameField:'email',
    passwordField:'password',
    passReqToCallback: true
}, (req, email, password, done) => {
    const paramCode = req.body.code || req.query.code;
    console.log('passport의 local-signup 호출됨 : ' + email + ', ' + password + ', ' + paramCode);
    
    const database = req.app.get('database');
    addUser(email, password, paramCode, database.pool, (err, result) => {
        if (err) {
            console.log('사용자 추가 중 오류 발생.');
            return done(err);
        }

        if (result) {
            console.log('사용자 추가 성공.');
            console.dir(result);
            return done(null, result);
        }
    });
});

const addUser = (email, password, code, pool, callback) => {
    console.log('addUser 함수 호출됨.');

    pool.getConnection((err, conn) => {
        if (err) {
            if (conn) {
                conn.release();
            }

            callback(err, null);
        }

        salt = makeSalt();
        const data = {
            email: email,
            hashed_password: encryptPassword(password, salt),
            salt: salt,
            code: code
        };

        console.log(data.hashed_password);
        const exec = conn.query('insert into users set ?', data, (err, result) => {
            conn.release();
            
            if (err) {
                console.log('sql 실행 중 오류 발생');
                console.dir(err);

                callback(err, null);
            }

            callback(null, result);
        })
    })
}

const makeSalt = () => {
    return Math.round(new Date().valueOf() * Math.random()) + '';
}

const encryptPassword = (password, salt) => {
    return crypto.createHmac('sha512', salt).update(password).digest('hex');
}