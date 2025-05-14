const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');
const matter = require('gray-matter');  // For parsing frontmatter

// Path to the markdown files
const markdownDir = path.join(__dirname, '../../public/blog/markdown');

// Get all blog posts from markdown files
router.get('/', async (req, res) => {
  try {
    // Read all files from the markdown directory
    const files = await fs.readdir(markdownDir);
    
    // Filter for markdown files only
    const markdownFiles = files.filter(file => file.endsWith('.md'));
    
    // Process each file to extract frontmatter
    const postsPromises = markdownFiles.map(async (file) => {
      const filePath = path.join(markdownDir, file);
      const content = await fs.readFile(filePath, 'utf-8');
      
      // Parse frontmatter
      const { data, content: markdownContent } = matter(content);
      
      // Check if all required fields are present
      const requiredFields = ['title', 'date', 'author', 'tags', 'description'];
      const hasAllRequiredFields = requiredFields.every(field => {
        return data[field] !== undefined && data[field] !== null && data[field] !== '';
      });
      
      // Skip this post if it doesn't have all required fields
      if (!hasAllRequiredFields) {
        console.log(`Skipping post ${file} because it's missing required fields`);
        return null;
      }
      
      // Handle image path - ensure it starts with "../../assets/images/" if provided
      // Default to "math-bg.jpg" if no image is provided
      let imagePath = data.image ? data.image : '../../assets/images/math-bg.jpg';
      
      // If image path is provided but doesn't include the correct prefix
      if (imagePath && !imagePath.includes('../../assets/images/')) {
        if (imagePath.startsWith('/')) {
          imagePath = `../../assets/images${imagePath}`;
        } else {
          imagePath = `../../assets/images/${imagePath}`;
        }
      }
      
      // Create a post object with metadata from frontmatter
      const post = {
        title: data.title,
        date: data.date,
        author: data.author,
        tags: data.tags,
        image: imagePath,
        description: data.description,
        file: `./markdown/${file}`,
        featured: data.featured || false
      };
      
      return post;
    });
    
    // Wait for all promises and filter out null values (posts that were skipped)
    const posts = (await Promise.all(postsPromises)).filter(post => post !== null);
    
    // Sort posts by date (newest first)
    posts.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateB - dateA;
    });
    
    // Determine featured post - either the most recent post marked as featured,
    // or just the most recent post if none are marked as featured
    const featuredPosts = posts.filter(post => post.featured);
    if (featuredPosts.length > 0) {
      // If multiple posts are marked as featured, pick the most recent one
      featuredPosts.sort((a, b) => new Date(b.date) - new Date(a.date));
      const featuredPost = featuredPosts[0];
      featuredPost.featured = true;
      
      // Ensure other posts are not marked as featured
      posts.forEach(post => {
        if (post !== featuredPost) {
          post.featured = false;
        }
      });
    } else if (posts.length > 0) {
      // If no posts are marked as featured, mark the most recent one as featured
      posts[0].featured = true;
    }
    
    res.json(posts);
  } catch (error) {
    console.error('Error getting blog posts:', error);
    res.status(500).json({ error: 'Failed to get blog posts' });
  }
});

// Get a specific blog post by file name
router.get('/:filename', async (req, res) => {
  try {
    const filePath = path.join(markdownDir, req.params.filename);
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
