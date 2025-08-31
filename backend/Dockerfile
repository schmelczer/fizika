# Multi-stage Dockerfile for Fizika Admin Backend
FROM node:18-alpine AS base

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create app directory
WORKDIR /usr/src/app

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S fizika -u 1001

# Copy package files
COPY package*.json ./

# Development stage
FROM base AS dependencies

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Development dependencies for building
FROM base AS dev-dependencies
RUN npm ci

# Production stage
FROM base AS production

# Copy production dependencies
COPY --from=dependencies /usr/src/app/node_modules ./node_modules

# Copy application code
COPY --chown=fizika:nodejs . .

# Create necessary directories and set permissions
RUN mkdir -p /usr/src/app/data /usr/src/app/pics && \
    chown -R fizika:nodejs /usr/src/app/data /usr/src/app/pics

# Security: Remove package files and any other sensitive data
RUN rm -f package*.json

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3001

# Expose port
EXPOSE 3001

# Switch to non-root user
USER fizika

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3001/api/fizika', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) }).on('error', () => process.exit(1))"

# Use dumb-init for proper signal handling
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["node", "server.js"]