

const recognition = (req, res) => {
    console.log('/process/recognition으로 POST 요청됨.');

    const { spawn } = require('child_process');
    const pyLibrary = spawn('python', ['lib/FaceRecognition.py']);

    pyLibrary.stdout.on('data', (result) => {
        console.log(result.toString());
        res.write(result);
        res.end();
    });

    pyLibrary.stderr.on('data', (result) => {
        console.log(result.toString());
        res.write(result);
        res.end();
    });
}

module.exports.recognition = recognition;