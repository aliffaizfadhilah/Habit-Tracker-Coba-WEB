# Frontend Dockerfile - React / TypeScript (Node.js 24)
# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY frontend/package*.json ./
RUN npm install

# Build production assets
COPY frontend/ .
RUN npm run build

# Stage 2: Serve
FROM nginx:alpine

# Copy built assets to Nginx
COPY --from=builder /app/dist /var/www/frontend

# Custom Nginx configuration
COPY nginx/default.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
