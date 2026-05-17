// Database connection configuration
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Create connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'maniamu07',
  database: process.env.DB_NAME || 'student_task_system',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: process.env.DB_SSL === 'true' ? (() => {
    const certPath = path.join(__dirname, 'isrgrootx1.pem');
    const hasCert = fs.existsSync(certPath);
    if (!hasCert) {
      console.warn('⚠️ Warning: isrgrootx1.pem certificate not found at ' + certPath + '. Connecting without specific CA certificate.');
    }
    return {
      minVersion: 'TLSv1.2',
      ca: hasCert ? fs.readFileSync(certPath) : undefined,
      rejectUnauthorized: true
    };
  })() : undefined
});

module.exports = pool;
