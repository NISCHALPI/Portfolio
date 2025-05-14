const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const express = require('express');
const cors = require('cors');
const db = require('./models/db');
const commentsRoutes = require('./routes/comments');
const blogsRoutes = require('./routes/blogs');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, '../public')));

// API routes
app.get('/', (req, res) => {
  res.json({ message: 'API server running with PostgreSQL database for comments' });
});

// API routes
app.use('/api/comments', commentsRoutes);
app.use('/api/blogs', blogsRoutes);

// Initialize database before starting server
db.initDb().then(() => {
  app.listen(PORT, () => {
    console.log(`Backend running on port ${PORT}`);
    console.log(`Database connected successfully`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`Using PostgreSQL at ${process.env.PGHOST}:${process.env.PGPORT}`);
    console.log(`Environment variables loaded:`, {
      PORT: process.env.PORT,
      PGUSER: process.env.PGUSER,
      PGHOST: process.env.PGHOST,
      PGDATABASE: process.env.PGDATABASE,
      PGPORT: process.env.PGPORT,
      // PGPASSWORD intentionally not logged for security
    });
  });
}).catch(err => {
  console.error('Failed to initialize database:', err);
  console.error('Check your PostgreSQL connection settings in the .env file');
  process.exit(1); // Exit with error
});
