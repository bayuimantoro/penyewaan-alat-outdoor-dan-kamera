import mysql, { Pool } from 'mysql2/promise';

// Create the connection pool. The pool-specific settings are the defaults
const poolConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root123',
    database: process.env.DB_NAME || 'rental_outdoor',
    waitForConnections: true,
    connectionLimit: 10,
    maxIdle: 10,
    idleTimeout: 60000,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
};

let pool: Pool;

if (process.env.NODE_ENV === 'production') {
    pool = mysql.createPool(poolConfig);
} else {
    // Cast strict global type to allow attaching mysqlPool
    const globalWithPool = globalThis as any;

    if (!globalWithPool.mysqlPool) {
        globalWithPool.mysqlPool = mysql.createPool(poolConfig);
    }
    pool = globalWithPool.mysqlPool;
}

export default pool;
