const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: process.env.PGPORT,
});

// Initialize database tables
const initDb = async () => {
  try {
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

    console.log('Database initialized successfully');
  } catch (err) {
    console.error('Database initialization error:', err);
  }
};

module.exports = {
  query: (text, params) => pool.query(text, params),
  initDb
};
