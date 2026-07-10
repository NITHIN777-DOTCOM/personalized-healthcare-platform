# ==========================================
# Production Dockerfile for Express API
# Multi-stage build for size and security
# ==========================================

# Stage 1: Build compilation
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run prisma:generate
RUN npm run build

# Stage 2: Runtime image execution
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --only=production
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
RUN npm run prisma:generate

EXPOSE 5000
USER node
CMD ["node", "dist/server.js"]
