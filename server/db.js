const mysql = require('mysql2/promise');

const db = mysql.createPool({
    host: 'localhost',
    user: 'admin',
    password: 'admin',
    database: 'labor',  // Your database name
});

// Test the database connection
(async () => {
    try {
        const connection = await db.getConnection();
        console.log('Connected to the MySQL database.');
        connection.release(); // Release the connection back to the pool
    } catch (error) {
        console.error('Error connecting to the MySQL database:', error.message);
    }
})();

module.exports = db;
