# Portfolio Blog Backend

This backend provides a comment API for the portfolio blog, with Google OAuth authentication and SQLite persistence.

## Features
- Google login (OAuth2, JWT)
- Threaded comments (with replies)
- Only authenticated users can comment
- Only comment author or admin can delete
- SQLite database
- CORS enabled for frontend

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Set up `.env` (see `.env` in this folder for required variables).
3. Start the server:
   ```bash
   npm start
   ```

## API Endpoints

- `POST /api/login` — Exchange Google ID token for JWT
- `GET /api/comments?post=POST_ID` — List comments for a post
- `POST /api/comments` — Add comment (auth required)
- `DELETE /api/comments/:id` — Delete comment (author or admin only)

## Docker

This backend can be run in Docker. See `docker-compose.yml` at project root.
