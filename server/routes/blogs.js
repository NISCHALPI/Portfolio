const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');
const matter = require('gray-matter');  // For parsing frontmatter
const { getBlogCache } = require('../services/blogWatcher');

// Path to the markdown files
const markdownDir = path.join(__dirname, '../../public/blog/markdown');

// Get all blog posts from the cache
router.get('/', async (req, res) => {
  try {
    const blogCache = getBlogCache();
    
    // Check if the cache is initialized
    if (!blogCache.isInitialized) {
      return res.status(503).json({ error: 'Blog cache is still initializing, please try again shortly' });
    }
    
    res.json(blogCache.posts);
  } catch (error) {
    console.error('Error getting blog posts:', error);
    res.status(500).json({ error: 'Failed to get blog posts' });
  }
});

// Get a specific blog post by file name
router.get('/:filename', async (req, res) => {
  try {
    const requestedFilename = req.params.filename;
    const blogCache = getBlogCache();
    
    // First try to find the post in the cache for better performance
    if (blogCache.isInitialized) {
      const cachedPost = blogCache.posts.find(post => post.file === `./markdown/${requestedFilename}`);
      if (cachedPost) {
        // If we found it in the cache, still need to get the content from the file
        const filePath = path.join(markdownDir, requestedFilename);
        const content = await fs.readFile(filePath, 'utf-8');
        const { content: markdownContent } = matter(content);
        
        return res.json({
          metadata: {
            title: cachedPost.title,
            date: cachedPost.date,
            author: cachedPost.author,
            tags: cachedPost.tags,
            image: cachedPost.image,
            description: cachedPost.description,
            featured: cachedPost.featured
          },
          content: markdownContent
        });
      }
    }
    
    // If not in cache or cache not initialized, read from file directly
    const filePath = path.join(markdownDir, requestedFilename);
    const content = await fs.readFile(filePath, 'utf-8');
    
    // Parse frontmatter
    const { data, content: markdownContent } = matter(content);
    
    // Handle image path - ensure it starts with "../../assets/images/" if provided
    if (data.image) {
      if (!data.image.includes('../../assets/images/')) {
        if (data.image.startsWith('/')) {
          data.image = `../../assets/images${data.image}`;
        } else {
          data.image = `../../assets/images/${data.image}`;
        }
      }
    } else {
      // Default to "math-bg.jpg" if no image is provided
      data.image = '../../assets/images/math-bg.jpg';
    }
    
    res.json({
      metadata: data,
      content: markdownContent
    });
  } catch (error) {
    console.error('Error getting blog post:', error);
    res.status(404).json({ error: 'Blog post not found' });
  }
});

module.exports = router;
