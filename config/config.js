module.exports = {
    server_port:3300,
    route_info: [
        {file:'./scanner', path:'/', method:'scanner', type:'get'},
        {file:'./attendance', path:'/process/submit', method:'submit', type:'post'},
        {file:'./attendance', path:'/process/listAll', method:'listAll', type:'post'},
        {file:'./faceRecognition', path:'/process/recognition', method:'recognition', type:'post'}
    ]                           
};