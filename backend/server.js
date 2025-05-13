require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');

const app = express();
const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;

const db = new sqlite3.Database('./backend/db.sqlite');
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

app.use(cors());
app.use(express.json());

// DB setup
function initDb() {
  db.run(`CREATE TABLE IF NOT EXISTS comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    post TEXT NOT NULL,
    parent_id INTEGER,
    author_name TEXT NOT NULL,
    author_email TEXT NOT NULL,
    text TEXT NOT NULL,
    date INTEGER NOT NULL,
    FOREIGN KEY(parent_id) REFERENCES comments(id)
  )`);
}
initDb();

// Auth middleware
function authRequired(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ error: 'No token' });
  try {
    req.user = jwt.verify(auth.slice(7), JWT_SECRET);
    next();
  } catch (e) {
    res.status(401).json({ error: 'Invalid token' });
  }
}

// Google login: exchange ID token for JWT
app.post('/api/login', async (req, res) => {
  const { id_token } = req.body;
  if (!id_token) return res.status(400).json({ error: 'Missing id_token' });
  try {
    const ticket = await googleClient.verifyIdToken({ idToken: id_token, audience: GOOGLE_CLIENT_ID });
    const payload = ticket.getPayload();
    const user = {
      name: payload.name,
      email: payload.email,
      picture: payload.picture
    };
    const token = jwt.sign(user, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user });
  } catch (e) {
    res.status(401).json({ error: 'Invalid Google token' });
  }
});

// Get comments for a post (threaded)
app.get('/api/comments', (req, res) => {
  const post = req.query.post;
  if (!post) return res.status(400).json({ error: 'Missing post param' });
  db.all('SELECT * FROM comments WHERE post = ? ORDER BY date ASC', [post], (err, rows) => {
    if (err) return res.status(500).json({ error: 'DB error' });
    // Build threaded structure
    const byId = {};
    rows.forEach(c => byId[c.id] = { ...c, replies: [] });
    const root = [];
    rows.forEach(c => {
      if (c.parent_id) {
        if (byId[c.parent_id]) byId[c.parent_id].replies.push(byId[c.id]);
      } else {
        root.push(byId[c.id]);
      }
    });
    res.json(root);
  });
});

// Add comment
app.post('/api/comments', authRequired, (req, res) => {
  const { post, text, parent_id } = req.body;
  if (!post || !text) return res.status(400).json({ error: 'Missing fields' });
  const stmt = db.prepare('INSERT INTO comments (post, parent_id, author_name, author_email, text, date) VALUES (?, ?, ?, ?, ?, ?)');
  stmt.run(post, parent_id || null, req.user.name, req.user.email, text, Date.now(), function(err) {
    if (err) return res.status(500).json({ error: 'DB error' });
    db.get('SELECT * FROM comments WHERE id = ?', [this.lastID], (err, row) => {
      if (err) return res.status(500).json({ error: 'DB error' });
      res.json(row);
    });
  });
});

// Delete comment (author or admin)
app.delete('/api/comments/:id', authRequired, (req, res) => {
  const id = req.params.id;
  db.get('SELECT * FROM comments WHERE id = ?', [id], (err, comment) => {
    if (err || !comment) return res.status(404).json({ error: 'Not found' });
    const isAdmin = req.user.email === ADMIN_EMAIL;
    const isAuthor = req.user.email === comment.author_email;
    if (!isAdmin && !isAuthor) return res.status(403).json({ error: 'Forbidden' });
    // Delete comment and all its replies recursively
    function deleteRecursive(cid, cb) {
      db.all('SELECT id FROM comments WHERE parent_id = ?', [cid], (err, children) => {
        if (err) return cb(err);
        let pending = children.length;
        if (!pending) return db.run('DELETE FROM comments WHERE id = ?', [cid], cb);
        children.forEach(child => {
          deleteRecursive(child.id, err => {
            if (--pending === 0) db.run('DELETE FROM comments WHERE id = ?', [cid], cb);
          });
        });
      });
    }
    deleteRecursive(id, err => {
      if (err) return res.status(500).json({ error: 'DB error' });
      res.json({ success: true });
    });
  });
});

app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
