const { Pool } = require("pg");

const pool = new Pool({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: process.env.PGPORT,
  // Adding connection timeout to handle initial connection attempts more gracefully
  connectionTimeoutMillis: 5000, // 5 seconds
  idleTimeoutMillis: 30000, // 30 seconds
});

// Initialize database tables
const initDb = async () => {
  try {
    // Attempt to connect to the database to ensure it's reachable before creating tables
    const client = await pool.connect();
    console.log("Successfully connected to PostgreSQL for initialization.");
    client.release();

    // Create comments table if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS comments (
        id VARCHAR(36) PRIMARY KEY,
        post_id VARCHAR(255) NOT NULL,
        parent_id VARCHAR(36) DEFAULT NULL,
        author VARCHAR(100) NOT NULL,
        email VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_parent 
          FOREIGN KEY(parent_id) 
          REFERENCES comments(id)
          ON DELETE CASCADE
      )
    `);
    
    // Create index for faster comment retrieval by post
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id)
    `);

    console.log("Database initialized successfully");
  } catch (err) {
    console.error("Database initialization error:", err);
    // Re-throw the error to be caught by the calling function in server.js
    // This will allow the application to exit if the database cannot be initialized.
    throw err;
  }
};

module.exports = {
  query: (text, params) => pool.query(text, params),
  initDb
};

