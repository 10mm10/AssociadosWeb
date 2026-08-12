const mysql = require("mysql2/promise");

const DB_CONFIG = {
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  timezone: 'Z',
};

const pool = mysql.createPool(DB_CONFIG);

module.exports = pool;