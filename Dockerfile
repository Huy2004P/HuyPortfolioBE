# Use official Node.js alpine image as builder
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy source files
COPY . .

# Release stage (keeps the image lightweight and clean)
FROM node:20-alpine

WORKDIR /usr/src/app

# Copy built node_modules and source files from builder
COPY --from=builder /usr/src/app .

# Expose backend port
EXPOSE 5000

# Set environment variables
ENV NODE_ENV=production

# Command to run the backend service
CMD ["npm", "start"]
