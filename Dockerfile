# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

# Copy root workspace files
COPY package*.json turbo.json tsconfig.json ./

# Copy package files for each workspace
COPY packages/types/package.json ./packages/types/
COPY packages/types/tsconfig.json ./packages/types/
COPY packages/styles/package.json ./packages/styles/
COPY apps/api/package.json ./apps/api/
COPY apps/api/tsconfig.json ./apps/api/

# Copy source files
COPY packages/types/src ./packages/types/src/
COPY apps/api/src ./apps/api/src/

# Install dependencies (more resilient than npm ci)
RUN npm install --ignore-scripts

# Build types package first
RUN npm run build -w @user-management-system/types

# Build API package
RUN npm run build -w api

# Production stage
FROM node:22-alpine AS production

WORKDIR /app

# Copy compiled API from builder
COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/node_modules ./node_modules

# Copy package.json for reference
COPY apps/api/package.json ./

# Set production environment
ENV NODE_ENV=production

# Expose port
EXPOSE 3001

# Start the server
CMD ["node", "dist/index.js"]