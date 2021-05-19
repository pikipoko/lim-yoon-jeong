module.exports = {
    server_port:3300,
    admin_id:'lim-yoon-jeong',
    admin_password:'2021',
    route_info: [
        {file:'./index', path:'/', method:'index', type:'get'},
        {file:'./admin', path:'/admin', method:'adminLogin', type:'post'},
        {file:'./admin', path:'/admin/list', method:'list', type:'get'},
        {file:'./admin', path:'/admin/show', method:'show', type:'get'},
        {file:'./admin', path:'/admin/show', method:'showHistory', type:'post'},
        {file:'./attendance', path:'/process/submit', method:'submit', type:'post'},
        {file:'./attendance', path:'/process/listAll', method:'listAll', type:'post'},
        {file:'./faceRecognition', path:'/process/recognition', method:'recognition', type:'post'}
    ]                           
};