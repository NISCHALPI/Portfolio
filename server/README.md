# Portfolio Blog Backend

This backend provides a comment API for the portfolio blog with PostgreSQL persistence.

## Features
- Threaded comments (with replies)
- Anonymous commenting (name and email required)
- PostgreSQL database for persistent storage
- Comment threading with parent-child relationships
- CORS enabled for frontend

## Prerequisites
- Node.js (v18 or higher recommended)
- PostgreSQL (v15 or higher recommended)

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Set up a PostgreSQL database named `portfolio`

3. Create a `.env` file with the following variables:
   ```
   PORT=4000
   PGUSER=postgres
   PGHOST=localhost
   PGPASSWORD=password
   PGDATABASE=portfolio
   PGPORT=5432
   ```
   (Adjust the PostgreSQL connection details to match your local configuration)

4. Start the server:
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
