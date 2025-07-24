# Multi-stage production Dockerfile for StarQuest Backend
# Stage 1: Build
FROM node:18-alpine AS build

# Set working directory
WORKDIR /app

# Copy package files for dependency installation
COPY package.json package-lock.json tsconfig.json ./

# Install all dependencies (including devDependencies for build)
RUN npm ci && npm cache clean --force

# Copy source code
COPY src/ ./src/

# Build the TypeScript application
RUN npm run build

# Stage 2: Production Runtime
FROM node:18-alpine AS production

# Install dumb-init and curl for proper signal handling and health checks
RUN apk add --no-cache dumb-init curl

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S starquest -u 1001 -G nodejs

# Set working directory
WORKDIR /app

# Set production environment
ENV NODE_ENV=production
ENV PORT=6550

# Copy package files
COPY package.json package-lock.json ./

# Install only production dependencies
RUN npm ci --only=production && \
    npm cache clean --force && \
    rm -rf /tmp/* /var/tmp/* /usr/share/man /usr/share/doc

# Copy built application from build stage
COPY --from=build /app/dist ./dist

# Copy .env.production for production configuration
COPY .env.production ./

# Create logs directory
RUN mkdir -p logs

# Change ownership to non-root user
RUN chown -R starquest:nodejs /app
USER starquest

# Expose the port
EXPOSE 6550

# Health check for container orchestration using curl
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD curl -f http://localhost:6550/health || exit 1

# Use dumb-init for proper signal handling
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["node", "dist/server.js"] 