# Use an official Node.js runtime as a parent image
FROM node:18-alpine AS builder

# Install PostgreSQL client for pg_isready (used by wait-for-postgres.sh)
# Also install netcat-openbsd as a fallback if pg_isready is not preferred for some reason, though pg_isready is better.
# Alpine Linux uses apk for package management.
RUN apk add --no-cache postgresql-client netcat-openbsd

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy the wait script first and make it executable
COPY wait-for-postgres.sh .
RUN chmod +x ./wait-for-postgres.sh

# Copy root package.json and package-lock.json (if available)
COPY package*.json ./

# Copy server package.json and package-lock.json (if available)
COPY server/package*.json ./server/

# Install project dependencies
# This will also trigger the "postinstall" script in the root package.json,
# which installs server dependencies.
RUN npm install --legacy-peer-deps

# Copy the rest of the application code
COPY . .

# Application listens on port 4000
EXPOSE 4000

# Define the command to run the application
# The wait-for-postgres.sh script will be called by docker-compose
# The original command was: CMD [ "npm", "start" ]
# This CMD will be overridden by the command in docker-compose.yml
CMD [ "npm", "start" ]

