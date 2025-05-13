# Portfolio Blog Backend

This backend provides a comment API for the portfolio blog with PostgreSQL persistence.

## Features
- Threaded comments (with replies)
- Anonymous commenting (name and email required)
- PostgreSQL database for persistent storage
- Comment threading with parent-child relationships
- CORS enabled for frontend

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Set up `.env` with the following variables:
   ```
   PORT=4000
   PGUSER=postgres
   PGHOST=db
   PGPASSWORD=password
   PGDATABASE=portfolio
   PGPORT=5432
   ```
3. Start the server:
   ```bash
   npm start
   ```

## API Endpoints

- `GET /api/comments/:postId` — List comments for a post
- `POST /api/comments` — Add comment (no auth required)
  - Required body: `{ postId, author, email, content, parentId? }`
- `DELETE /api/comments/:id` — Delete comment (admin use only)

## Database Schema

The database uses a single table for comments with self-referencing for replies:

```sql
CREATE TABLE comments (
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
```

## Docker

This backend should be run in Docker using the provided Dockerfile and the docker-compose.yml at the project root.
