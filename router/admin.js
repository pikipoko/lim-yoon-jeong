const config = require('../config/config');
const attendance = require('./attendance');

const adminLogin = (req, res) => {
    console.log('/adminLogin POST 요청됨.');

    if (req.body.id == config.admin_id) {
        if (req.body.password == config.admin_password) {
            console.log('관리자 인증 완료.');

            req.session.admin = {
                id: config.admin_id
            }
            res.redirect('/admin');
            return;
        }
    }
    console.log('인증 실패.');
    res.redirect('/public/login.html');
}

const admin = (req, res) => {
    const adminSession = req.session.admin;
    console.log(adminSession);
    if (adminSession) {
        console.log('관리자 로그인 정보가 있습니다.');
    }
    else {
        console.log('관리자 로그인 정보가 없습니다.');
        res.redirect('/public/login.html');
        return;
    }

    res.render('program');
}

const list = (req, res) => {
    console.log('admin/list 패스로 GET 요청됨.');

    const adminSession = req.session.admin;
    console.log(adminSession);
    if (adminSession) {
        console.log('관리자 로그인 정보가 있습니다.');
    }
    else {
        console.log('관리자 로그인 정보가 없습니다.');
        res.redirect('/public/login.html');
        return;
    }

    const database = req.app.get('database'); 
    database.pool.getConnection((err, conn) => {
        if (err) {
            console.log('커넥션 풀에서 데이터 베이스 연결 객체 가져오는 중 에러 발생.');
            console.log(err);
            if (conn) {
                conn.release();
            }
            throw err;
        }

        const columns = ['code', 'name', 'department'];
        const tableName = 'users';

        const exec = conn.query('select ?? from ??', [columns, tableName], (err, results) => {
            conn.release();
            
            if (err) {
                console.log('sql 실행 중 오류 발생');
                console.dir(err);

                //callback(err, null);
            }

            if (results) {
                console.log(results);
                var context = {
                    results:results
                };
                req.app.render('list', context, function(err, html) {
                    if(err) {
                        console.error('뷰 렌더링 중 에러 발생 : ' + err.stack);
                        console.log('에러 발생.');

                        res.writeHead(200, {"Content-Type":"text/html;charset=utf8"});
                        res.write('<h1>뷰 렌더링 중 에러 발생</h1>');
                        res.write('<br><p>' + err.stack + '<p>');
                        res.end();
                        return;
                    }
                
                    res.writeHead(200, {"Content-Type":"text/html;charset=utf8"});
                    res.end(html);
                });              
            } else {
                console.log('에러 발생.');
                res.writeHead(200, {"Content-Type":"text/html;charset=utf8"});
                res.write('<h1>검색 실패.</h1>');
                res.end();
            }
        })
    })
}

/*
const show = (req, res) => {
    console.log('admin/show 패스로 GET 요청됨.');

    const adminSession = req.session.admin;
    console.log(adminSession);
    //const session = req.session.passport; -> 이거는 유저 페이지에 조회 시 사용..
    if (adminSession) {
        console.log('관리자 로그인 정보가 있습니다.');
    }
    else {
        console.log('관리자 로그인 정보가 없습니다.');
        res.redirect('/public/login.html');
        return;
    }
    
    res.render('show');
}

const showHistory = async (req, res) => {
    console.log('admin/show 패스로 POST 요청됨.');

    //const adminSession = req.session.admin;
    //console.log(adminSession);
    //const session = req.session.passport; -> 이거는 유저 페이지에 조회 시 사용..
    //if (adminSession) {
    //    console.log('관리자 로그인 정보가 있습니다.');
    //}
    //else {
    //    console.log('관리자 로그인 정보가 없습니다.');
    //    res.redirect('/public/login.html');
    //    return;
    //}

    const response = await attendance.getHistoryAll();
    res.send(response.getLists);
    return;
    //console.log(results);
    if (response.result) {
        //console.log(results.getLists);
        const context = {
            results: response.getLists
        };
        req.app.render('show', context, function(err, html) {
            if(err) {
                console.error('뷰 렌더링 중 에러 발생 : ' + err.stack);
                console.log('에러 발생.');

                res.writeHead(200, {"Content-Type":"text/html;charset=utf8"});
                res.write('<h1>뷰 렌더링 중 에러 발생</h1>');
                res.write('<br><p>' + err.stack + '<p>');
                res.end();
                return;
            }
        
            res.writeHead(200, {"Content-Type":"text/html;charset=utf8"});
            res.end(html);
        });              
    } else {
        console.log('에러 발생.');
        res.writeHead(200, {"Content-Type":"text/html;charset=utf8"});
        res.write('<h1>검색 실패.</h1>');
        res.end();
    }    
}
*/

const show = async (req, res) => {
    console.log('admin/list/show 패스로 GET 요청됨.');

    const adminSession = req.session.admin;
    console.log(adminSession);
    //const session = req.session.passport; -> 이거는 유저 페이지에 조회 시 사용..
    if (adminSession) {
        console.log('관리자 로그인 정보가 있습니다.');
    }
    else {
        console.log('관리자 로그인 정보가 없습니다.');
        res.redirect('/public/login.html');
        return;
    }
    
    const userCode = req.params.userCode;
    const response = await attendance.getHistory(userCode);
    console.log(response);
    if (response.result) {
        console.log(response.getList);
        const context = {
            userCode: userCode,
            results: response.getList
        };
        req.app.render('show', context, function(err, html) {
            if(err) {
                console.error('뷰 렌더링 중 에러 발생 : ' + err.stack);
                console.log('에러 발생.');

                res.writeHead(200, {"Content-Type":"text/html;charset=utf8"});
                res.write('<h1>뷰 렌더링 중 에러 발생</h1>');
                res.write('<br><p>' + err.stack + '<p>');
                res.end();
                return;
            }
        
            res.writeHead(200, {"Content-Type":"text/html;charset=utf8"});
            res.end(html);
        });              
    } else {
        console.log('에러 발생.');
        res.writeHead(200, {"Content-Type":"text/html;charset=utf8"});
        res.write('<h1>검색 실패.</h1>');
        res.end();
    }    
}

const showHistory = async (req, res) => {
    console.log('admin/list/show 패스로 POST 요청됨.');

    const response = await attendance.getHistoryAll();
    res.send(response.getLists);
    return;
}

const logout = async (req, res) => {
    console.log('admin/logout 패스로 GET 요청됨.');

    req.session.destroy(function(err){
        if(err){
            console.log(err);
        }else{
            res.redirect('/');
        }
    })
}

module.exports.adminLogin = adminLogin;
module.exports.admin = admin;
module.exports.list = list;
module.exports.show = show;
module.exports.showHistory = showHistory;
module.exports.logout = logout;