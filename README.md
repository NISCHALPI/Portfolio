# Mathematics PhD Portfolio Website

Welcome to my portfolio website! This site showcases my academic journey, research contributions, and professional achievements as a Mathematics PhD. Below, you'll find an overview of the content available on the website:

## About Me
Learn more about my background, education, and passion for mathematics.

## Research
Explore my research interests, publications, and ongoing projects.

## Teaching
Discover my teaching philosophy, courses taught, and student resources.

## Blog
Read my thoughts and insights on various mathematical topics, complete with interactive comments.

## Contact
Feel free to reach out to me for collaborations, questions, or networking opportunities.

## Technical Features

### Comment System

The blog features a PostgreSQL-powered comment system with the following capabilities:
- Persistent storage of comments across sessions
- Threaded comment replies
- Unique comments per blog post
- User-friendly interface with real-time validation

### Running the Website

To run the complete website with the comment system:

1. Set up and start the PostgreSQL database
   ```bash
   # Install PostgreSQL if needed
   # Create a database named 'portfolio'
   ```

2. Start the backend server:
   ```bash
   cd backend
   npm install
   npm start
   ```

3. Serve the frontend:
   ```bash
   # Using Python's built-in HTTP server (or any other simple HTTP server)
   python3 -m http.server 8080
   # OR using Node.js http-server (install with: npm install -g http-server)
   # http-server -p 8080
   ```

4. Access the website at: http://localhost:8080/

Thank you for visiting my portfolio website!