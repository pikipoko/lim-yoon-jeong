

const scanner = (req, res) => {
    console.log('/ 패스로 GET 요청됨.');

    //res.render('scanner');
    //res.render('attendanceTest');//테스트 중
    res.render('faceRecognitionTest');
}

module.exports.scanner = scanner;