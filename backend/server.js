require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./db');
const commentsRoutes = require('./routes/comments');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// API routes
app.get('/', (req, res) => {
  res.json({ message: 'API server running with PostgreSQL database for comments' });
});

// Comments routes
app.use('/api/comments', commentsRoutes);

// Initialize database before starting server
db.initDb().then(() => {
  app.listen(PORT, () => {
    console.log(`Backend running on port ${PORT}`);
  });
}).catch(err => {
  console.error('Failed to initialize database:', err);
});
