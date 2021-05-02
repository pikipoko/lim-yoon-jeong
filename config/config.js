module.exports = {
    server_port:3300,
    db_url:'',
    db_schemas: [],
    route_info: [
        {file:'./scanner', path:'/', method:'scanner', type:'get'},
        {file:'./attendance', path:'/process/submit', method:'submit', type:'post'}
    ]                           
};