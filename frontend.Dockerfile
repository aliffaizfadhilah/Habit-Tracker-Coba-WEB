# Frontend Dockerfile - React / TypeScript (Node.js 24)

# Stage 1: Development (Vite dev server)
FROM node:24-alpine AS dev

WORKDIR /app
COPY frontend/package*.json ./
RUN npm install
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

# Stage 2: Build
FROM node:24-alpine AS builder

WORKDIR /app
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ .
RUN npm run build

# Stage 3: Serve (Production)
FROM nginx:alpine

COPY --from=builder /app/dist /var/www/frontend
COPY nginx/default.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
