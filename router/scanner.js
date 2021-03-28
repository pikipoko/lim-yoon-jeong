

var scanner = function(req, res) {
    console.log('/scanner 패스로 GET 요청됨.');

    res.render('scanner');
}

module.exports.scanner = scanner;