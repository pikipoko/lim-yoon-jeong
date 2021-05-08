

const recognition = (req, res) => {
    console.log('/process/recognition으로 POST 요청됨.');

    const { spawn } = require('child_process');
    const pyLibrary = spawn('python', ['lib/test.py', 'afwfseg', 'lim-yoon-jeong']);

    pyLibrary.stdout.on('data', (result) => {
        console.log(result.toString());
        res.write(result);
    });

    pyLibrary.stderr.on('data', (result) => {
        console.log(result.toString());
        res.write(result);
    });
}

module.exports.recognition = recognition;