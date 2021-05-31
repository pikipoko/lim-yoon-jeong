const LocalStrategy = require('passport-local').Strategy;
const crypto = require('crypto');


module.exports = new LocalStrategy({
    // 각 필드로 어떤 속성이 들어오는지 명시적으로 지정해주기(안해도 되지만)
    usernameField:'name',
    passwordField:'password',
    passReqToCallback: true
}, (req, name, password, done) => {
    const paramCode = req.body.code || req.query.code;
    const paramDepartment = req.body.department || req.query.department;
    console.log('passport의 local-signup 호출됨 : ' + paramCode + ', ' + name + ', ' + password + ', ' + paramDepartment);
    
    const database = req.app.get('database');
    addUser(paramCode, name, password, paramDepartment, database.pool, (err, result) => {
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

const addUser = async (code, name, password, department, pool, callback) => {
    console.log('addUser 함수 호출됨.');

    try {
        const conn = await pool.getConnection(async(conn) => conn);
        try {
            salt = makeSalt();
            const data = {
                code: code,
                name: name,
                hashed_password: encryptPassword(password, salt),
                salt: salt,
                department: department,
            };
            const [row] = await conn.query('insert into users set ?', data);
            conn.release();
            callback(null, row);
            
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

const makeSalt = () => {
    return Math.round(new Date().valueOf() * Math.random()) + '';
}

const encryptPassword = (password, salt) => {
    return crypto.createHmac('sha512', salt).update(password).digest('hex');
}