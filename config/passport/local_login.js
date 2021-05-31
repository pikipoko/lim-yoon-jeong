const LocalStrategy = require('passport-local').Strategy;
const crypto = require('crypto');

module.exports = new LocalStrategy({
    usernameField:'code',
    passwordField:'password',
    passReqToCallback:true
}, (req, code, password, done) => {
    console.log('passport의 local-login 호출됨 : ' + code + ', ' + password);
    
    const database = req.app.get('database'); 
    authUser(code, database.pool, (err, user) => {
        if(err) {
            console.log('로그인 중 에러 발생함');
            return done(err); // 상황에 맞춰서 인증결과를 authenticate 쪽으로 알려줌
        }

        if(!user) {
            console.log('일치하는 사용자가 없습니다.');
            return done(null, false, req.flash('loginMessage', '일치하는 계정이 없습니다.'))
        }

        const authenticated = authenticate(password, user[0].salt, user[0].hashed_password);
        if(!authenticated) {
            console.log('비밀번호가 일치하지 않습니다.');
            return done(null, false, req.flash('loginMessage', '비밀번호가 일치하지 않습니다.'));
        }
            
        if (req.session.user) {
            console.log('이미 로그인 되어 있습니다.');
        }
        
        console.log('아이디와 비밀번호가 일치합니다.')
        return done(null, user[0]);
    });
});

const authUser = async (code, pool, callback) => {
    console.log('authUser 함수 호출됨.');

    try {
        const conn = await pool.getConnection(async(conn) => conn);
        try {
            const columns = ['code', 'name', 'hashed_password', 'salt', 'department'];
            const tableName = 'users';
            const [row] = await conn.query('select ?? from ?? where code = ?', [columns, tableName, code]);
            conn.release();
            if (row.length > 0) {
                console.log('일치하는 사용자 찾음.');
                callback(null, row);
            }
            else {
                console.log('일치하는 사용자가 존재하지 않음.');
                callback(null, null);       
            }
            
        } catch (err) {
            conn.release();
            console.log('사용자 조회 중 오류 : ' + err);
            callback(err, null);
        }
        
    } catch (err) {
        console.log('데이터베이스 연결 객체 오류 : ' + err);
        callback(err, null);
    }
}

const authenticate = (password, salt, hashed_password) => {
    return encryptPassword(password, salt) == hashed_password;
}

const encryptPassword = (password, salt) => {
    return crypto.createHmac('sha512', salt).update(password).digest('hex');
}