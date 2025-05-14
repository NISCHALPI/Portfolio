const fs = require('fs').promises;
const path = require('path');
const chokidar = require('chokidar');
const matter = require('gray-matter');

// In-memory cache of processed blog posts
let blogCache = {
  posts: [],
  lastUpdated: null,
  isInitialized: false
};

// Path to the markdown files
const markdownDir = path.join(__dirname, '../../public/blog/markdown');

// Process a single markdown file and extract blog post data
async function processMarkdownFile(file) {
  try {
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
  } catch (error) {
    console.error(`Error processing markdown file ${file}:`, error);
    return null;
  }
}

// Process all markdown files and update the cache
async function updateBlogCache() {
  try {
    console.log('Updating blog cache...');
    
    // Read all files from the markdown directory
    const files = await fs.readdir(markdownDir);
    
    // Filter for markdown files only
    const markdownFiles = files.filter(file => file.endsWith('.md'));
    
    // Process each file to extract frontmatter
    const postsPromises = markdownFiles.map(processMarkdownFile);
    
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
    
    // Update the cache
    blogCache.posts = posts;
    blogCache.lastUpdated = new Date();
    blogCache.isInitialized = true;
    
    console.log(`Blog cache updated: ${posts.length} posts loaded`);
  } catch (error) {
    console.error('Error updating blog cache:', error);
  }
}

// Initialize blog watcher
function initBlogWatcher() {
  // First, load all blog posts
  updateBlogCache();
  
  // Set up file watcher
  const watcher = chokidar.watch(markdownDir, {
    ignored: /(^|[\/\\])\../, // ignore dotfiles
    persistent: true
  });
  
  // Watch for file changes
  watcher
    .on('add', path => {
      console.log(`Blog post added: ${path}`);
      updateBlogCache();
    })
    .on('change', path => {
      console.log(`Blog post changed: ${path}`);
      updateBlogCache();
    })
    .on('unlink', path => {
      console.log(`Blog post deleted: ${path}`);
      updateBlogCache();
    });
  
  console.log(`Blog watcher initialized. Watching ${markdownDir} for changes`);
  
  // Also set up an interval to check for changes every 5 minutes as a fallback
  // This ensures we catch any changes that might be missed by the watcher
  setInterval(() => {
    console.log('Running scheduled blog cache update...');
    updateBlogCache();
  }, 5 * 60 * 1000); // 5 minutes in milliseconds
  
  return blogCache;
}

module.exports = {
  initBlogWatcher,
  getBlogCache: () => blogCache
};
