const express = require('express');
const router = express.Router();
const db = require('../models/db');
const { v4: uuidv4 } = require('uuid');

// Get all comments for a specific post
router.get('/:postId', async (req, res) => {
  try {
    const { postId } = req.params;
    const result = await db.query(
      'SELECT * FROM comments WHERE post_id = $1 ORDER BY created_at ASC',
      [postId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching comments:', err);
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
});

// Create a new comment
router.post('/', async (req, res) => {
  try {
    const { postId, parentId, author, email, content } = req.body;
    
    if (!postId || !author || !content) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const id = uuidv4();
    const result = await db.query(
      `INSERT INTO comments (id, post_id, parent_id, author, email, content) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [id, postId, parentId || null, author, email || '', content]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating comment:', err);
    res.status(500).json({ error: 'Failed to create comment' });
  }
});

// Delete a comment
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM comments WHERE id = $1', [id]);
    res.json({ message: 'Comment deleted successfully' });
  } catch (err) {
    console.error('Error deleting comment:', err);
    res.status(500).json({ error: 'Failed to delete comment' });
  }
});

module.exports = router;
