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

1. Start the entire stack using Docker Compose:

```bash
docker-compose up -d
```

This will start:
- PostgreSQL database on port 5432
- Backend API server on port 4000
- Nginx server for the frontend on port 8080

2. Access the website at: http://localhost:8080/

Thank you for visiting my portfolio website!