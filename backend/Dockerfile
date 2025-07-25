# Build stage
FROM node:22-alpine AS builder

# Install pnpm
RUN corepack enable && corepack prepare pnpm@9 --activate

# Set working directory
WORKDIR /app

# Copy workspace root files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Copy package.json files for all workspace packages
COPY backend/package.json ./backend/
COPY packages/prisma/package.json ./packages/prisma/
COPY packages/shared/package.json ./packages/shared/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code (excluding node_modules via .dockerignore)
COPY backend/src/ ./backend/src/
COPY backend/tsconfig.json ./backend/
COPY backend/webpack.config.mjs ./backend/
COPY packages/ ./packages/

# Generate Prisma client
RUN cd packages/prisma && pnpm run db:generate

# Build the backend
RUN cd backend && pnpm run build

# Production stage
FROM node:22-alpine AS production

# Create app directory
WORKDIR /app

# Copy built application
COPY --from=builder /app/backend/dist ./backend/dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/prisma/client ./packages/prisma/client

# Expose port
EXPOSE 3000

# Set NODE_ENV
ENV NODE_ENV=production

# Health check
HEALTHCHECK --interval=90s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) }).on('error', () => process.exit(1))"

# Start the application
CMD ["node", "backend/dist/src/index.js"] 