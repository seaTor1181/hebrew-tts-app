# Use official Node.js runtime as base image
FROM node:18-slim

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy application files
COPY . .

# Expose port (Cloud Run will set PORT env variable)
EXPOSE 8080

# Set environment variable for production
ENV NODE_ENV=production

# Start the server
CMD ["npm", "start"]
