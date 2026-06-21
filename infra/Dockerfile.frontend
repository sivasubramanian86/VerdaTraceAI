# Multi-stage Dockerfile for React frontend serving via Nginx
# Stage 1: Build the React application
FROM node:20-slim AS build

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci

# Copy application source code and build
COPY . .
RUN npm run build

# Stage 2: Serve the production assets with Nginx
FROM nginx:alpine

# Copy build artifacts to Nginx public directory
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom nginx configuration to handle React Router client-side routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
