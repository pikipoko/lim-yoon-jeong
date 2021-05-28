const mysql = require('mysql2/promise');
require('dotenv').config();

let database = {};

database.init = (app) => {
    console.log('database_loader.init 호출됨.');

    const pool = mysql.createPool({
        "connectionLimit": 10,
        "host": process.env.DB_HOST,
        "user": process.env.DB_USER,
        "password": process.env.DB_PW,
        "database": process.env.DB_NAME,
        "debug": false
    });
    database.pool = pool;
    app.set('database', database);
}

module.exports = database;